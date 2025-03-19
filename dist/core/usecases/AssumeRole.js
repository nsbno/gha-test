export class AssumeRole {
    roleAssumptionService;
    constructor(roleAssumptionService) {
        this.roleAssumptionService = roleAssumptionService;
    }
    async execute() {
        const accountId = process.env.AWS_ACCOUNT_ID;
        const roleName = process.env.AWS_DEPLOYMENT_ROLE_NAME;
        const sessionName = 'GitHubActionsSession';
        if (!accountId || !roleName) {
            throw new Error('Role ARN and session name are required');
        }
        await this.roleAssumptionService.assumeRole(accountId, roleName, sessionName);
    }
}
