import { ICodeRepository } from '../../ports/driven/CodeRepository.js'
import { DeploymentEnvironment } from '../domain/DeploymentEnvironment.js'

export class GetEnvironments {
  private codeRepository: ICodeRepository

  constructor(codeRepository: ICodeRepository) {
    this.codeRepository = codeRepository
  }

  async execute(): Promise<DeploymentEnvironment[]> {
    const environments = await this.codeRepository.getEnvironments()
    if (!environments) {
      throw new Error('Failed to get environments')
    }

    return environments
  }
}
