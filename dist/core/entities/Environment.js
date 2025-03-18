class CodeRepositoryEnvironment {
    environmentName;
    constructor(environmentName) {
        this.environmentName = environmentName;
    }
    getEnvironmentName() {
        return this.environmentName;
    }
}
export { CodeRepositoryEnvironment };
