import { jest } from '@jest/globals'
import { AssumeRoleCommandOutput } from '@aws-sdk/client-sts'

// Add proper return type to the mock
export const send = jest.fn<() => Promise<AssumeRoleCommandOutput>>()
export const AssumeRoleCommand = jest.fn().mockImplementation(() => ({ send }))
export const STSClient = jest.fn().mockImplementation(() => ({ send }))

jest.mock('@aws-sdk/client-sts', () => ({
  send: jest.fn(),
  STSClient,
  AssumeRoleCommand
}))
