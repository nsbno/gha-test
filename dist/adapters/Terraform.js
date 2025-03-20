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
    try {
        let terraformOutput = '';
        let terraformError = '';
        const exitCode = await exec.exec('terraform', ['plan', '--refresh=false', '--detailed-exitcode'], {
            cwd: directory,
            ignoreReturnCode: true,
            listeners: {
                stdout: (data) => {
                    terraformOutput += data.toString();
                },
                stderr: (data) => {
                    terraformError += data.toString();
                }
            }
        });
        core.debug(`Terraform output: ${terraformOutput}`);
        core.debug(`Terraform stderr: ${terraformError}`);
        core.debug(`Terraform plan exit code: ${exitCode}`);
        switch (exitCode) {
            case 0:
                return false; // No changes
            case 2:
                return true; // Changes detected
            default:
                throw new Error(`Terraform plan failed with exit code ${exitCode}`);
        }
    }
    catch (error) {
        throw new Error(`Error executing terraform: ${error instanceof Error ? error.message : String(error)}`);
    }
}
