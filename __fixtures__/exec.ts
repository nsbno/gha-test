import { jest } from '@jest/globals'
import { exec as actionsExec } from '@actions/exec'

export const exec = jest.fn<typeof actionsExec>()

jest.mock('@actions/exec', () => ({
  exec
}))
