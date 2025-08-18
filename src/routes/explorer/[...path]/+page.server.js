import { error, redirect } from '@sveltejs/kit';
import { scanRouteFolders } from '$hklib-core/util/sveltekit.js';

/**
 * Handles form actions for persistent scaling toggle
 */
export const actions = {
  toggleScaling: async ({ request, cookies }) => {
    const data = await request.formData();
    const scalingEnabled = data.get('scalingEnabled') === 'on';

    cookies.set('scalingEnabled', scalingEnabled.toString(), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30
    });

    return {
      success: true,
      scalingEnabled
    };
  }
};

export async function load({ params, cookies }) {
  try {
    const scalingEnabled = cookies.get('scalingEnabled') === 'true';

    // Get the path from route parameters
    const pathSegments = params.path ? params.path.split('/') : [];
    
    // Extract folder name from first segment, fallback to config
    const FOLDER_NAME = pathSegments[0];
    
    // Remove folder name from path segments to get actual content path
    const contentPathSegments = pathSegments.slice(1);
    const requestedPath = contentPathSegments.join('/');
    
    // If we're at the root (only folder name in URL), clear the current path
    const isAtRoot = pathSegments.length <= 1 || (pathSegments.length === 2 && pathSegments[1] === '');
    const displayCurrentPath = isAtRoot ? '' : requestedPath;

    // Scan the configured directory
    const folders = await scanRouteFolders({
      dirPath: import.meta.dirname + '/../../' + FOLDER_NAME,
      maxDepth: 4,
      skipFolders: new Set(['assets', '_todo'])
    });

    const navigationData = buildNavigationStructure(folders);

    // Check if the requested path is a valid endpoint
    const matchingEndpoint = folders.find(
      (folder) => folder.path === requestedPath
    );
    
    if (matchingEndpoint) {
      // Redirect to the actual route endpoint
      throw redirect(302, `/${FOLDER_NAME}/${requestedPath}/`);
    }

    return {
      navigationData,
      scalingEnabled,
      currentPath: displayCurrentPath,
      FOLDER_NAME
    };
  } catch (err) {
    // Let redirects pass through
    if (err?.status === 302) {
      throw err;
    }
    console.error('Error in explorer catch-all load function:', err);
    throw error(404, {
      message: 'Path not found'
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

      // If this is the final part in the path, mark as endpoint (has +page.svelte)
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
