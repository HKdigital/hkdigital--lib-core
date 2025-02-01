import { error } from '@sveltejs/kit';

import { scanRouteFolders } from '$lib/util/sveltekit/index.js';

export const trailingSlash = 'always';

export async function load() {
  try {
    const folders = await scanRouteFolders({
      dirPath: import.meta.dirname,
      maxDepth: 2
    });
    return { folders };
  } catch (err) {
    console.error('Error in load function:', err);
    throw error(404, {
      message: 'Directory not found'
    });
  }
}
