import * as core from '@actions/core'
import * as github from '@actions/github'
import { ICodeRepository } from '../ports/driven/CodeRepository.js'
import { DeploymentEnvironment } from '../core/domain/DeploymentEnvironment.js'

class GitHubRepository implements ICodeRepository {
  protected accessToken: string

  constructor() {
    this.accessToken = core.getInput('githubToken')
  }

  async getEnvironments(): Promise<DeploymentEnvironment[]> {
    if (!this.accessToken) {
      core.setFailed('GitHub token not found')
      return []
    }

    const octokit = github.getOctokit(this.accessToken)
    const { data } = await octokit.rest.repos.getAllEnvironments({
      ...github.context.repo
    })

    return (
      data.environments?.map(
        (environment) => new DeploymentEnvironment(environment.name)
      ) || []
    )
  }
}

export { GitHubRepository }
