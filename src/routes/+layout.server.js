import { error } from '@sveltejs/kit';

import { scanRouteFolders } from '$lib/util/sveltekit/index.js';

export const trailingSlash = 'always';

let scalingEnabled = false;

export async function load({ url }) {
  try {
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

    // console.debug('folders', folders);

    return { folders, scalingEnabled };
  } catch (err) {
    console.error('Error in load function:', err);
    throw error(404, {
      message: 'Directory not found'
    });
  }
}
