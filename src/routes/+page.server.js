// src/routes/[...path]/+page.js
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ params })
{
  const currentPath = params.path || '.';
  const fullPath = join(process.cwd(), currentPath);

  try {
    const entries = await readdir(fullPath, { withFileTypes: true });
    const folders = entries
      .filter(entry => entry.isDirectory())
      .filter(entry => !entry.name.startsWith('.')) // Skip hidden folders
      .map(entry => ({
        name: entry.name,
        path: join('/', currentPath, entry.name)
      }));

    return {
      folders,
      currentPath
    };
  // eslint-disable-next-line no-unused-vars
  } catch (err) {
    throw error(404, {
      message: 'Directory not found'
    });
  }
}
