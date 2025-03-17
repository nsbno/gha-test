import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as github from '@actions/github';
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';
export async function run() {
    try {
        const forceDeploy = core.getBooleanInput('force-deploy', { required: true });
        if (forceDeploy) {
            core.info('Force deploy is set to true. Skipping change detection.');
            core.setOutput('changes', '[]');
            return;
        }
        // Get all environments
        const environments = await getEnvironments();
        if (!environments) {
            core.setFailed('Failed to get environments');
            return;
        }
        const changedEnvironments = await checkTerraformChanges(environments);
        // Set the output with the list of changed environments
        core.setOutput('changes', JSON.stringify(changedEnvironments));
    }
    catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
        else {
            core.setFailed(`Unknown error: ${error}`);
        }
    }
}
async function getEnvironments() {
    const githubToken = core.getInput('githubToken');
    const octokit = github.getOctokit(githubToken);
    const { data } = await octokit.rest.repos.getAllEnvironments({
        ...github.context.repo
    });
    return data.environments?.map((environment) => environment.name);
}
async function checkTerraformChanges(environments) {
    const changedEnvironments = [];
    for (const env of environments) {
        core.startGroup(`Checking environment: ${env}`);
        try {
            const awsRegion = process.env.AWS_REGION || core.getInput('aws-region');
            const awsAccountId = process.env.AWS_ACCOUNT_ID || core.getInput('aws-account-id');
            const deploymentRole = process.env.AWS_DEPLOYMENT_ROLE_NAME || core.getInput('deployment-role');
            // Authenticate with AWS
            await configureAwsCredentials(awsRegion, awsAccountId, deploymentRole);
            // Get folder name (lowercase of environment)
            const folderName = env.toLowerCase();
            // Run terraform plan
            const hasChanges = await runTerraformPlan(`environments/${folderName}`);
            // Add notice
            if (hasChanges) {
                core.notice(`${env} has changes and will be deployed 🚀`, {
                    title: 'Changes to Terraform'
                });
                changedEnvironments.push(env);
            }
            else {
                core.notice(`${env} has no changes, and will not be deployed 💤`, {
                    title: 'Changes to Terraform'
                });
            }
        }
        catch (error) {
            core.warning(`Failed to check for changes in ${env}: ${error instanceof Error ? error.message : error}`);
        }
        core.endGroup();
    }
    return changedEnvironments;
}
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
async function runTerraformPlan(directory) {
    // First run terraform init
    await exec.exec('terraform', ['init'], { cwd: directory });
    // Run terraform plan with detailed exitcode
    try {
        await exec.exec('terraform', ['plan', '--refresh=false', '-detailed-exitcode'], {
            cwd: directory
        });
        // Exit code 0 means no changes
        return false;
    }
    catch (error) {
        const execError = error;
        // Exit code 2 means changes detected
        if (execError.code === 2) {
            return true;
        }
        // Any other exit code indicates an error
        throw new Error(`Terraform plan failed with exit code ${execError.code}`);
    }
}
run();
export { getEnvironments, checkTerraformChanges, configureAwsCredentials, runTerraformPlan };
