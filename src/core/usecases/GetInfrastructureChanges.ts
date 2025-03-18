import { InfrastructureExecutor } from '../../ports/driver/InfrastructureExecutor.js'
import * as core from '@actions/core'

export class GetInfrastructureChanges {
  private infrastructurePlanner: InfrastructureExecutor

  constructor(infrastructureRepository: InfrastructureExecutor) {
    this.infrastructurePlanner = infrastructureRepository
  }

  async execute(currentEnvironmentDirectory: string): Promise<void> {
    const currentEnvironmentChanged = process.env.LIST_ENVIRONMENT_CHANGED || ''

    const hasChanged = await this.infrastructurePlanner.planInfrastructure(
      currentEnvironmentDirectory
    )

    if (hasChanged) {
      core.info(`${currentEnvironmentDirectory} has changes`)
      const newValue = `${currentEnvironmentChanged},${currentEnvironmentDirectory}`
      core.exportVariable('LIST_ENVIRONMENT_CHANGED', newValue)
      core.info(`The new value of LIST_ENVIRONMENT_CHANGED is ${newValue}`)
    }
  }
}
