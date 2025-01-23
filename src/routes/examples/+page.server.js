import { readdir } from 'node:fs/promises';
import { error } from '@sveltejs/kit';

export const trailingSlash = 'always';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  try {
    const skipFolders = new Set(['assets']);

    const entries =
      await readdir(import.meta.dirname, { withFileTypes: true });

// console.log('import.meta.dirname', import.meta.dirname);

    const folders = entries
      .filter(entry => entry.isDirectory())
      .filter(entry => !skipFolders.has( entry.name ) )
      .filter(entry => !entry.name.startsWith('.'))
      .map(entry => ({
        displayName: entry.name,
        path: entry.name
      }));

    return {
      folders
    };
  } catch (err) {
    console.error('Error reading directory:', err);
    throw error(404, {
      message: 'Directory not found'
    });
  }
}
