import { error } from '@sveltejs/kit';
import { scanRouteFolders } from '$lib/util/sveltekit/index.js';

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
      dirPath: import.meta.dirname + '/../examples',
      maxDepth: 4,
      skipFolders: new Set(['assets', '_todo'])
    });

    // Transform the folders data for multi-level navigation
    const navigationData = buildNavigationStructure(folders);

    return {
      folders,
      navigationData,
      scalingEnabled
    };
  } catch (err) {
    console.error('Error in explorer load function:', err);
    throw error(404, {
      message: 'Directory not found'
    });
  }
}

/**
 * Builds a hierarchical navigation structure from scanned folders
 * @param {Array} folders - Array of folder objects from scanRouteFolders
 * @returns {Object} Hierarchical navigation structure
 */
function buildNavigationStructure(folders) {
  const structure = {};

  for (const folder of folders) {
    const pathParts = folder.path.split('/');

    // Build nested structure dynamically
    let current = structure;

    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      const isLastPart = i === pathParts.length - 1;

      if (!current[part]) {
        current[part] = {
          name: part,
          path: pathParts.slice(0, i + 1).join('/'),
          isEndpoint: false,
          children: {},
          displayName: part
        };
      }

      // If this is the final part in the path, check if it's actually an endpoint (has a +page.svelte)
      if (isLastPart) {
        current[part].isEndpoint = true;
        current[part].fullPath = folder.path;
        current[part].displayName = folder.displayName || part;
      }

      current = current[part].children;
    }
  }

  return structure;
}
