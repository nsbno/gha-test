import * as core from '@actions/core';
import { DeploymentEnvironment } from '../domain/DeploymentEnvironment.js';
export class GetInfrastructureChanges {
    infrastructurePlanner;
    constructor(infrastructureRepository) {
        this.infrastructurePlanner = infrastructureRepository;
    }
    async executeWithEnvDirectory(currentEnvironmentDirectory) {
        core.startGroup(`Getting changes for environment ${currentEnvironmentDirectory}`);
        const currentEnvironmentChanged = process.env.LIST_ENVIRONMENT_CHANGED || '';
        const mappedEnvironmentDirectory = new DeploymentEnvironment(currentEnvironmentDirectory).getDirectoryName();
        const hasChanged = await this.infrastructurePlanner.planInfrastructure(mappedEnvironmentDirectory);
        if (hasChanged) {
            core.info(`${currentEnvironmentDirectory} has changes`);
            const newValue = currentEnvironmentChanged != ''
                ? `${currentEnvironmentChanged},${currentEnvironmentDirectory}`
                : currentEnvironmentDirectory;
            core.exportVariable('LIST_ENVIRONMENT_CHANGED', newValue);
            core.info(`The new value of LIST_ENVIRONMENT_CHANGED is ${newValue}`);
        }
        core.endGroup();
    }
}
