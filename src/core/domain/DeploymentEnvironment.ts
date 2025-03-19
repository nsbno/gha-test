class DeploymentEnvironment {
  private readonly environmentName: string
  private static readonly directoryMap: Record<string, string> = {
    production: 'prod',
    service: 'service',
    test: 'test',
    development: 'dev'
  }

  constructor(environmentName: string) {
    this.environmentName = environmentName
  }

  getEnvironmentName(): string {
    return this.environmentName
  }

  getDirectoryName(): string {
    const lowercaseEnv = this.environmentName.toLowerCase()
    return DeploymentEnvironment.directoryMap[lowercaseEnv] || lowercaseEnv
  }
}

export { DeploymentEnvironment }
