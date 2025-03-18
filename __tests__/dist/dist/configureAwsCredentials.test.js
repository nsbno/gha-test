import { jest } from '@jest/globals';
import * as core from '@actions/core';
import { configureAwsCredentials } from '../src/main';
import { mockSend } from '../__fixtures__/aws-sdk';
jest.mock('@actions/core');
describe('configureAwsCredentials', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.AWS_REGION = 'us-west-2';
        process.env.AWS_ACCOUNT_ID = '123456789012';
        process.env.AWS_DEPLOYMENT_ROLE_NAME = 'my-deployment-role';
    });
    it('should assume the role and set environment variables', async () => {
        const mockCredentials = {
            AccessKeyId: 'mockAccessKeyId',
            SecretAccessKey: 'mockSecretAccessKey',
            SessionToken: 'mockSessionToken'
        };
        mockSend.mockResolvedValue({ Credentials: mockCredentials });
        await configureAwsCredentials('us-west-2', '123456789012', 'my-deployment-role');
        expect(process.env.AWS_ACCESS_KEY_ID).toBe('mockAccessKeyId');
        expect(process.env.AWS_SECRET_ACCESS_KEY).toBe('mockSecretAccessKey');
        expect(process.env.AWS_SESSION_TOKEN).toBe('mockSessionToken');
        expect(core.info).toHaveBeenCalledWith('Assumed role: arn:aws:iam::123456789012:role/my-deployment-role in region us-west-2');
    });
    it('should fail if assume role fails', async () => {
        mockSend.mockResolvedValue({ Credentials: null });
        await configureAwsCredentials('us-west-2', '123456789012', 'my-deployment-role');
        expect(core.setFailed).toHaveBeenCalledWith('Failed to assume role');
    });
    it('should handle errors during assume role', async () => {
        const errorMessage = 'Some error';
        mockSend.mockRejectedValue(new Error(errorMessage));
        await configureAwsCredentials('us-west-2', '123456789012', 'my-deployment-role');
        expect(core.setFailed).toHaveBeenCalledWith(`Failed to assume role: ${errorMessage}`);
    });
});
