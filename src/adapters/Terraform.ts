import * as exec from '@actions/exec'
import * as core from '@actions/core'
import { InfrastructureExecutor } from '../ports/driver/InfrastructureExecutor.js'

export class TerraformExecutor implements InfrastructureExecutor {
  async planInfrastructure(environment: string): Promise<boolean> {
    const folderName = environment.toLowerCase()
    try {
      return runTerraformPlan(`environments/${folderName}`)
    } catch (error) {
      core.setFailed(`Error checking Terraform changes: ${error}`)
      return false
    }
  }
}

async function runTerraformPlan(directory: string): Promise<boolean> {
  // First run terraform init
  await exec.exec('terraform', ['init'], { cwd: directory })
  try {
    let terraformOutput = ''
    let terraformError = ''
    let returnCode = 0

    const options: exec.ExecOptions = {
      cwd: directory,
      ignoreReturnCode: true,
      listeners: {
        stdout: (data: Buffer) => {
          terraformOutput += data.toString()
        },
        stderr: (data: Buffer) => {
          terraformError += data.toString()
        }
      }
    }

    try {
      await exec.exec(
        'terraform',
        ['plan', '--refresh=false', '--detailed-exitcode'],
        {
          ...options,
          listeners: {
            ...options.listeners,
            stdline: (line: string): void => {
              core.debug(line)
            }
          }
        }
      )
    } catch (err) {
      if (err instanceof Error && 'code' in err) {
        returnCode = (err as { code: number }).code
      }
    }

    core.debug(`Terraform output: ${terraformOutput}`)
    core.debug(`Terraform stderr: ${terraformError}`)
    core.debug(`Terraform plan exit code: ${returnCode}`)

    return returnCode === 2
  } catch (error) {
    throw new Error(
      `Error executing terraform: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
