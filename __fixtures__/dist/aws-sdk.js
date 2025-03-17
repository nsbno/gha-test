import { jest } from '@jest/globals';
import { AssumeRoleCommand } from '@aws-sdk/client-sts';
// Add proper return type to the mock
export const mockSend = jest.fn();
// export class MockSTSClient {
//   send = mockSend
// }
jest.mock('@aws-sdk/client-sts', () => ({
    STSClient: MockSTSClient,
    AssumeRoleCommand
}));
