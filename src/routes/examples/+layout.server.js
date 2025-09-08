import { error } from '@sveltejs/kit';
import { scanRouteFolders } from '$lib/util/sveltekit/route-folders.js';

export const trailingSlash = 'always';

export async function load({ url }) {
  try {
    // Handle scaling toggle via URL params (fallback method)
    let scalingEnabled = false;
    if (url.search.includes('scale=1')) {
      scalingEnabled = true;
    } else if (url.search.includes('scale=0')) {
      scalingEnabled = false;
    }

    const folders = await scanRouteFolders({
      dirPath: import.meta.dirname,
      maxDepth: 3,
      skipFolders: new Set(['assets', '_todo'])
    });

    // Transform the folders data for multi-column navigation
    const navigationData = buildNavigationStructure(folders);

    return { 
      folders, 
      navigationData, 
      scalingEnabled 
    };
  } catch (err) {
    console.error('Error in examples load function:', err);
    throw error(404, {
      message: 'Directory not found'
    });
  }
}

/**
 * Builds a hierarchical navigation structure from scanned folders
 * @param {Array<object>} folders - Array of folder objects from scanRouteFolders
 * @returns {Object} Hierarchical navigation structure
 */
function buildNavigationStructure(folders) {
  const structure = {};
  
  for (const folder of folders) {
    const pathParts = folder.path.split('/');
    
    if (pathParts.length === 1) {
      // Top level folder
      if (!structure[pathParts[0]]) {
        structure[pathParts[0]] = {
          name: pathParts[0],
          subfolders: {},
          examples: []
        };
      }
      
      // If this is a direct example (depth 0), add to examples
      if (folder.depth === 0) {
        structure[pathParts[0]].examples.push({
          name: pathParts[0],
          path: folder.path,
          displayName: folder.displayName
        });
      }
    } else if (pathParts.length === 2) {
      // Second level folder
      const [mainFolder, subFolder] = pathParts;
      
      if (!structure[mainFolder]) {
        structure[mainFolder] = {
          name: mainFolder,
          subfolders: {},
          examples: []
        };
      }
      
      if (!structure[mainFolder].subfolders[subFolder]) {
        structure[mainFolder].subfolders[subFolder] = {
          name: subFolder,
          examples: []
        };
      }
      
      structure[mainFolder].subfolders[subFolder].examples.push({
        name: pathParts.join('/'),
        path: folder.path,
        displayName: folder.displayName
      });
    } else if (pathParts.length === 3) {
      // Third level folder (example)
      const [mainFolder, subFolder, example] = pathParts;
      
      if (!structure[mainFolder]) {
        structure[mainFolder] = {
          name: mainFolder,
          subfolders: {},
          examples: []
        };
      }
      
      if (!structure[mainFolder].subfolders[subFolder]) {
        structure[mainFolder].subfolders[subFolder] = {
          name: subFolder,
          examples: []
        };
      }
      
      structure[mainFolder].subfolders[subFolder].examples.push({
        name: example,
        path: folder.path,
        displayName: folder.displayName
      });
    }
  }
  
  return structure;
}

