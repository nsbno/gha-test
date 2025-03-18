import { jest } from '@jest/globals';
import * as core from '../../__fixtures__/core';
jest.unstable_mockModule('@actions/core', () => core);
describe('getTerraformChanges', () => {
    beforeEach(() => { });
    it('developer should get terraform changes from environments', async () => {
    });
});
