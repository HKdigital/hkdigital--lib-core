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
      const { generateDefaultDirectives, generateResponseConfigs } =
        await import('./imagetools.js');

      const sharp = (await import('sharp')).default;

      plugins.push(
        imagetools({
          defaultDirectives: generateDefaultDirectives(imagetoolsOptions),
          resolveConfigs: generateResponseConfigs(imagetoolsOptions),
          cache: {
            // @note disable caching to test custom transforms
            enabled: false,
            // enabled: true,
            dir: './node_modules/.cache/imagetools',
            retention: 60 * 60 * 24 * 10 // 10 days
          },
          // @see https://www.npmjs.com/package/vite-imagetools?activeTab=readme
          // extendOutputFormats(builtins) {
          //   return {
          //     ...builtins,
          //     png: (config) => ({
          //       format: 'png',
          //       transform: (image) => image.withMetadata({ density: 300 })
          //     })
          //   };
          // },
          extendTransforms(builtins) {
            const ensureAlphaTransform = (config, ctx) => {
              // Check if 'ensureAlpha' directive is in the URL
              if (!('ensureAlpha' in config)) {
                return undefined; // This transform doesn't apply
              }

              // Mark the parameter as used
              ctx.useParam('ensureAlpha');

              // Return the actual transformation function
              return (image) => {
                return image
                  .ensureAlpha()
                  .withMetadata({ xmp: '' });
              };
            };

            // Return an ARRAY with builtins + your custom transform
            return [...builtins, ensureAlphaTransform];
          }
        })
      );

      // eslint-disable-next-line no-unused-vars
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
      throw new Error(
        'vite-imagetools is required when enableImagetools: true'
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

  if (enableVitest && !enableVitestWorkspace) {
    // @ts-ignore
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
    // @ts-ignore
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
  const { packageJsonPath = './package.json', customDefines = {} } = options;

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
