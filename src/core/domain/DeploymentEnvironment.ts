class DeploymentEnvironment {
  private readonly environmentName: string

  constructor(environmentName: string) {
    this.environmentName = environmentName
  }

  getEnvironmentName(): string {
    return this.environmentName
  }
}

export { DeploymentEnvironment }
