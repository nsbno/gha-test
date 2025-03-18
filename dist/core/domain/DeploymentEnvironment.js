class DeploymentEnvironment {
    environmentName;
    constructor(environmentName) {
        this.environmentName = environmentName;
    }
    getEnvironmentName() {
        return this.environmentName;
    }
}
export { DeploymentEnvironment };
