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
        let returnCode = 0;
        const options = {
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
        };
        try {
            await exec.exec('terraform', ['plan', '--refresh=false', '--detailed-exitcode'], {
                ...options,
                listeners: {
                    ...options.listeners,
                    stdline: (line) => {
                        core.debug(line);
                    }
                }
            });
        }
        catch (err) {
            if (err instanceof Error && 'code' in err) {
                returnCode = err.code;
            }
        }
        core.debug(`Terraform output: ${terraformOutput}`);
        core.debug(`Terraform stderr: ${terraformError}`);
        core.debug(`Terraform plan exit code: ${returnCode}`);
        return returnCode === 2;
    }
    catch (error) {
        throw new Error(`Error executing terraform: ${error instanceof Error ? error.message : String(error)}`);
    }
}
