import { jest } from '@jest/globals';
export const getOctokit = jest.fn();
export const context = {
    payload: {
        pull_request: {
            number: 1
        }
    },
    repo: {
        owner: 'owner',
        repo: 'repo'
    }
};
export const mockOctokit = {
    rest: {
        repos: {
            getAllEnvironments: jest.fn()
        }
    }
};
