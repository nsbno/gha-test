export class PerformTaskWithRole {
    roleAssumptionService;
    constructor(roleAssumptionService) {
        this.roleAssumptionService = roleAssumptionService;
    }
    async setEnvironmentWithRoleAndSession() {
        const accountId = process.env.AWS_ACCOUNT_ID;
        const roleName = process.env.AWS_ROLE_NAME;
        const sessionName = 'GitHubActionsSession';
        if (!accountId || !roleName) {
            throw new Error('Role ARN and session name are required');
        }
        const roleArn = `arn:aws:iam::${accountId}:role/${roleName}`;
        await this.roleAssumptionService.assumeRole(roleArn, sessionName);
    }
}
