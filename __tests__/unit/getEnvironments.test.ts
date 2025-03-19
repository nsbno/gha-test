import { jest } from '@jest/globals'
import * as core from '../../__fixtures__/core.js'
import * as github from '../../__fixtures__/github.js'
import { mockOctokit } from '../../__fixtures__/github.js'

// Mock dependencies
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@actions/github', () => github)

const { GetEnvironmentsUseCase } = await import(
  '../../src/core/usecases/GetEnvironments.js'
)

describe('get environments', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    process.env.AWS_REGION = 'eu-west-1'
    process.env.AWS_ACCOUNT_ID = '123456789012'
    process.env.AWS_DEPLOYMENT_ROLE_NAME = 'deployment-trusted-role'

    mockOctokit.rest.repos.getAllEnvironments.mockReturnValue({
      data: {
        environments: [
          { name: 'Test' },
          { name: 'Stage' },
          { name: 'Production' }
        ]
      }
    })
    ;(github.getOctokit as jest.Mock).mockReturnValue(mockOctokit)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should get environments', async () => {
    const environments = ['Test', 'Stage', 'Production']
    const getGitHubEnvironments = await getEnvironments()

    expect(getGitHubEnvironments).toStrictEqual(environments)
  })
})
