#!/usr/bin/env node

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, resolve, dirname, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = process.cwd();
const SRC_DIR = join(PROJECT_ROOT, 'src');
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const LIB_ROOT = dirname(SCRIPT_DIR);

/**
 * Scopes to validate for barrel exports
 * Any package under these scopes will be checked
 */
const EXTERNAL_SCOPES_TO_VALIDATE = ['@hkdigital'];

/**
 * Project aliases from svelte.config.js
 * Loaded dynamically at startup
 *
 * @type {Record<string, string>}
 */
let PROJECT_ALIASES = {};

/**
 * Load aliases from svelte.config.js
 *
 * @returns {Promise<Record<string, string>>} Alias mappings
 */
async function loadAliases() {
  try {
    const configPath = join(PROJECT_ROOT, 'svelte.config.js');

    // Use dynamic import to load ES module
    const config = await import(`file://${configPath}`);
    const svelteConfig = config.default;

    if (svelteConfig?.kit?.alias) {
      return svelteConfig.kit.alias;
    }
  } catch (error) {
    // Config file doesn't exist or can't be loaded
    // This is OK - not all projects will have aliases
  }

  return {};
}

/**
 * Resolve an alias path to its filesystem location
 *
 * @param {string} aliasPath - Import path using alias (e.g., $hklib-core/...)
 *
 * @returns {string|null} Resolved filesystem path or null
 */
function resolveAliasPath(aliasPath) {
  for (const [alias, target] of Object.entries(PROJECT_ALIASES)) {
    if (aliasPath === alias || aliasPath.startsWith(alias + '/')) {
      const pathAfterAlias = aliasPath.slice(alias.length);

      // If target is already absolute, use it directly
      if (isAbsolute(target)) {
        return join(target, pathAfterAlias);
      }

      return join(PROJECT_ROOT, target, pathAfterAlias);
    }
  }
  return null;
}

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
 * Find highest-level barrel export file that exports the target
 *
 * For a path like $lib/ui/components/profile-blocks/ProfileBlocks.svelte:
 * - Check $lib/ui.js
 * - Check $lib/ui/components.js
 * - Check $lib/ui/components/profile-blocks.js
 *
 * @param {string} importPath - Import path (e.g., $lib/ui/components/...)
 * @param {string} filePath - Source file making the import
 *
 * @returns {Promise<string|null>} Barrel file path or null
 */
async function findBarrelExportFile(importPath, filePath) {
  if (!importPath.startsWith('$lib/')) return null;

  // Remove $lib/ prefix and extract path segments
  const pathWithoutLib = importPath.replace('$lib/', '');
  const parts = pathWithoutLib.split('/');

  // Extract the target filename (last part, possibly with extension)
  const targetFile = parts[parts.length - 1];
  const targetBase = targetFile.replace(/\.(js|svelte)$/, '');

  // Check from highest level down (but skip the filename itself)
  for (let i = 1; i < parts.length; i++) {
    const barrelPath = '$lib/' + parts.slice(0, i).join('/') + '.js';
    const fsBarrelPath = join(
      PROJECT_ROOT,
      barrelPath.replace('$lib/', 'src/lib/')
    );

    try {
      const stats = await stat(fsBarrelPath);
      if (stats.isFile()) {
        // Check if this barrel file exports our target
        const content = await readFile(fsBarrelPath, 'utf-8');

        // Look for exports that match the target file
        // Patterns:
        // export { ProfileBlocks } from './path/ProfileBlocks.svelte';
        // export * from './path/ProfileBlocks.svelte';
        // More flexible pattern to catch various export styles
        const exportPattern = new RegExp(
          `export\\s+(?:\\*|\\{[^}]*\\})\\s+from\\s+['"](?:.*/)?(${targetBase}(?:\\.(?:js|svelte))?)['"]`,
          'gm'
        );

        if (exportPattern.test(content)) {
          return barrelPath;
        }
      }
    } catch {
      // File doesn't exist or can't be read, continue
    }
  }

  return null;
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
 * Extract imported names from import statement
 *
 * @param {string} line - Import statement line
 *
 * @returns {string[]} Array of imported names
 */
function extractImportNames(line) {
  const names = [];

  // Default import: import Foo from '...'
  const defaultMatch = line.match(/import\s+(\w+)\s+from/);
  if (defaultMatch) {
    names.push(defaultMatch[1]);
  }

  // Named imports: import { Foo, Bar } from '...'
  const namedMatch = line.match(/import\s+\{([^}]+)\}\s+from/);
  if (namedMatch) {
    const namedImports = namedMatch[1]
      .split(',')
      .map(name => {
        // Handle 'as' aliases: { Foo as Bar } → extract 'Foo'
        const parts = name.trim().split(/\s+as\s+/);
        return parts[0].trim();
      })
      .filter(name => name && name !== '*');
    names.push(...namedImports);
  }

  return names;
}

/**
 * Find highest-level barrel export in external package
 *
 * For @hkdigital/lib-core/ui/primitives/buttons/index.js:
 * - Check @hkdigital/lib-core/ui/primitives.js
 * - Check @hkdigital/lib-core/ui.js
 *
 * @param {string} importPath - External import path
 * @param {string} targetName - Name of export to find
 *
 * @returns {Promise<string|null>} Suggested barrel path or null
 */
async function findExternalBarrelExport(importPath, targetName) {
  // Extract package name (handle scoped packages)
  const parts = importPath.split('/');
  let pkgName;
  let pathInPackage;

  if (importPath.startsWith('@')) {
    // Scoped package: @scope/package/path/to/file
    pkgName = `${parts[0]}/${parts[1]}`;
    pathInPackage = parts.slice(2);
  } else {
    // Regular package: package/path/to/file
    pkgName = parts[0];
    pathInPackage = parts.slice(1);
  }

  // Check if this scope should be validated
  const scope = pkgName.startsWith('@') ?
    pkgName.split('/')[0] : null;
  if (scope && !EXTERNAL_SCOPES_TO_VALIDATE.includes(scope)) {
    return null;
  }

  // If no path in package, nothing to suggest
  if (pathInPackage.length === 0) return null;

  const nodeModulesPath = join(PROJECT_ROOT, 'node_modules', pkgName);

  // Extract target to find (last part without extension)
  const lastPart = pathInPackage[pathInPackage.length - 1];
  const targetBase = lastPart.replace(/\.(js|svelte)$/, '');

  // Only check for specific import types (matches internal logic)
  // 1. Explicit index.js imports
  // 2. Component files (.svelte)
  // 3. Class files (capitalized .js)
  let shouldCheck = false;

  if (lastPart === 'index.js') {
    shouldCheck = true;
  } else if (lastPart.endsWith('.svelte')) {
    shouldCheck = true;
  } else if (lastPart.match(/^[A-Z][^/]*\.js$/)) {
    shouldCheck = true;
  }

  if (!shouldCheck) return null;

  // Read package.json to check for exports mapping
  let exportsMapping = null;
  try {
    const pkgJsonPath = join(nodeModulesPath, 'package.json');
    const pkgJsonContent = await readFile(pkgJsonPath, 'utf-8');
    const pkgJson = JSON.parse(pkgJsonContent);

    // Check if there's a "./*" export mapping
    if (pkgJson.exports && pkgJson.exports['./*']) {
      const mapping = pkgJson.exports['./*'];
      const mappingStr = typeof mapping === 'string' ?
        mapping : mapping.default;

      // Extract prefix from mapping like "./dist/*" -> "dist/"
      if (mappingStr && mappingStr.includes('*')) {
        exportsMapping = mappingStr.replace(/\/?\*$/, '');
        if (exportsMapping.startsWith('./')) {
          exportsMapping = exportsMapping.slice(2);
        }
        if (exportsMapping && !exportsMapping.endsWith('/')) {
          exportsMapping += '/';
        }
      }
    }
  } catch {
    // Could not read package.json, continue without mapping
  }

  // Try progressively higher-level barrel files
  for (let i = 1; i < pathInPackage.length; i++) {
    const barrelPath = pathInPackage.slice(0, i).join('/') + '.js';

    // Try both with and without exports mapping
    const pathsToTry = [
      join(nodeModulesPath, barrelPath),
      exportsMapping ?
        join(nodeModulesPath, exportsMapping + barrelPath) : null
    ].filter(Boolean);

    for (const fsBarrelPath of pathsToTry) {
      try {
        const stats = await stat(fsBarrelPath);
        if (stats.isFile()) {
          const content = await readFile(fsBarrelPath, 'utf-8');

          // Check if this barrel exports our target
          // Patterns to match:
          // export { TextButton } from './path';
          // export * from './path';
          const exportPatterns = [
            // Named export with exact name
            new RegExp(
              `export\\s+\\{[^}]*\\b${targetName}\\b[^}]*\\}`,
              'm'
            ),
            // Re-export all
            /export\s+\*\s+from/,
            // Default export
            new RegExp(`export\\s+default\\s+${targetName}\\b`, 'm')
          ];

          if (exportPatterns.some(pattern => pattern.test(content))) {
            return `${pkgName}/${barrelPath}`;
          }
        }
      } catch {
        // File doesn't exist, continue
      }
    }
  }

  return null;
}

/**
 * Find highest-level barrel export in alias path
 *
 * For $hklib-core/ui/primitives/buttons/index.js:
 * - Check $hklib-core/ui/primitives.js
 * - Check $hklib-core/ui.js
 *
 * @param {string} importPath - Alias import path
 * @param {string} targetName - Name of export to find
 *
 * @returns {Promise<string|null>} Suggested barrel path or null
 */
async function findAliasBarrelExport(importPath, targetName) {
  // Find the matching alias
  let matchedAlias = null;
  let pathAfterAlias = null;

  for (const alias of Object.keys(PROJECT_ALIASES)) {
    if (importPath === alias || importPath.startsWith(alias + '/')) {
      matchedAlias = alias;
      pathAfterAlias = importPath.slice(alias.length);
      if (pathAfterAlias.startsWith('/')) {
        pathAfterAlias = pathAfterAlias.slice(1);
      }
      break;
    }
  }

  if (!matchedAlias || !pathAfterAlias) {
    return null;
  }

  const pathInAlias = pathAfterAlias.split('/');

  // If no path in alias, nothing to suggest
  if (pathInAlias.length === 0 || pathInAlias[0] === '') {
    return null;
  }

  const aliasRootPath = resolveAliasPath(matchedAlias);

  // Extract target to find (last part without extension)
  const lastPart = pathInAlias[pathInAlias.length - 1];
  const targetBase = lastPart.replace(/\.(js|svelte)$/, '');

  // Only check for specific import types (matches internal logic)
  // 1. Explicit index.js imports
  // 2. Component files (.svelte)
  // 3. Class files (capitalized .js)
  let shouldCheck = false;

  if (lastPart === 'index.js') {
    shouldCheck = true;
  } else if (lastPart.endsWith('.svelte')) {
    shouldCheck = true;
  } else if (lastPart.match(/^[A-Z][^/]*\.js$/)) {
    shouldCheck = true;
  }

  if (!shouldCheck) return null;

  // Try progressively higher-level barrel files
  for (let i = 1; i < pathInAlias.length; i++) {
    const barrelPath = pathInAlias.slice(0, i).join('/') + '.js';
    const fsBarrelPath = join(aliasRootPath, barrelPath);

    try {
      const stats = await stat(fsBarrelPath);
      if (stats.isFile()) {
        const content = await readFile(fsBarrelPath, 'utf-8');

        // Check if this barrel exports our target
        // Patterns to match:
        // export { TextButton } from './path';
        // export * from './path';
        const exportPatterns = [
          // Named export with exact name
          new RegExp(
            `export\\s+\\{[^}]*\\b${targetName}\\b[^}]*\\}`,
            'm'
          ),
          // Re-export all
          /export\s+\*\s+from/,
          // Default export
          new RegExp(`export\\s+default\\s+${targetName}\\b`, 'm')
        ];

        if (exportPatterns.some(pattern => pattern.test(content))) {
          return `${matchedAlias}/${barrelPath}`;
        }
      }
    } catch {
      // File doesn't exist, continue
    }
  }

  return null;
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
  const isInLib = filePath.includes('/src/lib/');
  const isInRoutes = filePath.includes('/src/routes/');

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
    let importPath = importPathRaw.split('?')[0];

    // Check if using $src/lib when $lib is available (built-in SvelteKit)
    // Report the issue and normalize the path for further validation
    let hasSrcLibIssue = false;
    if (importPath.startsWith('$src/lib/') || importPath === '$src/lib') {
      hasSrcLibIssue = true;
      const optimizedPath = importPath.replace('$src/lib', '$lib');
      errors.push(
        `${relativePath}:${lineNum}\n` +
        `  from '${importPath}'\n` +
        `  => from '${optimizedPath}' (use built-in $lib alias)`
      );
      // Normalize for further validation
      importPath = optimizedPath;
    }

    // Check if import uses a project alias
    const isAliasImport = Object.keys(PROJECT_ALIASES).some(
      alias => importPath === alias || importPath.startsWith(alias + '/')
    );

    if (isAliasImport) {
      // Extract imported names from the import statement
      const importedNames = extractImportNames(line);

      // Check each imported name for barrel exports
      for (const importedName of importedNames) {
        const barrelPath = await findAliasBarrelExport(
          importPath,
          importedName
        );

        if (barrelPath) {
          errors.push(
            `${relativePath}:${lineNum}\n` +
            `  from '${importPath}'\n` +
            `  => from '${barrelPath}' (use barrel export)`
          );
          break; // Only report once per line
        }
      }

      // Skip further validation for alias imports
      continue;
    }

    // Check external packages from configured scopes
    const isExternalPackage = !importPath.startsWith('./') &&
      !importPath.startsWith('../') &&
      !importPath.startsWith('$lib/');

    if (isExternalPackage) {
      // Extract package name/scope
      const parts = importPath.split('/');
      const scope = importPath.startsWith('@') ? parts[0] : null;

      // Check if this scope should be validated
      if (scope && EXTERNAL_SCOPES_TO_VALIDATE.includes(scope)) {
        // Extract imported names from the import statement
        const importedNames = extractImportNames(line);

        // Check each imported name for barrel exports
        for (const importedName of importedNames) {
          const barrelPath = await findExternalBarrelExport(
            importPath,
            importedName
          );

          if (barrelPath) {
            errors.push(
              `${relativePath}:${lineNum}\n` +
              `  from '${importPath}'\n` +
              `  => from '${barrelPath}' (use barrel export)`
            );
            break; // Only report once per line
          }
        }
      }

      // Skip further validation for external packages
      continue;
    }

    // Check 1: Cross-domain relative imports (3+ levels up)
    // Only enforce for lib files
    if (isInLib && importPath.match(/^\.\.\/\.\.\/\.\.\//)) {
      // Convert relative path to $lib/ path
      const fsPath = resolve(dirname(filePath), importPath);
      const libPath = fsPath.replace(
        join(PROJECT_ROOT, 'src/lib/'),
        '$lib/'
      );

      // Check for barrel export files
      const barrelFile = await findBarrelExportFile(libPath, filePath);

      if (barrelFile) {
        errors.push(
          `${relativePath}:${lineNum}\n` +
          `  from '${importPath}'\n` +
          `  => from '${barrelFile}' (use barrel export)`
        );
      } else {
        errors.push(
          `${relativePath}:${lineNum}\n` +
          `  from '${importPath}'\n` +
          `  => from '${libPath}'`
        );
      }
      continue;
    }

    // Check 2: Local index.js imports (skip for test files and routes)
    // Allow ./index.js and ./subfolder/index.js but flag parent navigation
    // Only enforce for lib files
    if (isInLib && !isTestFile && importPath.match(/\/index\.js$/)) {
      // Allow same-directory and child directory imports
      // Examples: ./index.js, ./subfolder/index.js, ./(meta)/index.js
      // Flag parent navigation: ../index.js, ../../index.js
      const isParentNavigation = importPath.match(/^\.\..*\/index\.js$/);

      if (isParentNavigation) {
        errors.push(
          `${relativePath}:${lineNum}\n` +
          `  from '${importPath}'\n` +
          `  => Use $lib/ or import specific file instead`
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
                `${relativePath}:${lineNum}\n` +
                `  from '${importPath}'\n` +
                `  => from '${correctImport}'`
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
        // For $lib/ imports, suggest creating a barrel export file
        // following the library pattern: folder → matching .js file
        if (importPath.startsWith('$lib/')) {
          errors.push(
            `${relativePath}:${lineNum}\n` +
            `  from '${importPath}'\n` +
            `  => Create export file: ${importPath}.js (remove index.js)`
          );
          continue;
        }

        // For relative imports with parent navigation,
        // suggest creating export file
        const wouldBeParentNavigation = importPath.match(/^\.\.\//);
        if (wouldBeParentNavigation) {
          errors.push(
            `${relativePath}:${lineNum}\n` +
            `  from '${importPath}'\n` +
            `  => Create export file: ${importPath}.js or ` +
            `import specific file`
          );
          continue;
        }

        // For local relative imports (./path), suggest index.js
        const suggestion = importPath.endsWith('/') ?
          `${importPath}index.js` : `${importPath}/index.js`;
        errors.push(
          `${relativePath}:${lineNum}\n` +
          `  from '${importPath}'\n` +
          `  => from '${suggestion}'`
        );
        continue;
      }
    }

    // Check 5: Suggest barrel exports for deep $lib/ imports
    // Only for specific cases, not for named export files
    if (isInLib && importPath.startsWith('$lib/')) {
      const pathWithoutLib = importPath.replace('$lib/', '');
      const segments = pathWithoutLib.split('/');

      // Only suggest barrel exports for:
      // 1. Directory imports (no extension, resolves to index.js)
      // 2. Explicit index.js imports
      // 3. Deep component/class files (.svelte or capitalized .js files)
      let shouldCheckBarrel = false;

      if (segments.length >= 3) {
        const lastSegment = segments[segments.length - 1];

        // Case 1: Explicit index.js import
        if (lastSegment === 'index.js') {
          shouldCheckBarrel = true;
        }
        // Case 2: Directory import (will be caught by Check 4)
        // Case 3: Component or class file (.svelte or capitalized)
        else if (lastSegment.endsWith('.svelte')) {
          shouldCheckBarrel = true;
        } else if (lastSegment.match(/^[A-Z][^/]*\.js$/)) {
          // Capitalized .js file (likely a class)
          shouldCheckBarrel = true;
        }
        // Skip named export files like methods.js, http.js, etc.
        // These are lowercase and ARE the public API
      }

      if (shouldCheckBarrel) {
        const barrelFile = await findBarrelExportFile(importPath, filePath);

        if (barrelFile) {
          errors.push(
            `${relativePath}:${lineNum}\n` +
            `  from '${importPath}'\n` +
            `  => from '${barrelFile}' (use barrel export for shorter imports)`
          );
          continue;
        }
      }
    }

    // Check 6: File existence (after all other checks)
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
        `${relativePath}:${lineNum}\n` +
        `  from '${importPath}'\n` +
        `  => Import path does not exist`
      );
    }
  }

  return errors;
}

/**
 * Main validation function
 */
async function main() {
  // Load package version from lib-core's package.json
  const pkgJsonPath = join(LIB_ROOT, 'package.json');
  const pkgJsonContent = await readFile(pkgJsonPath, 'utf-8');
  const pkgJson = JSON.parse(pkgJsonContent);

  console.log(`Using script from @hkdigital/lib-core v${pkgJson.version}`);
  console.log(`Validating import paths...`);

  // Load project aliases from svelte.config.js
  PROJECT_ALIASES = await loadAliases();

  if (Object.keys(PROJECT_ALIASES).length > 0) {
    console.log('Found project aliases:');
    for (const [alias, target] of Object.entries(PROJECT_ALIASES)) {
      console.log(`  ${alias} → ${target}`);
    }
    console.log();
  }

  const files = await findFiles(SRC_DIR);
  const allErrors = [];

  for (const file of files) {
    const errors = await validateFile(file);
    allErrors.push(...errors);
  }

  if (allErrors.length > 0) {
    console.error('❌ Found import path violations:\n');
    allErrors.forEach(error => console.error(`${error}\n`));
    console.error(`${allErrors.length} error(s) found.`);
    process.exit(1);
  }

  console.log('\x1b[32m✔ All import paths are valid!\x1b[0m');
}

main().catch(error => {
  console.error('Validation script error:', error);
  process.exit(1);
});
