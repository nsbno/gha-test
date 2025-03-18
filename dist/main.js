import * as core from '@actions/core';
import { setupApplication } from './setup.js';
const { assumeRole, getInfraChanges } = setupApplication();
export async function run() {
    try {
        await assumeRole.execute();
        const environment = core.getInput('environment', { required: true });
        await getInfraChanges.execute(environment);
    }
    catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
        else {
            core.setFailed(`Unknown error: ${error}`);
        }
    }
}
run();
