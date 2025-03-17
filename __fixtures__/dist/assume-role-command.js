import { jest } from '@jest/globals';
import { send } from './aws-sdk';
export const AssumeRoleCommand = jest.fn().mockImplementation(() => ({ send }));
