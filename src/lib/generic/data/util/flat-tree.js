/* ------------------------------------------------------------------ Imports */

import * as expect from '$lib/util/expect.js';

import IterableTree from '../classes/IterableTree.js';

/* ------------------------------------------------------------------ Exports */

/**
 * Build a hierarchical tree from ft1 flat tree format
 *
 * @template {object} T
 * @param {import('./typedef.js').FlatTree<T>} flatTree - Flat tree data
 * @param {import('./typedef.js').FlatTreeOptions} [options] - Configuration
 *
 * @returns {T|null} reconstructed hierarchical tree or null
 */
export function buildTree(flatTree, options = {}) {
  expect.object(flatTree);

  const { format, properties, nodes, edges } = flatTree;

  if (format !== 'ft1') {
    throw new Error(`Unsupported format: ${format}. Expected 'ft1'`);
  }

  if (!nodes || !nodes.length) {
    return null;
  }

  if (!edges || !edges.length) {
    return { ...nodes[0] };
  }

  if (edges.length % 3 !== 0) {
    throw new Error('Invalid edges array: length must be multiple of 3');
  }

  // Create copies of all nodes to avoid mutating original data
  const nodesCopy = nodes.map(node => ({ ...node }));

  // Process edges in groups of 3: [from, prop, to]
  for (let i = 0; i < edges.length; i += 3) {
    const fromIndex = edges[i];
    const propIndex = edges[i + 1];
    const toIndex = edges[i + 2];

    // Validate indices
    if (fromIndex >= nodesCopy.length || toIndex >= nodesCopy.length) {
      throw new Error(`Invalid node index in edge [${fromIndex}, ${propIndex}, ${toIndex}]`);
    }

    if (propIndex >= properties.length) {
      throw new Error(`Invalid property index: ${propIndex}`);
    }

    const fromNode = nodesCopy[fromIndex];
    const toNode = nodesCopy[toIndex];
    const propertyName = properties[propIndex];

    // Add child to parent's property
    /** @type {any} */
    const dynamicFromNode = fromNode;

    if (!dynamicFromNode[propertyName]) {
      dynamicFromNode[propertyName] = [toNode];
    } else if (Array.isArray(dynamicFromNode[propertyName])) {
      // Check if this node is already in the array (shared reference)
      if (!dynamicFromNode[propertyName].includes(toNode)) {
        dynamicFromNode[propertyName].push(toNode);
      }
    } else {
      // Convert single child to array
      dynamicFromNode[propertyName] = [dynamicFromNode[propertyName], toNode];
    }
  }

  return nodesCopy[0];
}

/**
 * Flatten a hierarchical tree into ft1 flat tree format
 *
 * @template {object} T
 * @param {T} hierarchicalTree - Hierarchical tree with nested children
 * @param {import('./typedef.js').FlatTreeOptions} [options] - Configuration
 *
 * @returns {import('./typedef.js').FlatTree<T>} flat tree data
 */
export function flattenTree(hierarchicalTree, options = {}) {
  expect.object(hierarchicalTree);

  const { childrenKey = 'children' } = options;

  /** @type {T[]} */
  const nodes = [];
  
  /** @type {number[]} */
  const edges = [];
  
  /** @type {Set<string>} */
  const propertySet = new Set();
  
  /** @type {WeakMap<object, number>} */
  const objectToIndex = new WeakMap();

  // First pass: collect all child-containing properties
  const childProperties = new Set();
  findChildProperties(hierarchicalTree, childProperties, childrenKey);

  // Add root node (always index 0)
  const rootCopy = extractNodeData(hierarchicalTree, childProperties);
  nodes.push(rootCopy);
  objectToIndex.set(hierarchicalTree, 0);

  // Process children recursively
  processChildrenFt1(
    hierarchicalTree,
    0,
    nodes,
    edges,
    propertySet,
    objectToIndex,
    childProperties
  );

  // Convert property set to sorted array for consistent output
  const properties = Array.from(propertySet).sort();

  // Convert property names to indices in edges array
  for (let i = 1; i < edges.length; i += 3) {
    const propertyName = /** @type {string} */ (edges[i]);
    edges[i] = properties.indexOf(propertyName);
  }

  return /** @type {import('./typedef.js').FlatTree<T>} */ ({
    format: 'ft1',
    properties,
    nodes,
    edges
  });
}

/* ---------------------------------------------------------- Private methods */

/**
 * Extract node data excluding children properties
 *
 * @param {object} node - Source node
 * @param {Set<string>} propertiesToRemove - Set of property names to remove
 *
 * @returns {object} node data without children properties
 */
function extractNodeData(node, propertiesToRemove) {
  /** @type {any} */
  const nodeData = { ...node };

  // Remove all child-containing properties
  for (const key of propertiesToRemove) {
    delete nodeData[key];
  }

  return nodeData;
}

/**
 * Find all properties that contain child objects
 *
 * @param {object} node - Node to analyze
 * @param {Set<string>} childProperties - Set to collect property names
 * @param {string} childrenKey - Primary children property name
 */
function findChildProperties(node, childProperties, childrenKey) {
  // Always include the main children key if it exists
  if (node[childrenKey] && Array.isArray(node[childrenKey])) {
    childProperties.add(childrenKey);
  }

  // Find other array properties that contain objects
  for (const [key, value] of Object.entries(node)) {
    if (Array.isArray(value) && value.length > 0) {
      // Check if array contains objects (potential children)
      const hasObjects = value.some(item => item && typeof item === 'object');
      if (hasObjects) {
        childProperties.add(key);
      }
    }
  }

  // Recursively check child nodes
  for (const key of childProperties) {
    const children = node[key];
    if (Array.isArray(children)) {
      for (const child of children) {
        if (child && typeof child === 'object') {
          findChildProperties(child, childProperties, childrenKey);
        }
      }
    }
  }
}

/**
 * Recursively process children for ft1 format
 *
 * @param {object} parentNode - Parent node with children
 * @param {number} parentIndex - Parent node index
 * @param {object[]} nodes - Nodes array to populate
 * @param {(number|string)[]} edges - Edges array to populate (mixed types temporarily)
 * @param {Set<string>} propertySet - Set of property names
 * @param {WeakMap<object, number>} objectToIndex - Map of objects to indices
 * @param {Set<string>} childProperties - Set of all child-containing properties
 */
function processChildrenFt1(parentNode, parentIndex, nodes, edges, propertySet, objectToIndex, childProperties) {
  // Process all child-containing properties
  for (const property of childProperties) {
    const children = parentNode[property];
    
    if (!children) {
      continue;
    }
    
    if (Array.isArray(children)) {
      for (const child of children) {
        if (child && typeof child === 'object') {
          processChildFt1(child, parentIndex, property, nodes, edges, propertySet, objectToIndex, childProperties);
        }
      }
    } else if (children && typeof children === 'object') {
      processChildFt1(children, parentIndex, property, nodes, edges, propertySet, objectToIndex, childProperties);
    }
  }
}

/**
 * Process a single child node for ft1 format
 *
 * @param {object} child - Child node
 * @param {number} parentIndex - Parent node index
 * @param {string} property - Property name where this child belongs
 * @param {object[]} nodes - Nodes array to populate
 * @param {(number|string)[]} edges - Edges array to populate (mixed types temporarily)
 * @param {Set<string>} propertySet - Set of property names
 * @param {WeakMap<object, number>} objectToIndex - Map of objects to indices
 * @param {Set<string>} childProperties - Set of all child-containing properties
 */
function processChildFt1(child, parentIndex, property, nodes, edges, propertySet, objectToIndex, childProperties) {
  if (!child || typeof child !== 'object') {
    return;
  }

  // Track property name
  propertySet.add(property);

  // Check if we've seen this object before
  let childIndex = objectToIndex.get(child);
  
  if (childIndex === undefined) {
    // First time seeing this object - add it to nodes
    childIndex = nodes.length;
    const childCopy = extractNodeData(child, childProperties);
    nodes.push(childCopy);
    objectToIndex.set(child, childIndex);
  }

  // Add edge (temporarily store property name as string, will convert to index later)
  edges.push(parentIndex, property, childIndex);
  
  // If this is a new object, recursively process its children
  if (objectToIndex.get(child) === childIndex) {
    processChildrenFt1(child, childIndex, nodes, edges, propertySet, objectToIndex, childProperties);
  }
}