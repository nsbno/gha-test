import { DeploymentEnvironment } from '../../core/domain/DeploymentEnvironment.js'

interface ICodeRepository {
  getEnvironments(): Promise<DeploymentEnvironment[]>
}

export { ICodeRepository }
