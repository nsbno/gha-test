import { jest } from '@jest/globals'
import * as core from '../../__fixtures__/core.js'
import * as stsClient from '../../__fixtures__/aws-sdk.js'

jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@aws-sdk/client-sts', () => stsClient)

const { configureAwsCredentials } = await import(
  '../../src/adapters/frameworks/Aws.js'
)

describe('Configure AWS Credentials', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.AWS_REGION = 'eu-west-1'
    process.env.AWS_ACCOUNT_ID = '123456789012'
    process.env.AWS_DEPLOYMENT_ROLE_NAME = 'deployment-trusted-role'
  })

  it('should assume the role and set environment variables', async () => {
    stsClient.send.mockResolvedValue({
      $metadata: {},
      Credentials: {
        AccessKeyId: 'mockAccessKeyId',
        SecretAccessKey: 'mockSecretAccessKey',
        SessionToken: 'mockSessionToken',
        Expiration: new Date()
      }
    })

    await configureAwsCredentials(
      process.env.AWS_REGION || '',
      process.env.AWS_ACCOUNT_ID || '',
      process.env.AWS_DEPLOYMENT_ROLE_NAME || ''
    )

    expect(core.info).toHaveBeenNthCalledWith(
      1,
      `Assuming role: arn:aws:iam::${process.env.AWS_ACCOUNT_ID}:role/${process.env.AWS_DEPLOYMENT_ROLE_NAME} in region ${process.env.AWS_REGION}`
    )
    expect(core.info).toHaveBeenNthCalledWith(
      2,
      `Assumed role: arn:aws:iam::${process.env.AWS_ACCOUNT_ID}:role/${process.env.AWS_DEPLOYMENT_ROLE_NAME} in region ${process.env.AWS_REGION}`
    )
  })

  it('should fail if assume role fails', async () => {
    stsClient.send.mockResolvedValue({
      $metadata: {},
      Credentials: undefined
    })
    await configureAwsCredentials(
      process.env.AWS_REGION || '',
      process.env.AWS_ACCOUNT_ID || '',
      process.env.AWS_DEPLOYMENT_ROLE_NAME || ''
    )
    expect(core.setFailed).toHaveBeenCalledWith('Failed to assume role')
  })
})
