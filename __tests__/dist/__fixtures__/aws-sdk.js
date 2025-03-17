import { jest } from '@jest/globals';
// Add proper return type to the mock
export const send = jest.fn();
export const AssumeRoleCommand = jest.fn().mockImplementation(() => ({ send }));
export const STSClient = jest.fn().mockImplementation(() => ({ send }));
jest.mock('@aws-sdk/client-sts', () => ({
    send: jest.fn(),
    STSClient,
    AssumeRoleCommand
}));
