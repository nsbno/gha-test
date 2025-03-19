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
        const exitCode = await exec.exec('terraform', ['plan', '--refresh=false', '--detailed-exitcode'], {
            cwd: directory
        });
        console.log(exitCode);
        if (exitCode === 0) {
            return false; // No changes
        }
        else if (exitCode === 2) {
            return true; // Changes detected
        }
        else {
            throw new Error(`Terraform plan failed with exit code ${exitCode}`);
        }
    }
    catch (error) {
        throw new Error(`Error executing terraform: ${error instanceof Error ? error.message : String(error)}`);
    }
}
