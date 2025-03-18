import { DeploymentEnvironment } from './DeploymentEnvironment.js'

describe('Environment', () => {
  it('should return the name of the environment', () => {
    // Arrange
    const environmentName = 'production'
    const environment = new DeploymentEnvironment(environmentName)

    const result = environment.getEnvironmentName()

    expect(result).toBe(environmentName)
  })
})
