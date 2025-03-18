import * as core from '@actions/core';
import * as github from '@actions/github';
import { DeploymentEnvironment } from '../core/domain/DeploymentEnvironment.js';
class GitHubRepository {
    accessToken;
    constructor() {
        this.accessToken = core.getInput('githubToken');
    }
    async getEnvironments() {
        if (!this.accessToken) {
            core.setFailed('GitHub token not found');
            return [];
        }
        const octokit = github.getOctokit(this.accessToken);
        const { data } = await octokit.rest.repos.getAllEnvironments({
            ...github.context.repo
        });
        return (data.environments?.map((environment) => new DeploymentEnvironment(environment.name)) || []);
    }
}
export { GitHubRepository };
