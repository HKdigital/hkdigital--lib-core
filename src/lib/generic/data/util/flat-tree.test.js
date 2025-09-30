import { describe, it, expect } from 'vitest';

import { buildTree, flattenTree } from './flat-tree.js';

describe('buildTree', () => {
  it('should return null for empty flat tree (no nodes)', () => {
    const flatTree = {
      format: 'ft1',
      properties: [],
      nodes: [],
      edges: []
    };
    
    const result = buildTree(flatTree);
    
    expect(result).toBe(null);
  });

  it('should throw error for unsupported format', () => {
    const flatTree = {
      format: 'unknown',
      properties: [],
      nodes: [{ _id: 'root', name: 'Root' }],
      edges: []
    };
    
    expect(() => buildTree(flatTree)).toThrow(
      "Unsupported format: unknown. Expected 'ft1'"
    );
  });

  it('should return root only when no edges', () => {
    const flatTree = {
      format: 'ft1',
      properties: [],
      nodes: [{ _id: 'root', name: 'Root Node' }],
      edges: []
    };
    
    const result = buildTree(flatTree);
    
    expect(result).toEqual({ _id: 'root', name: 'Root Node' });
  });

  it('should build simple tree with one child', () => {
    const flatTree = {
      format: 'ft1',
      properties: ['children'],
      nodes: [
        { _id: 'root', name: 'Root' },
        { _id: 'child1', name: 'Child 1' }
      ],
      edges: [0, 0, 1]  // from=0, prop=0(children), to=1
    };
    
    const result = buildTree(flatTree);
    
    expect(result).toEqual({
      _id: 'root',
      name: 'Root',
      children: [{ _id: 'child1', name: 'Child 1' }]
    });
  });

  it('should build tree with multiple children', () => {
    const flatTree = {
      format: 'ft1',
      properties: ['children'],
      nodes: [
        { _id: 'root', name: 'Root' },
        { _id: 'child1', name: 'Child 1' },
        { _id: 'child2', name: 'Child 2' }
      ],
      edges: [0, 0, 1, 0, 0, 2]  // Two edges: root->child1, root->child2
    };
    
    const result = buildTree(flatTree);
    
    expect(result).toEqual({
      _id: 'root',
      name: 'Root',
      children: [
        { _id: 'child1', name: 'Child 1' },
        { _id: 'child2', name: 'Child 2' }
      ]
    });
  });

  it('should build nested tree structure', () => {
    const flatTree = {
      format: 'ft1',
      properties: ['children'],
      nodes: [
        { _id: 'root', name: 'Root' },
        { _id: 'child1', name: 'Child 1' },
        { _id: 'grandchild1', name: 'Grandchild 1' }
      ],
      edges: [0, 0, 1, 1, 0, 2]  // root->child1, child1->grandchild1
    };
    
    const result = buildTree(flatTree);
    
    expect(result).toEqual({
      _id: 'root',
      name: 'Root',
      children: [{
        _id: 'child1',
        name: 'Child 1',
        children: [{ _id: 'grandchild1', name: 'Grandchild 1' }]
      }]
    });
  });

  it('should handle multiple property types', () => {
    const flatTree = {
      format: 'ft1',
      properties: ['children', 'items'],
      nodes: [
        { _id: 'root', name: 'Root' },
        { _id: 'child1', name: 'Child 1' },
        { _id: 'item1', name: 'Item 1' }
      ],
      edges: [0, 0, 1, 0, 1, 2]  // root-children->child1, root-items->item1
    };
    
    const result = buildTree(flatTree);
    
    expect(result).toEqual({
      _id: 'root',
      name: 'Root',
      children: [{ _id: 'child1', name: 'Child 1' }],
      items: [{ _id: 'item1', name: 'Item 1' }]
    });
  });

  it('should throw error for invalid edges array length', () => {
    const flatTree = {
      format: 'ft1',
      properties: ['children'],
      nodes: [{ _id: 'root' }],
      edges: [0, 0]  // Invalid: not multiple of 3
    };
    
    expect(() => buildTree(flatTree)).toThrow(
      'Invalid edges array: length must be multiple of 3'
    );
  });

  it('should throw error for invalid node index', () => {
    const flatTree = {
      format: 'ft1',
      properties: ['children'],
      nodes: [{ _id: 'root' }],
      edges: [0, 0, 5]  // Invalid: node index 5 does not exist
    };
    
    expect(() => buildTree(flatTree)).toThrow(
      'Invalid node index in edge [0, 0, 5]'
    );
  });

  it('should throw error for invalid property index', () => {
    const flatTree = {
      format: 'ft1',
      properties: ['children'],
      nodes: [{ _id: 'root' }, { _id: 'child' }],
      edges: [0, 5, 1]  // Invalid: property index 5 does not exist
    };
    
    expect(() => buildTree(flatTree)).toThrow(
      'Invalid property index: 5'
    );
  });
});

describe('flattenTree', () => {
  it('should flatten simple tree with one child', () => {
    const hierarchicalTree = {
      _id: 'root',
      name: 'Root',
      children: [
        { _id: 'child1', name: 'Child 1' }
      ]
    };
    
    const result = flattenTree(hierarchicalTree);
    
    expect(result).toEqual({
      format: 'ft1',
      properties: ['children'],
      nodes: [
        { _id: 'root', name: 'Root' },
        { _id: 'child1', name: 'Child 1' }
      ],
      edges: [0, 0, 1]
    });
  });

  it('should flatten tree with multiple children', () => {
    const hierarchicalTree = {
      _id: 'root',
      name: 'Root',
      children: [
        { _id: 'child1', name: 'Child 1' },
        { _id: 'child2', name: 'Child 2' }
      ]
    };
    
    const result = flattenTree(hierarchicalTree);
    
    expect(result).toEqual({
      format: 'ft1',
      properties: ['children'],
      nodes: [
        { _id: 'root', name: 'Root' },
        { _id: 'child1', name: 'Child 1' },
        { _id: 'child2', name: 'Child 2' }
      ],
      edges: [0, 0, 1, 0, 0, 2]
    });
  });

  it('should flatten nested tree structure', () => {
    const hierarchicalTree = {
      _id: 'root',
      name: 'Root',
      children: [{
        _id: 'child1',
        name: 'Child 1',
        children: [
          { _id: 'grandchild1', name: 'Grandchild 1' }
        ]
      }]
    };
    
    const result = flattenTree(hierarchicalTree);
    
    expect(result).toEqual({
      format: 'ft1',
      properties: ['children'],
      nodes: [
        { _id: 'root', name: 'Root' },
        { _id: 'child1', name: 'Child 1' },
        { _id: 'grandchild1', name: 'Grandchild 1' }
      ],
      edges: [0, 0, 1, 1, 0, 2]
    });
  });

  it('should handle custom childrenKey option', () => {
    const hierarchicalTree = {
      _id: 'root',
      name: 'Root',
      items: [
        { _id: 'item1', name: 'Item 1' }
      ]
    };
    
    const result = flattenTree(hierarchicalTree, { childrenKey: 'items' });
    
    expect(result).toEqual({
      format: 'ft1',
      properties: ['items'],
      nodes: [
        { _id: 'root', name: 'Root' },
        { _id: 'item1', name: 'Item 1' }
      ],
      edges: [0, 0, 1]
    });
  });

  it('should handle multiple property types', () => {
    const hierarchicalTree = {
      _id: 'root',
      name: 'Root',
      children: [
        { _id: 'child1', name: 'Child 1' }
      ],
      items: [
        { _id: 'item1', name: 'Item 1' }
      ]
    };
    
    const result = flattenTree(hierarchicalTree);
    
    expect(result.format).toBe('ft1');
    expect(result.properties).toEqual(['children', 'items']);
    expect(result.nodes).toEqual([
      { _id: 'root', name: 'Root' },
      { _id: 'child1', name: 'Child 1' },
      { _id: 'item1', name: 'Item 1' }
    ]);
    expect(result.edges).toEqual([0, 0, 1, 0, 1, 2]);
  });

  it('should exclude children properties from node data', () => {
    const hierarchicalTree = {
      _id: 'root',
      name: 'Root',
      data: 'some data',
      children: [
        { _id: 'child1', name: 'Child 1', children: [] }
      ]
    };
    
    const result = flattenTree(hierarchicalTree);
    
    expect(result.nodes[0]).toEqual({
      _id: 'root',
      name: 'Root',
      data: 'some data'
    });
    expect(result.nodes[0]).not.toHaveProperty('children');
    expect(result.nodes[1]).not.toHaveProperty('children');
  });

  it('should handle tree with no children', () => {
    const hierarchicalTree = {
      _id: 'root',
      name: 'Root',
      data: 'some data'
    };
    
    const result = flattenTree(hierarchicalTree);
    
    expect(result).toEqual({
      format: 'ft1',
      properties: [],
      nodes: [{ _id: 'root', name: 'Root', data: 'some data' }],
      edges: []
    });
  });
});

describe('shared object references', () => {
  it('should handle shared object references with WeakMap tracking', () => {
    // Create a shared node that appears in multiple places
    const sharedNode = { _id: 'shared', name: 'Shared Node' };
    
    const hierarchicalTree = {
      _id: 'root',
      name: 'Root',
      children: [
        { 
          _id: 'left', 
          name: 'Left Branch',
          children: [sharedNode]
        },
        { 
          _id: 'right', 
          name: 'Right Branch', 
          children: [sharedNode]  // Same object reference
        }
      ]
    };

    // Verify original has shared references
    expect(hierarchicalTree.children[0].children[0]).toBe(hierarchicalTree.children[1].children[0]);

    const flattened = flattenTree(hierarchicalTree);
    
    // Should have 4 nodes: root, left, right, shared
    expect(flattened.nodes).toHaveLength(4);
    
    // Should have 4 edges: root->left, root->right, left->shared, right->shared
    expect(flattened.edges).toHaveLength(12); // 4 edges × 3 values each
    
    // Verify the shared node appears only once in nodes array
    const sharedNodes = flattened.nodes.filter(n => n._id === 'shared');
    expect(sharedNodes).toHaveLength(1);
    
    // Find the shared node index
    const sharedIndex = flattened.nodes.findIndex(n => n._id === 'shared');
    expect(sharedIndex).toBeGreaterThan(-1);
    
    // Both left and right should reference the same shared node index
    const leftIndex = flattened.nodes.findIndex(n => n._id === 'left');
    const rightIndex = flattened.nodes.findIndex(n => n._id === 'right');
    
    // Count edges pointing to shared node
    const edgesToShared = [];
    for (let i = 0; i < flattened.edges.length; i += 3) {
      if (flattened.edges[i + 2] === sharedIndex) {
        edgesToShared.push(flattened.edges[i]); // from index
      }
    }
    
    expect(edgesToShared).toContain(leftIndex);
    expect(edgesToShared).toContain(rightIndex);
    expect(edgesToShared).toHaveLength(2);

    // Rebuild and verify shared references are maintained
    const rebuilt = buildTree(flattened);
    expect(rebuilt.children[0].children[0]).toBe(rebuilt.children[1].children[0]);
  });
});

describe('buildTree and flattenTree roundtrip', () => {
  it('should maintain data integrity in roundtrip conversion', () => {
    const originalHierarchical = {
      _id: 'root',
      name: 'Root',
      type: 'folder',
      children: [
        {
          _id: 'child1',
          name: 'Child 1',
          type: 'file',
          children: [
            { _id: 'grandchild1', name: 'Grandchild 1', type: 'file' }
          ]
        },
        { _id: 'child2', name: 'Child 2', type: 'folder' }
      ]
    };

    // Flatten then rebuild
    const flattened = flattenTree(originalHierarchical);
    const rebuilt = buildTree(flattened);

    // Convert back to hierarchical format for comparison
    const rebuiltFlattened = flattenTree(rebuilt);

    expect(rebuiltFlattened).toEqual(flattened);
  });

  it('should handle complex trees with multiple property types', () => {
    const originalHierarchical = {
      _id: 'root',
      name: 'Root',
      children: [
        { _id: 'child1', name: 'Child 1' }
      ],
      items: [
        { _id: 'item1', name: 'Item 1' }
      ],
      metadata: [
        { _id: 'meta1', name: 'Meta 1' }
      ]
    };

    const flattened = flattenTree(originalHierarchical);
    const rebuilt = buildTree(flattened);
    const rebuiltFlattened = flattenTree(rebuilt);

    expect(rebuiltFlattened).toEqual(flattened);
  });

  it('should preserve object identity for shared references', () => {
    const sharedNode = { _id: 'shared', name: 'Shared' };
    
    const originalHierarchical = {
      _id: 'root',
      name: 'Root',
      children: [
        { _id: 'left', children: [sharedNode] },
        { _id: 'right', children: [sharedNode] }
      ]
    };

    const flattened = flattenTree(originalHierarchical);
    const rebuilt = buildTree(flattened);
    
    // Verify shared object identity is preserved
    expect(rebuilt.children[0].children[0]).toBe(rebuilt.children[1].children[0]);
    
    // Verify roundtrip consistency
    const rebuiltFlattened = flattenTree(rebuilt);
    expect(rebuiltFlattened).toEqual(flattened);
  });
});