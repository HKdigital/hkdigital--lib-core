/* ------------------------------------------------------------------ Typedef */

/**
 * Flat tree data structure in ft1 format
 *
 * @template {object} T
 * @typedef {object} FlatTree
 * @property {string} format - Format version ('ft1')
 * @property {string[]} properties - Array of property names used in edges
 * @property {T[]} nodes - Array of node objects (index 0 = root)
 * @property {number[]} edges - Flat array: [from, prop, to, from, prop, to, ...]
 */

/**
 * Options for flat tree operations
 *
 * @typedef {object} FlatTreeOptions
 * @property {string} [idKey='_id'] - Property name containing node identifier
 * @property {string} [childrenKey='children'] - Property name for child nodes
 * @property {string} [subgroupFallback='_next'] - Fallback name for subgroups
 */

/* ------------------------------------------------------------------ Exports */

export {};