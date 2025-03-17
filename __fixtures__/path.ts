import type * as path from 'path'
import { jest } from '@jest/globals'

export const join = jest.fn<typeof path.join>()
