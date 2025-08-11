# Reusable Explorer Component

This explorer provides an elegant way to navigate nested folder structures with dynamic routing support.

## Features

- **Dynamic routing**: Uses SvelteKit's `[...path]` syntax for clean URLs
- **Multi-level navigation**: Supports unlimited nesting depth
- **Visual distinction**: Endpoints (examples) have borders, folders don't
- **Breadcrumb navigation**: Easy navigation back to previous levels
- **Reusable**: Can be copied to other libraries with minimal configuration

## Usage in Other Libraries

To use this explorer in another library, copy the entire `explorer` folder to your `src/routes/` directory and make these adjustments:

### 1. Update Import Paths

In the following files, update import paths to match your library structure:

**+page.svelte and [...path]/+page.svelte:**
```javascript
// Update TopBar import path
import TopBar from '../your-topbar/TopBar.svelte';

// Update style import path  
<style src="../your-styles/style.css"></style>
```

**+layout.server.js and [...path]/+page.server.js:**
```javascript
// Update scanRouteFolders import
import { scanRouteFolders } from '$lib/your-util-path/index.js';

// Update directory path to scan
dirPath: import.meta.dirname + '/../your-examples-folder'
```

### 2. Configure Directory Structure

Update these settings in the server files:

```javascript
const folders = await scanRouteFolders({
  dirPath: import.meta.dirname + '/../your-examples-folder',
  maxDepth: 4, // Adjust based on your nesting needs
  skipFolders: new Set(['assets', '_todo', 'your-skip-folders'])
});
```

### 3. Customize Styling

The explorer uses CSS custom properties for theming. Ensure your library defines these variables:

```css
--color-primary-500
--color-primary-contrast-500
--color-surface-100, --color-surface-200, etc.
--color-error-500
```

Or customize the Explorer.svelte styles to match your design system.

## File Structure

```
routes/explorer/
├── README.md                    # This documentation
├── +layout.svelte              # Layout wrapper
├── +layout.server.js           # Navigation data loading
├── +page.svelte                # Root explorer page
├── +page.server.js             # Root page server logic
├── Explorer.svelte             # Main explorer component
└── [...path]/
    ├── +page.svelte            # Dynamic route handler
    └── +page.server.js         # Dynamic route server logic
```

## How It Works

1. **Root Route** (`/explorer`): Shows the initial navigation structure
2. **Dynamic Routes** (`/explorer/ui/components/...`): Handles nested navigation
3. **Example Detection**: When a path matches an actual example, redirects to `/examples/{path}`
4. **Breadcrumbs**: Automatically generated based on current path
5. **Visual Cues**: Endpoints get borders, folders remain borderless

## Navigation Data Structure

The explorer expects navigation data in this format:

```javascript
{
  "category": {
    "name": "category",
    "displayName": "Category",
    "isEndpoint": false,
    "children": {
      "subcategory": {
        "name": "subcategory", 
        "displayName": "Sub Category",
        "isEndpoint": false,
        "children": {
          "example": {
            "name": "example",
            "displayName": "Example Name", 
            "isEndpoint": true,
            "fullPath": "category/subcategory/example"
          }
        }
      }
    }
  }
}
```

## Customization

- **Depth Limit**: Adjust `maxDepth` in scanRouteFolders
- **Skip Folders**: Add folder names to `skipFolders` Set
- **Styling**: Modify Explorer.svelte styles or CSS custom properties
- **Navigation Logic**: Customize the `buildNavigationStructure` function