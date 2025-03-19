import { IRoleAssumptionService } from '../../ports/driver/RoleAssumptionService.js'

export class AssumeRole {
  private roleAssumptionService: IRoleAssumptionService

  constructor(roleAssumptionService: IRoleAssumptionService) {
    this.roleAssumptionService = roleAssumptionService
  }

  async execute(): Promise<void> {
    const accountId = process.env.AWS_ACCOUNT_ID
    const roleName = process.env.AWS_DEPLOYMENT_ROLE_NAME
    const sessionName = 'GitHubActionsSession'

    if (!accountId || !roleName) {
      throw new Error('Role ARN and session name are required')
    }

    await this.roleAssumptionService.assumeRole(
      accountId,
      roleName,
      sessionName
    )
  }
}
