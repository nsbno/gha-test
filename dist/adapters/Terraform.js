import * as exec from '@actions/exec';
import * as core from '@actions/core';
export class TerraformExecutor {
    async planInfrastructure(environment) {
        const folderName = environment.toLowerCase();
        try {
            return runTerraformPlan(`environments/${folderName}`);
        }
        catch (error) {
            core.setFailed(`Error checking Terraform changes: ${error}`);
            return false;
        }
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
