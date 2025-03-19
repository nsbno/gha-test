import { jest } from '@jest/globals'
import * as core from '../../__fixtures__/core.js'
import * as stsClient from '../../__fixtures__/aws-sdk.js'
import * as exec from '../../__fixtures__/exec.js'
import * as github from '../../__fixtures__/github.js'
import { ExecOptions } from '@actions/exec'

jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@aws-sdk/client-sts', () => stsClient)
jest.unstable_mockModule('@actions/exec', () => exec)
jest.unstable_mockModule('@actions/github', () => github)

const { setupApplication } = await import('../../src/setup.js')

describe('getTerraformChanges', () => {
  beforeEach(() => {
    process.env.AWS_REGION = 'eu-west-1'
    process.env.AWS_ACCOUNT_ID = '123456789012'
    process.env.AWS_ROLE_NAME = 'deployment-trusted-role'

    stsClient.send.mockResolvedValue({
      $metadata: {},
      Credentials: {
        AccessKeyId: 'mockAccessKeyId',
        SecretAccessKey: 'mockSecretAccessKey',
        SessionToken: 'mockSessionToken',
        Expiration: new Date()
      }
    })

    exec.exec.mockImplementation(
      (command: string, args?: string[], options?: ExecOptions) => {
        if (command === 'terraform' && args && args[0] === 'init') {
          return Promise.resolve(0)
        }

        if (command === 'terraform' && args && args[0] === 'plan') {
          const directory = options?.cwd || ''
          // Simulate changes when directory contains 'test'
          if (directory.includes('environments/test')) {
            // Exit code 2 signals changes detected
            return Promise.reject({ code: 2 })
          }
          // Exit code 0 signals no changes
          return Promise.resolve(0)
        }

        return Promise.resolve(0)
      }
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should detect no changes across a specific environment', async () => {
    const { assumeRole, getInfraChanges } = setupApplication()

    await assumeRole.execute()
    await getInfraChanges.executeWithEnvDirectory('Production')

    // Verify terraform was executed with correct arguments
    expect(exec.exec).toHaveBeenCalledWith('terraform', ['init'], {
      cwd: 'environments/prod'
    })
    expect(exec.exec).toHaveBeenCalledWith(
      'terraform',
      ['plan', '--refresh=false', '-detailed-exitcode'],
      { cwd: 'environments/prod' }
    )

    // No changes detected, so exportVariable shouldn't be called
    expect(core.exportVariable).not.toHaveBeenCalled()
  })

  it('should detect changes in a specific environment', async () => {
    const { assumeRole, getInfraChanges } = setupApplication()

    await assumeRole.execute()
    await getInfraChanges.executeWithEnvDirectory('Test')

    // Verify terraform was executed with correct arguments
    expect(exec.exec).toHaveBeenCalledWith('terraform', ['init'], {
      cwd: 'environments/test'
    })
    expect(exec.exec).toHaveBeenCalledWith(
      'terraform',
      ['plan', '--refresh=false', '-detailed-exitcode'],
      { cwd: 'environments/test' }
    )

    expect(core.exportVariable).toHaveBeenCalledWith(
      'LIST_ENVIRONMENT_CHANGED',
      'Test'
    )
  })

  it('should detect changes in multiple environments', async () => {
    process.env.LIST_ENVIRONMENT_CHANGED = 'Stage'
    const { assumeRole, getInfraChanges } = setupApplication()

    await assumeRole.execute()
    await getInfraChanges.executeWithEnvDirectory('Test')

    expect(core.exportVariable).toHaveBeenCalledWith(
      'LIST_ENVIRONMENT_CHANGED',
      'Stage,Test'
    )
  })

  it('should handle invalid environment config', async () => {})

  it('developer using force-deploy true should skip all checks', async () => {})
})
