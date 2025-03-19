class DeploymentEnvironment {
    environmentName;
    static directoryMap = {
        production: 'prod',
        service: 'service',
        test: 'test',
        development: 'dev'
    };
    constructor(environmentName) {
        this.environmentName = environmentName;
    }
    getEnvironmentName() {
        return this.environmentName;
    }
    getDirectoryName() {
        const lowercaseEnv = this.environmentName.toLowerCase();
        return DeploymentEnvironment.directoryMap[lowercaseEnv] || lowercaseEnv;
    }
}
export { DeploymentEnvironment };
