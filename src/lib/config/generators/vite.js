import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Generates a Vite configuration object with common HKdigital settings
 *
 * @param {object} [options] Configuration options
 * @param {boolean} [options.enableImagetools=true] Enable vite-imagetools plugin
 * @param {boolean} [options.enableVitest=true] Include Vitest configuration
 * @param {boolean} [options.enableSvelteKit=true] Enable SvelteKit plugin
 * @param {object} [options.customDefines={}] Additional define values
 * @param {Array} [options.customPlugins=[]] Additional Vite plugins
 * @param {object} [options.imagetoolsOptions={}] Options for imagetools config
 * @param {string} [options.packageJsonPath='./package.json'] Path to package.json
 *
 * @returns {Promise<object>} Vite configuration object
 */
export async function generateViteConfig(options = {}) {
  const {
    enableImagetools = true,
    enableVitest = true,
    enableSvelteKit = true,
    customDefines = {},
    customPlugins = [],
    imagetoolsOptions = {},
    packageJsonPath = './package.json'
  } = options;

  // Read package.json for version
  const packageJson = JSON.parse(
    readFileSync(resolve(packageJsonPath), 'utf-8')
  );

  const plugins = [...customPlugins];

  // Add SvelteKit plugin (provides $lib alias and other SvelteKit features)
  if (enableSvelteKit) {
    try {
      const { sveltekit } = await import('@sveltejs/kit/vite');
      plugins.push(sveltekit());
    } catch (error) {
      console.error(error);
      console.warn(
        '@sveltejs/kit/vite not found. Install it to enable SvelteKit support.'
      );
    }
  }

  // Conditionally add imagetools
  if (enableImagetools) {
    try {
      const { imagetools } = await import('vite-imagetools');
      const { 
        generateDefaultDirectives, 
        generateResponseConfigs 
      } = await import('./imagetools.js');

      plugins.push(
        imagetools({
          defaultDirectives: generateDefaultDirectives(imagetoolsOptions),
          resolveConfigs: generateResponseConfigs(imagetoolsOptions)
        })
      );
    } catch (error) {
      console.error(error);
      console.warn(
        'vite-imagetools not found. Install it to enable imagetools support.'
      );
    }
  }

  const config = {
    plugins,
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
      'import.meta.env.VITE_BUILD_TIMESTAMP': JSON.stringify(
        new Date().toISOString()
      ),
      ...customDefines
    }
  };

  if (enableVitest) {
    config.test = {
      include: [
        'src/**/*.{test,spec}.{js,ts}',
        'src/**/*.svelte.{test,spec}.{js,ts}'
      ]
    };
  }

  return config;
}

/**
 * Generates build-time defines for Vite
 *
 * @param {object} [options] Configuration options
 * @param {string} [options.packageJsonPath='./package.json'] Path to package.json
 * @param {object} [options.customDefines={}] Additional define values
 *
 * @returns {object} Define configuration object
 */
export function generateViteDefines(options = {}) {
  const {
    packageJsonPath = './package.json',
    customDefines = {}
  } = options;

  const packageJson = JSON.parse(
    readFileSync(resolve(packageJsonPath), 'utf-8')
  );

  return {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
    'import.meta.env.VITE_BUILD_TIMESTAMP': JSON.stringify(
      new Date().toISOString()
    ),
    ...customDefines
  };
}

/**
 * Generates Vitest configuration
 *
 * @param {object} [options] Configuration options
 * @param {string[]} [options.additionalPatterns=[]] Additional test patterns
 *
 * @returns {object} Vitest configuration object
 */
export function generateVitestConfig(options = {}) {
  const { additionalPatterns = [] } = options;

  const defaultPatterns = [
    'src/**/*.{test,spec}.{js,ts}',
    'src/**/*.svelte.{test,spec}.{js,ts}'
  ];

  return {
    include: [...defaultPatterns, ...additionalPatterns]
  };
}
