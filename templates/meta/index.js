/**
 * Meta components configured for your app
 *
 * This file imports the library components and configures them with your
 * app's config. Components are automatically updated when you update the
 * @hkdigital/lib-core library.
 */

import { Favicons, PWA, SEO } from '@hkdigital/lib-core/meta/components';
import { createLangUtils } from '@hkdigital/lib-core/meta/utils';
import * as config from './config.js';

// Create configured language utilities
const { getLangFromPath, injectLang, handleLang } = createLangUtils(config);

// Re-export components (they'll receive config as a prop in your layout)
export { Favicons, PWA, SEO };

// Export language utilities
export { getLangFromPath, injectLang, handleLang };

// Export config for convenience
export { config };
