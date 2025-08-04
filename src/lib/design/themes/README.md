# Themes

This folder contains theme configurations for the SvelteKit library, built on top of Skeleton.dev's theming system.

## Current Themes

### hkdev
The main theme for this project, containing:
- `theme.css` - Skeleton.dev generated theme file with CSS custom properties
- `globals.css` - Global styles and utilities
- `components.css` - Component-specific styles
- `responsive.css` - Responsive design adjustments
- `debug.css` - Debug styles for development (commented out by default)

## How to Use Themes

Themes are imported and configured in `src/app.css`. The current setup imports the hkdev theme:

```css
/* Import theme classes and styles */
@import './lib/themes/hkdev/theme.css' layer(theme);

/* Import additional theme files */
@import '$lib/design/themes/hkdev/globals.css';
@import '$lib/design/themes/hkdev/components.css' layer(components);
@import '$lib/design/themes/hkdev/responsive.css';
```

### Applying Themes

To activate a theme, set the `data-theme` attribute on your HTML element:

```html
<html data-theme="hkdev">
```

Or dynamically with JavaScript:
```javascript
document.documentElement.setAttribute('data-theme', 'hkdev');
```

## Creating New Themes

### Using Skeleton.dev Theme Generator

1. **Visit the Theme Generator**: Go to [themes.skeleton.dev/themes/create](https://themes.skeleton.dev/themes/create)

2. **Customize Your Theme**:
   - Choose color palettes
   - Set font styles for base text, headings, and anchors
   - Configure background options
   - Preview changes in real-time

3. **Generate and Download**:
   - The generator creates a CSS file with CSS custom properties
   - Download the generated `theme.css` file

4. **Integration Steps**:
   - Create a new folder in `src/lib/design/themes/[your-theme-name]/`
   - Place the downloaded `theme.css` file in the new folder
   - Create additional files as needed:
     - `globals.css` - Global styles
     - `components.css` - Component styles
     - `responsive.css` - Responsive adjustments
   - Update `src/app.css` to import your new theme files

### Theme Structure

Each theme folder should follow this structure:
```
themes/
└── [theme-name]/
    ├── theme.css          # Skeleton.dev generated theme
    ├── globals.css        # Global styles and utilities
    ├── components.css     # Component-specific styles
    ├── responsive.css     # Responsive design rules
    └── components/        # Individual component styles
        ├── buttons/
        ├── inputs/
        ├── panels/
        └── ...
```

## Theme System Features

- **CSS Custom Properties**: Themes use CSS variables for easy customization
- **Layer Support**: Organized with CSS layers (theme, base, components, utilities)
- **Light/Dark Mode**: Automatic support for light and dark variants
- **Component Isolation**: Individual component styles in separate files
- **Responsive Design**: Mobile-first responsive adjustments

## Documentation

For more information about Skeleton.dev themes:
- [Skeleton.dev Theme Documentation](https://www.skeleton.dev/docs/design/themes)
- [Theme Generator](https://themes.skeleton.dev/themes/create)
- [Skeleton.dev GitHub](https://github.com/skeletonlabs/skeleton)

## Notes

- The theme generator is not available for small screens - use a tablet or desktop
- Themes can be imported and modified for advanced customization
- All themes should be compatible with Skeleton.dev v3 components