import * as core from '@actions/core';
import * as github from '@actions/github';
import { CodeRepositoryEnvironment } from '../../core/domain/Environment.js';
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
        return (data.environments?.map((environment) => new CodeRepositoryEnvironment(environment.name)) || []);
    }
}
export { GitHubRepository };
