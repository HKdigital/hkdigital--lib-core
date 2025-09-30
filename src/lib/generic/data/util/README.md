# Flat Tree Utilities

Tree serialization and deserialization utilities that convert between 
hierarchical tree structures and flat tree format (ft1).

## Overview

The flat tree utilities provide bidirectional conversion between:
- **Hierarchical Trees**: Standard nested object structures with children
- **Flat Tree Format (ft1)**: Compact serialized format with separate 
  nodes and edges

## Key Features

- **Format Versioning**: ft1 format with forward compatibility
- **Property Preservation**: Maintains original property names 
  (`children`, `items`, etc.)
- **Shared Reference Handling**: Uses WeakMap to track objects that 
  appear multiple times
- **ID Collision Avoidance**: No conflicts between user IDs and tree 
  structure IDs
- **Efficient Serialization**: Compact flat edge array format

## API Reference

### `buildTree(flatTree, options)`

Converts ft1 flat tree format to hierarchical tree structure.

**Parameters:**
- `flatTree` - FlatTree object in ft1 format
- `options` - Optional configuration object

**Returns:** Reconstructed hierarchical tree or null

**Example:**
```javascript
import { buildTree } from '$lib/generic/data/util/flat-tree.js';

const flatTree = {
  format: 'ft1',
  properties: ['children'],
  nodes: [
    { id: 'root', name: 'Root' },
    { id: 'child1', name: 'Child 1' }
  ],
  edges: [0, 0, 1]  // root->children->child1
};

const hierarchical = buildTree(flatTree);
// Result: { id: 'root', name: 'Root', children: [{ id: 'child1', name: 'Child 1' }] }
```

### `flattenTree(hierarchicalTree, options)`

Converts hierarchical tree to ft1 flat tree format.

**Parameters:**
- `hierarchicalTree` - Nested object structure with children
- `options` - Optional configuration object
  - `childrenKey` (default: 'children') - Primary children property name

**Returns:** FlatTree object in ft1 format

**Example:**
```javascript
import { flattenTree } from '$lib/generic/data/util/flat-tree.js';

const hierarchical = {
  id: 'root',
  name: 'Root',
  children: [
    { id: 'child1', name: 'Child 1' }
  ]
};

const flatTree = flattenTree(hierarchical);
// Result: { format: 'ft1', properties: ['children'], nodes: [...], edges: [...] }
```

## ft1 Format Specification

The ft1 format consists of four main components:

### Format Structure

```javascript
{
  format: 'ft1',           // Format version identifier
  properties: string[],    // Array of property names used in edges
  nodes: object[],         // Array of node objects (index 0 = root)
  edges: number[]          // Flat array: [from, prop, to, from, prop, to, ...]
}
```

### Properties Array

Maps property indices to names for edge decoding:
```javascript
properties: ['children', 'items', 'metadata']
//           index: 0      1       2
```

### Nodes Array

Contains node data with children properties removed:
```javascript
nodes: [
  { id: 'root', name: 'Root' },      // index 0 (always root)
  { id: 'child1', name: 'Child 1' }, // index 1
  { id: 'item1', name: 'Item 1' }    // index 2
]
```

### Edges Array

Flat array in groups of 3: `[from_index, property_index, to_index]`
```javascript
edges: [
  0, 0, 1,  // root(0) -children(0)-> child1(1)
  0, 1, 2   // root(0) -items(1)-> item1(2)
]
```

## Shared Object References

Objects that appear multiple times in the tree are automatically 
handled using WeakMap tracking:

```javascript
const sharedNode = { id: 'shared', name: 'Shared' };

const hierarchical = {
  id: 'root',
  children: [
    { id: 'left', children: [sharedNode] },
    { id: 'right', children: [sharedNode] }  // Same object reference
  ]
};

const flattened = flattenTree(hierarchical);
const rebuilt = buildTree(flattened);

// Shared reference is preserved
console.log(rebuilt.children[0].children[0] === rebuilt.children[1].children[0]); // true
```

## Property Detection

The flattening process automatically detects child-containing properties:

```javascript
const tree = {
  id: 'root',
  children: [{ id: 'child1' }],  // Detected as child property
  items: [{ id: 'item1' }],      // Detected as child property
  metadata: 'string value'       // Not a child property (ignored)
};
```

## Roundtrip Conversion

The utilities maintain data integrity across roundtrip conversions:

```javascript
const original = { /* complex tree */ };
const flattened = flattenTree(original);
const rebuilt = buildTree(flattened);
const reflattened = flattenTree(rebuilt);

// Data integrity preserved
console.log(JSON.stringify(flattened) === JSON.stringify(reflattened)); // true
```

## Error Handling

The utilities provide clear error messages for invalid data:

- **Unsupported format**: When format is not 'ft1'
- **Invalid edges**: When edges array length is not multiple of 3
- **Invalid indices**: When node or property indices are out of bounds
- **Missing data**: When required fields are missing

## Performance Considerations

- **WeakMap Usage**: Efficient object reference tracking
- **Flat Edge Array**: Compact memory usage for large trees
- **Property Index Mapping**: Fast property name lookup
- **No Deep Cloning**: Shallow copies preserve performance

## Use Cases

### Configuration Trees
```javascript
const config = {
  server: {
    children: [
      { name: 'port', value: 3000 },
      { name: 'host', value: 'localhost' }
    ]
  }
};
```

### File System Trees
```javascript
const fileTree = {
  path: '/',
  children: [
    { path: '/src', children: [{ path: '/src/index.js' }] },
    { path: '/package.json' }
  ]
};
```

### Menu Structures
```javascript
const menu = {
  title: 'Main',
  items: [
    { title: 'File', items: [{ title: 'New' }, { title: 'Open' }] },
    { title: 'Edit', items: [{ title: 'Copy' }, { title: 'Paste' }] }
  ]
};
```

## Migration Guide

### From Legacy Formats

If migrating from older tree formats, ensure your data structure 
follows these patterns:

1. **Root Object**: Single root node with child properties
2. **Array Children**: Child properties should be arrays of objects
3. **Object Structure**: Each node should be a plain object
4. **No Circular References**: Avoid circular references (use shared 
   objects instead)

### Type Safety

Use JSDoc type annotations for better development experience:

```javascript
/**
 * @param {import('./typedef.js').FlatTree<MyNodeType>} flatTree
 * @returns {MyNodeType|null}
 */
function processTree(flatTree) {
  return buildTree(flatTree);
}
```