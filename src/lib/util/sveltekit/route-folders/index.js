import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';

/**
 * Validates if a path is within the project's src/routes directory
 * @param {string} path - Path to validate
 * @returns {boolean}
 */
export function isValidRoutePath(path) {
  const normalizedPath = resolve(path);
  const routesPath = resolve(process.cwd(), 'src/routes');
  return normalizedPath.startsWith(routesPath);
}

/**
 * Scans route folders recursively, only including folders with +page.svelte
 * @param {Object} options - Scan options
 * @param {string} options.dirPath - Directory path to scan
 * @param {number} [options.maxDepth=1] - Maximum depth to scan
 * @param {Set<string>} [options.skipFolders=new Set(['assets'])] - Folders to skip
 * @returns {Promise<Array<{displayName: string, path: string}>>}
 * @throws {Error} If path is outside project routes directory
 */
export async function scanRouteFolders({
  dirPath,
  maxDepth = 1,
  skipFolders = new Set(['assets'])
}) {
  if (!isValidRoutePath(dirPath)) {
    throw new Error('Invalid path: Must be within src/routes directory');
  }

  if (maxDepth < 1) return [];

  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    const results = [];

    for (const entry of entries) {
      if (
        !entry.isDirectory() ||
        skipFolders.has(entry.name) ||
        entry.name.startsWith('.')
      ) {
        continue;
      }

      const fullPath = join(dirPath, entry.name);
      const currentPath = entry.name;

      const dirContents = await readdir(fullPath);
      const hasPageFile = dirContents.includes('+page.svelte');

      if (hasPageFile) {
        results.push({
          displayName: entry.name,
          path: currentPath
        });
      }

      if (maxDepth > 1) {
        const subFolders = await scanRouteFolders({
          dirPath: fullPath,
          maxDepth: maxDepth - 1,
          skipFolders
        });

        for (const subFolder of subFolders) {
          results.push({
            displayName: `${entry.name}/${subFolder.displayName}`,
            path: `${currentPath}/${subFolder.path}`
          });
        }
      }
    }

    return results;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to scan directory');
  }
}
