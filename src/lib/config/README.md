# Config

Reusable configuration generators for HKdigital projects.

## Vite Configuration

The `vite.js` provides generators for common Vite setups used across HKdigital projects.

### Quick Start

```javascript
// vite.config.js
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { generateViteConfig } from '@hkdigital/lib-core/config/vite.js';

export default defineConfig(
  await generateViteConfig({
    enableImagetools: true
  })
);
```

### Functions

#### `generateViteConfig(options)`

Generates a complete Vite configuration with HKdigital defaults.

**Options:**
- `enableImagetools` (boolean, default: `true`) - Include vite-imagetools plugin
- `enableVitest` (boolean, default: `true`) - Include Vitest test configuration
- `enableSvelteKit` (boolean, default: `true`) - Include SvelteKit plugin
- `customDefines` (object, default: `{}`) - Additional define values
- `customPlugins` (array, default: `[]`) - Additional Vite plugins
- `imagetoolsOptions` (object, default: `{}`) - Options passed to imagetools config
- `packageJsonPath` (string, default: `'./package.json'`) - Path to package.json

**Built-in defines:**
- `import.meta.env.VITE_APP_VERSION` - Version from package.json
- `import.meta.env.VITE_BUILD_TIMESTAMP` - Build timestamp

**Example:**
```javascript
export default defineConfig(
  await generateViteConfig({
    enableImagetools: true,
    enableVitest: true,
    customDefines: {
      'import.meta.env.VITE_API_URL': JSON.stringify('https://api.example.com')
    },
    imagetoolsOptions: {
      widths: [1920, 1536, 1024, 640]
    }
  })
);
```


## Imagetools Configuration

When `enableImagetools: true`, install the imagetools dependency:

**For projects/applications:**
```bash
pnpm add -D vite-imagetools
```

**For other libraries:**
```bash
pnpm add -D --save-peer vite-imagetools
```

### TypeScript Support

For TypeScript and JavaScript projects using VS Code or other TypeScript-aware editors, add to your `app.d.ts`:

```typescript
import '@hkdigital/lib-core/config/imagetools.d.ts';
```

**Why this is needed:**
- Provides type definitions for image imports with query parameters (e.g., `hero.jpg?preset=photo`)
- Enables IntelliSense and autocompletion for imagetools directives in your editor
- Prevents TypeScript errors when importing processed images
- Works for both TypeScript and JavaScript projects (VS Code uses TypeScript for JS intellisense)

**What it enables:**
```javascript
// These imports will have proper typing and editor support
import heroImage from '$lib/assets/hero.jpg?preset=photo';
import heroResponsive from '$lib/assets/hero.jpg?preset=photo&responsive';
```

### Image Usage

With imagetools enabled, you can use images with processing directives:

```javascript
// Basic usage
import heroImage from '$lib/assets/hero.jpg?preset=photo';

// Responsive images
import heroResponsive from '$lib/assets/hero.jpg?preset=photo&responsive';
```

**Available presets:**
- `default` - AVIF format, 90% quality
- `photo` - JPG format, 95% quality, returns metadata
- `render` - JPG format, 95% quality, returns metadata
- `gradient` - JPG format, 95% quality, returns metadata
- `drawing` - AVIF format, 90% quality, returns metadata
- `savedata` - AVIF format, 85% quality, returns metadata
- `blur` - AVIF format, 50% quality with blur effect, returns metadata

## Migration from Direct Config

### Before
```javascript
// vite.config.js
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { imagetools } from 'vite-imagetools';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import {
  generateDefaultDirectives,
  generateResponseConfigs
} from '@hkdigital/lib-core/config/imagetools-config.js';

const packageJson = JSON.parse(
  readFileSync(resolve('./package.json'), 'utf-8')
);

export default defineConfig({
  plugins: [
    sveltekit(),
    imagetools({
      defaultDirectives: generateDefaultDirectives(),
      resolveConfigs: generateResponseConfigs()
    })
  ],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
    'import.meta.env.VITE_BUILD_TIMESTAMP': JSON.stringify(new Date().toISOString())
  },
  test: {
    include: [
      'src/**/*.{test,spec}.{js,ts}',
      'src/**/*.svelte.{test,spec}.{js,ts}'
    ]
  }
});
```

### After
```javascript
// vite.config.js
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { generateViteConfig } from '@hkdigital/lib-core/config/vite.js';

export default defineConfig(
  await generateViteConfig()
);
```
