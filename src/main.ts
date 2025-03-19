import * as core from '@actions/core'
import { setupApplication } from './setup.js'

const { getInfraChanges } = setupApplication()

export async function run(): Promise<void> {
  try {
    // await assumeRole.execute()

    const environment = core.getInput('environment', { required: true })

    await getInfraChanges.executeWithEnvDirectory(environment)
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed(`Unknown error: ${error}`)
    }
  }
}
