# Reusable Explorer Component

This explorer provides an elegant way to navigate nested folder structures 
with dynamic routing support.

## Features

- **Dynamic routing**: Uses SvelteKit's `[...path]` syntax for clean URLs
- **Multi-level navigation**: Supports unlimited nesting depth
- **Visual distinction**: Endpoints have external link icons, folders don't
- **Breadcrumb navigation**: Easy navigation back to previous levels
- **Configurable**: Folder names and paths configured via `config.js`
- **Fast redirects**: Server-side redirects for immediate navigation
- **Reusable**: Can be copied to other libraries with minimal configuration

## Configuration

The explorer uses a centralized configuration system defined in `config.js`:

```javascript
// config.js
export const EXPLORED_FOLDER_NAME = 'examples';
export const ROOT_DISPLAY_NAME = 'examples';
export const FOLDER_PATH = '../examples';
```

### Configuration Options

- **EXPLORED_FOLDER_NAME**: The folder name used in URLs and breadcrumbs
- **ROOT_DISPLAY_NAME**: Display name for the root navigation column
- **FOLDER_PATH**: Relative path from explorer to the target folder

## Usage in Other Libraries

To use this explorer in another library:

1. Copy the entire `explorer` folder to your `src/routes/` directory
2. Update the folder path to explore in `config.js`
3. Add the `$hklib-core` alias to your `svelte.config.js`:
   ```javascript
   alias: {
     '$hklib-core': '@hkdigital/lib-core'
   }
   ```

### Styling

The explorer uses the HKdigital Design System for consistent theming. 
Key features include:

## File Structure

```
routes/explorer/
├── README.md                    # This documentation
├── config.js                   # Configuration for folder names and paths
├── +layout.svelte              # Layout wrapper
├── +layout.server.js           # Navigation data loading
├── +page.svelte                # Root explorer page
├── +page.server.js             # Root page server logic
├── components/                  # Explorer components (included)
│   ├── Explorer.svelte         # Main explorer component
│   ├── TopBar.svelte           # Top navigation component
│   ├── topbar.css              # TopBar styles
│   └── index.js                # Export file
└── [...path]/
    ├── +page.svelte            # Dynamic route handler
    ├── +page.server.js         # Dynamic route server logic (with redirect)
    └── style.css               # Page-specific styles
```

## How It Works

1. **Root Route** (`/explorer`): Shows the initial navigation structure
2. **Dynamic Routes** (`/explorer/ui/components/...`): Handles nested navigation
3. **Fast Redirects**: Server-side redirects immediately route valid endpoints 
   to `/{EXPLORED_FOLDER_NAME}/{path}`
4. **Breadcrumbs**: Automatically generated based on current path using config
5. **Visual Cues**: Endpoints get external link icons, folders remain plain

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

- **Folder Configuration**: Update `config.js` with your folder settings
- **Depth Limit**: Adjust `maxDepth` in scanRouteFolders calls
- **Skip Folders**: Add folder names to `skipFolders` Set in server files  
- **Visual Elements**: Modify Explorer.svelte for different icons or layouts
- **Navigation Logic**: Customize the `buildNavigationStructure` function
