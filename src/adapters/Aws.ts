import * as core from '@actions/core'
import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts'
import { IRoleAssumptionService } from '../ports/driver/RoleAssumptionService.js'

export class AwsRoleAssumptionService implements IRoleAssumptionService {
  private readonly stsClient: STSClient

  constructor(stsClient: STSClient) {
    this.stsClient = stsClient
  }

  async assumeRole(
    accountId: string,
    roleName: string,
    sessionName: string
  ): Promise<void> {
    core.info(
      `Assuming role with ${accountId} and name: ${roleName}, with session name: ${sessionName}`
    )
    const roleArn = `arn:aws:iam::${accountId}:role/${roleName}`

    const assumeRoleCommand = new AssumeRoleCommand({
      RoleArn: roleArn,
      RoleSessionName: sessionName
    })

    try {
      const response = await this.stsClient.send(assumeRoleCommand)
      if (!response.Credentials) {
        throw new Error('Failed to assume role')
      }

      const { AccessKeyId, SecretAccessKey, SessionToken } =
        response.Credentials

      // Set AWS environment variables that Terraform will use
      process.env.AWS_ACCESS_KEY_ID = AccessKeyId
      process.env.AWS_SECRET_ACCESS_KEY = SecretAccessKey
      process.env.AWS_SESSION_TOKEN = SessionToken

      core.info(`Assumed role: ${roleArn}, with session name: ${sessionName}`)
    } catch (error) {
      core.setFailed(`${error instanceof Error ? error.message : error}`)
    }
  }
}
