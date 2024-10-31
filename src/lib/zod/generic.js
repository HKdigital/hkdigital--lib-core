// > Imports

import { z } from 'zod';

// > Exports

export const Label = z.string().min(1).max(80);
/** @typedef {string} Label */

export const LabelOrSymbol = z.union([z.string().min(1).max(80), z.symbol()]);
/** @typedef {string|Symbol} LabelOrSymbol */
