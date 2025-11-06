import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Generates a Vite configuration object with common HKdigital settings
 *
 * @param {object} [options] Configuration options
 * @param {boolean} [options.enableImagetools=true]
 *   Enable vite-imagetools plugin
 * @param {boolean} [options.enableVitest=true]
 *   Include Vitest configuration
 * @param {boolean} [options.enableVitestWorkspace=false]
 *   Use Vitest workspace with separate browser/node projects
 * @param {boolean} [options.enableSvelteKit=true]
 *   Enable SvelteKit plugin
 * @param {object} [options.customDefines={}]
 *   Additional define values
 * @param {Array<any>} [options.customPlugins=[]]
 *   Additional Vite plugins
 * @param {object} [options.imagetoolsOptions={}]
 *   Options for imagetools config
 * @param {string} [options.packageJsonPath='./package.json']
 *   Path to package.json
 * @param {object} [options.vitestOptions={}]
 *   Custom Vitest configuration options
 *
 * @returns {Promise<object>} Vite configuration object
 */
export async function generateViteConfig(options = {}) {
  const {
    enableImagetools = true,
    enableVitest = true,
    enableVitestWorkspace = false,
    enableSvelteKit = true,
    customDefines = {},
    customPlugins = [],
    imagetoolsOptions = {},
    packageJsonPath = './package.json',
    vitestOptions = {}
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

      // Custom transform to ensure alpha channel based on directive
      const ensureAlphaTransform = (config) => {
        // Only apply if ensureAlpha directive is present
        if (!config.ensureAlpha) return undefined;

        return async (image) => {
          // Force RGBA output by making one pixel slightly transparent
          // This prevents Sharp from optimizing back to RGB palette
          const metadata = await image.metadata();

          return image
            .ensureAlpha()
            .composite([{
              input: Buffer.from([0, 0, 0, 254]), // RGBA: black with 254 alpha (nearly opaque)
              raw: { width: 1, height: 1, channels: 4 },
              top: 0,
              left: 0,
              blend: 'over'
            }]);
        };
      };

      plugins.push(
        imagetools({
          defaultDirectives: generateDefaultDirectives(imagetoolsOptions),
          resolveConfigs: generateResponseConfigs(imagetoolsOptions),
          extendTransforms: (builtins) => [
            ...builtins,
            ensureAlphaTransform
          ]
        })
      );
    } catch (error) {
      const errorMessage = `
╭─────────────────────────────────────────────────────────────╮
│                     Missing Dependency                      │
├─────────────────────────────────────────────────────────────┤
│  'vite-imagetools' is required when enableImagetools: true  │
│  Install it with: pnpm add -D vite-imagetools               │
│  Or set enableImagetools: false                             │
╰─────────────────────────────────────────────────────────────╯`;
      console.error(errorMessage);
      throw new Error('vite-imagetools is required when enableImagetools: true');
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
    },
  };

  if (enableVitest && !enableVitestWorkspace) {
    config.test = {
      include: [
        'src/**/*.{test,spec}.{js,ts}',
        'src/**/*.svelte.{test,spec}.{js,ts}'
      ],
      ...vitestOptions
    };
  }

  if (enableVitest && enableVitestWorkspace) {
    // Workspace mode: separate projects for jsdom and node tests
    // jsdom tests: *.svelte.test.js (component tests with jsdom)
    // node tests: *.test.js, *.spec.js (server-side tests)
    config.test = {
      ...vitestOptions,
      projects: [
        {
          plugins,
          test: {
            name: 'jsdom',
            environment: 'jsdom',
            include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
            ...vitestOptions.jsdom
          },
          resolve: {
            conditions: ['browser']
          }
        },
        {
          plugins,
          test: {
            name: 'node',
            environment: 'node',
            include: ['src/**/*.{test,spec}.{js,ts}'],
            exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
            ...vitestOptions.node
          }
        }
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
 * @param {string[]} [options.additionalPatterns=[]]
 *   Additional test patterns
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
