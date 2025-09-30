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

export {};
