import { jest } from '@jest/globals';
export const exec = jest.fn();
jest.mock('@actions/exec', () => ({
    exec
}));
