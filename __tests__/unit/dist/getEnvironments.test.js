import { jest } from '@jest/globals';
import * as core from '../__fixtures__/core.js';
import * as github from '../__fixtures__/github.js';
import * as exec from '../__fixtures__/exec.js';
import { mockOctokit } from '../__fixtures__/github.js';
import * as stsClient from '../__fixtures__/aws-sdk.js';
// Mock dependencies
jest.unstable_mockModule('@actions/core', () => core);
jest.unstable_mockModule('@actions/github', () => github);
jest.unstable_mockModule('@actions/exec', () => exec);
jest.unstable_mockModule('@aws-sdk/client-sts', () => stsClient);
const main = await import('../src/main.js');
const { checkTerraformChanges } = await import('../src/adapters/frameworks/Terraform.js');
const { getEnvironments } = await import('../src/adapters/frameworks/Github.js');
describe('FindTerraformChanges', () => {
    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        process.env.AWS_REGION = 'eu-west-1';
        process.env.AWS_ACCOUNT_ID = '123456789012';
        process.env.AWS_DEPLOYMENT_ROLE_NAME = 'deployment-trusted-role';
        mockOctokit.rest.repos.getAllEnvironments.mockReturnValue({
            data: {
                environments: [
                    { name: 'Test' },
                    { name: 'Stage' },
                    { name: 'Production' }
                ]
            }
        });
        github.getOctokit.mockReturnValue(mockOctokit);
        stsClient.send.mockResolvedValue({
            $metadata: {},
            Credentials: {
                AccessKeyId: 'mockAccessKeyId',
                SecretAccessKey: 'mockSecretAccessKey',
                SessionToken: 'mockSessionToken',
                Expiration: new Date()
            }
        });
        // Directly assign the implementation to exec.exec
        exec.exec.mockImplementation(function (commandLine, args = [], options = {}) {
            // If this is a terraform plan command
            if (commandLine === 'terraform' && args?.includes('plan')) {
                // Simulate different behaviors based on the environment directory
                const directory = options?.cwd || '';
                // Make 'stage' environment return changes (throw with exit code 2)
                if (directory.includes('stage')) {
                    const error = new Error('Changes detected');
                    // @ts-expect-error - Adding code property to Error
                    error.code = 2;
                    throw error;
                }
                // Other environments have no changes (exit code 0)
                return Promise.resolve(0);
            }
            // For terraform init, just succeed
            return Promise.resolve(0);
        });
    });
    afterEach(() => {
        jest.resetAllMocks();
    });
    it('should skip processing if force-deploy is true', async () => {
        core.getBooleanInput.mockImplementation(() => true);
        await main.run();
        expect(core.info).toHaveBeenCalledWith('Force deploy is set to true. Skipping change detection.');
        expect(core.setOutput).toHaveBeenCalledWith('changes', '[]');
    });
    it('should get environments', async () => {
        const environments = ['Test', 'Stage', 'Production'];
        const getGitHubEnvironments = await getEnvironments();
        expect(getGitHubEnvironments).toStrictEqual(environments);
    });
    it('should detect changed environments', async () => {
        const environments = ['Test', 'Stage', 'Production'];
        const result = await checkTerraformChanges(environments);
        expect(result).toEqual(['Stage']);
        expect(core.notice).toHaveBeenCalledWith('Test has no changes, and will not be deployed 💤', { title: 'Changes to Terraform' });
        expect(core.notice).toHaveBeenCalledWith('Stage has changes and will be deployed 🚀', { title: 'Changes to Terraform' });
        expect(core.notice).toHaveBeenCalledWith('Production has no changes, and will not be deployed 💤', { title: 'Changes to Terraform' });
    });
});
