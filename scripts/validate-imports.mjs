#!/usr/bin/env node

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, resolve, dirname } from 'node:path';

const PROJECT_ROOT = process.cwd();
const SRC_DIR = join(PROJECT_ROOT, 'src');

/**
 * Find all JS and Svelte files recursively
 *
 * @param {string} dir - Directory to search
 *
 * @returns {Promise<string[]>} Array of file paths
 */
async function findFiles(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.svelte-kit') {
        files.push(...await findFiles(fullPath));
      }
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.svelte')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Check if import path resolves to directory with index.js
 *
 * Follows Node.js/Vite resolution order:
 * 1. Check for file with .js extension
 * 2. Check for file with .svelte extension
 * 3. Check for directory with index.js
 *
 * @param {string} fsPath - Filesystem path to check (without extension)
 *
 * @returns {Promise<boolean>} True if resolves to directory with index.js
 */
async function isDirectoryWithIndex(fsPath) {
  // First check if a file exists (files resolve before directories)
  try {
    const jsStats = await stat(fsPath + '.js');
    if (jsStats.isFile()) {
      return false; // Resolves to file, not directory
    }
  } catch {
    // .js file doesn't exist, continue checking
  }

  try {
    const svelteStats = await stat(fsPath + '.svelte');
    if (svelteStats.isFile()) {
      return false; // Resolves to file, not directory
    }
  } catch {
    // .svelte file doesn't exist, continue checking
  }

  // Now check if it's a directory with index.js
  try {
    const dirStats = await stat(fsPath);
    if (dirStats.isDirectory()) {
      try {
        await stat(join(fsPath, 'index.js'));
        return true; // Directory with index.js
      } catch {
        return false; // Directory but no index.js
      }
    }
  } catch {
    // Path doesn't exist at all
  }

  return false;
}

/**
 * Validate import paths in a file
 *
 * @param {string} filePath - Path to the file
 *
 * @returns {Promise<string[]>} Array of error messages
 */
async function validateFile(filePath) {
  const content = await readFile(filePath, 'utf-8');
  const errors = [];
  const relativePath = relative(PROJECT_ROOT, filePath);
  const isTestFile = filePath.endsWith('.test.js') ||
    filePath.endsWith('.spec.js');

  // Check each line for import statements
  const lines = content.split('\n');
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const lineNum = index + 1;

    // Skip if not an import line
    if (!line.trim().startsWith('import ')) {
      continue;
    }

    // Extract import path from line
    const importMatch = line.match(/from ['"]([^'"]+)['"]/);
    if (!importMatch) {
      continue;
    }

    const importPathRaw = importMatch[1];

    // Strip query parameters (Vite asset imports like ?preset=render)
    const importPath = importPathRaw.split('?')[0];

    // Skip external packages (no ./ or $lib prefix)
    if (!importPath.startsWith('./') &&
        !importPath.startsWith('../') &&
        !importPath.startsWith('$lib/')) {
      continue;
    }

    // Check 1: Cross-domain relative imports (3+ levels up)
    if (importPath.match(/^\.\.\/\.\.\/\.\.\//)) {
      errors.push(
        `${relativePath}:${lineNum} - Cross-domain relative import ` +
        `(use $lib/ instead)`
      );
      continue;
    }

    // Check 2: Local index.js imports (skip for test files)
    // Allow ./index.js and ./subfolder/index.js but flag parent navigation
    if (!isTestFile && importPath.match(/\/index\.js$/)) {
      // Allow same-directory and child directory imports
      // Examples: ./index.js, ./subfolder/index.js, ./(meta)/index.js
      // Flag parent navigation: ../index.js, ../../index.js
      const isParentNavigation = importPath.match(/^\.\..*\/index\.js$/);

      if (isParentNavigation) {
        errors.push(
          `${relativePath}:${lineNum} - Parent index.js import ` +
          `(use $lib/ or import specific file)`
        );
        continue;
      }
    }

    // Resolve to filesystem path
    let fsPath;
    if (importPath.startsWith('$lib/')) {
      fsPath = join(PROJECT_ROOT, importPath.replace('$lib/', 'src/lib/'));
    } else {
      fsPath = resolve(dirname(filePath), importPath);
    }

    // Check 3: Non-standard extensions (must be explicit)
    // Files like .svelte.js need full extension in import
    // Examples:
    //   import './Button.svelte' when Button.svelte.js exists → error
    //   import './Button' when Button.svelte.js exists → error
    //   import './Button.svelte.js' → correct!

    const hasFullNonStandardExt = importPath.match(/\.(svelte\.js|test\.js|spec\.js)$/);

    if (!hasFullNonStandardExt) {
      // First check if file resolves with standard extension
      let fileExistsWithStandardExt = false;

      // Check .js
      if (importPath.endsWith('.js')) {
        try {
          const stats = await stat(fsPath);
          if (stats.isFile()) {
            fileExistsWithStandardExt = true;
          }
        } catch {
          // Doesn't exist
        }
      }

      // Check .svelte
      if (!fileExistsWithStandardExt && importPath.endsWith('.svelte')) {
        try {
          const stats = await stat(fsPath);
          if (stats.isFile()) {
            fileExistsWithStandardExt = true;
          }
        } catch {
          // Doesn't exist
        }
      }

      // Check implicit .js (no extension in import)
      if (!fileExistsWithStandardExt &&
          !importPath.endsWith('.js') &&
          !importPath.endsWith('.svelte')) {
        try {
          const stats = await stat(fsPath + '.js');
          if (stats.isFile()) {
            fileExistsWithStandardExt = true;
          }
        } catch {
          // Doesn't exist
        }
      }

      // Check implicit .svelte (no extension in import)
      if (!fileExistsWithStandardExt &&
          !importPath.endsWith('.js') &&
          !importPath.endsWith('.svelte')) {
        try {
          const stats = await stat(fsPath + '.svelte');
          if (stats.isFile()) {
            fileExistsWithStandardExt = true;
          }
        } catch {
          // Doesn't exist
        }
      }

      // Only check for non-standard extensions if standard doesn't exist
      if (!fileExistsWithStandardExt) {
        // Remove any standard extension from import path
        const baseImportPath = importPath
          .replace(/\.js$/, '')
          .replace(/\.svelte$/, '');

        let baseFsPath;
        if (baseImportPath.startsWith('$lib/')) {
          baseFsPath = join(
            PROJECT_ROOT,
            baseImportPath.replace('$lib/', 'src/lib/')
          );
        } else if (baseImportPath.startsWith('./') ||
          baseImportPath.startsWith('../')) {
          baseFsPath = resolve(dirname(filePath), baseImportPath);
        } else {
          baseFsPath = fsPath;
        }

        // Check for files with non-standard extensions
        const nonStandardExts = ['.svelte.js', '.test.js', '.spec.js'];
        let foundNonStandard = false;

        for (const ext of nonStandardExts) {
          try {
            const testPath = baseFsPath + ext;
            const stats = await stat(testPath);
            if (stats.isFile()) {
              const correctImport = baseImportPath + ext;
              errors.push(
                `${relativePath}:${lineNum} - Missing non-standard ` +
                `extension (use '${correctImport}')`
              );
              foundNonStandard = true;
              break;
            }
          } catch {
            // File doesn't exist with this extension, continue checking
          }
        }

        // Skip remaining checks if we found a non-standard extension issue
        if (foundNonStandard) {
          continue;
        }
      }
    }

    // Check 4: Directory imports (when directory has index.js)
    // Only check if import doesn't have extension (extensionless imports)
    const hasAnyExtension = importPath.match(/\.(js|svelte)$/) ||
      importPath.match(/\.(svelte\.js|test\.js|spec\.js)$/);

    if (!hasAnyExtension) {
      // Check if it's a directory with index.js
      if (await isDirectoryWithIndex(fsPath)) {
        // Don't suggest ../path/index.js (parent navigation)
        // Suggest creating export file instead
        const wouldBeParentNavigation = importPath.match(/^\.\.\//);

        if (wouldBeParentNavigation) {
          errors.push(
            `${relativePath}:${lineNum} - Directory import requires ` +
            `parent navigation (create export file like '${importPath}.js' ` +
            `or import specific file)`
          );
          continue;
        }

        const suggestion = importPath.endsWith('/') ?
          `${importPath}index.js` : `${importPath}/index.js`;
        errors.push(
          `${relativePath}:${lineNum} - Directory import ` +
          `(write explicitly: '${suggestion}')`
        );
        continue;
      }
    }

    // Check 5: File existence (after all other checks)
    // Verify that the import path resolves to an existing file
    // Follow Node.js/Vite resolution order
    let fileExists = false;
    const possiblePaths = [];

    // If import has extension, check exact path
    if (importPath.match(/\.(js|svelte|svelte\.js|test\.js|spec\.js)$/)) {
      possiblePaths.push(fsPath);
    } else {
      // No extension, try in resolution order
      possiblePaths.push(fsPath);  // Exact match
      possiblePaths.push(fsPath + '.js');
      possiblePaths.push(fsPath + '.svelte');
      possiblePaths.push(fsPath + '.svelte.js');
      possiblePaths.push(fsPath + '/index.js');
      possiblePaths.push(fsPath + '/index.svelte');
    }

    for (const testPath of possiblePaths) {
      try {
        const stats = await stat(testPath);
        if (stats.isFile()) {
          fileExists = true;
          break;
        }
      } catch {
        // File doesn't exist, continue checking
      }
    }

    if (!fileExists) {
      errors.push(
        `${relativePath}:${lineNum} - Import path does not exist: ` +
        `'${importPath}'`
      );
    }
  }

  return errors;
}

/**
 * Main validation function
 */
async function main() {
  console.log('Validating import paths...\n');

  const files = await findFiles(SRC_DIR);
  const allErrors = [];

  for (const file of files) {
    const errors = await validateFile(file);
    allErrors.push(...errors);
  }

  if (allErrors.length > 0) {
    console.error('❌ Found import path violations:\n');
    allErrors.forEach(error => console.error(`  ${error}`));
    console.error(`\n${allErrors.length} error(s) found.`);
    process.exit(1);
  }

  console.log('✅ All import paths are valid!');
}

main().catch(error => {
  console.error('Validation script error:', error);
  process.exit(1);
});
