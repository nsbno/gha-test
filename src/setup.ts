import { AwsRoleAssumptionService } from './adapters/Aws.js'
import { STSClient } from '@aws-sdk/client-sts'
import { AssumeRole } from './core/usecases/AssumeRole.js'
import { GetInfrastructureChanges } from './core/usecases/GetInfrastructureChanges.js'
import { TerraformExecutor } from './adapters/Terraform.js'

export function setupApplication() {
  const stsClient = new STSClient({
    region: process.env.AWS_REGION || 'eu-west-1'
  })

  const roleAssumptionService = new AwsRoleAssumptionService(stsClient)
  const assumeRole = new AssumeRole(roleAssumptionService)

  const infraExecutionService = new TerraformExecutor()
  const getInfraChanges = new GetInfrastructureChanges(infraExecutionService)

  return { assumeRole, getInfraChanges }
}
