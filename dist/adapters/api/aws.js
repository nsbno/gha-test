import * as core from '@actions/core';
import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts';
async function configureAwsCredentials(region, accountId, roleName) {
    const roleArn = `arn:aws:iam::${accountId}:role/${roleName}`;
    core.info(`Assuming role: ${roleArn} in region ${region}`);
    const stsClient = new STSClient({ region });
    const assumeRoleCommand = new AssumeRoleCommand({
        RoleArn: roleArn,
        RoleSessionName: 'GitHubActionsSession'
    });
    try {
        const response = await stsClient.send(assumeRoleCommand);
        console.log(response);
        if (!response.Credentials) {
            throw new Error('Failed to assume role');
        }
        const { AccessKeyId, SecretAccessKey, SessionToken } = response.Credentials;
        // Set AWS environment variables that Terraform will use
        process.env.AWS_REGION = region;
        process.env.AWS_ACCESS_KEY_ID = AccessKeyId;
        process.env.AWS_SECRET_ACCESS_KEY = SecretAccessKey;
        process.env.AWS_SESSION_TOKEN = SessionToken;
        core.info(`Assumed role: ${roleArn} in region ${region}`);
    }
    catch (error) {
        core.setFailed(`${error instanceof Error ? error.message : error}`);
    }
}
export { configureAwsCredentials };
