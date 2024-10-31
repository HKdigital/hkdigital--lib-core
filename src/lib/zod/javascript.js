/**
 * The following namespace style import can be used to acces the named exports
 * and als the JSdoc typedefs
 *
 * import z, * as Zods from '<path-to>/all.js';
 *
 * @example
 *
 *  JSdoc:
 *  `@param {Type.Name} name
 *
 *  Assert style:
 *  Type.String.parse(name);
 *
 *  Parse style:
 *  const name = Type.Name.parse('Jens ');
 */

// > Imports

import { z } from 'zod';

// > Exports

export const Timeout = z.number();
/** @typedef {number|NodeJS.Timeout} Timeout */

export const TimeoutOrUndefined = z.union([z.number(), z.undefined()]);
/** @typedef {number|NodeJS.Timeout|undefined} TimeoutOrUndefined */

// Export default is required for exporting typedefs
export default {};
