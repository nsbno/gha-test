import * as exec from '@actions/exec';
import * as core from '@actions/core';
import { configureAwsCredentials } from './Aws.js';
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
export { checkTerraformChanges, runTerraformPlan };
