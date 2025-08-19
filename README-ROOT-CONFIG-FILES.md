  Root Configuration Files

  1. package.json - Update dependencies and scripts
  2. vite.config.js - Replace with lib-core generateViteConfig()
  3. tailwind.config.js - Complete rewrite using lib-core design system
  4. postcss.config.js - Ensure lib-core compatibility
  5. svelte.config.js - Add sveltePreprocess({}) if missing

  Source Files

  6. src/app.css - Update imports to lib-core, keep "stl" theme
  7. src/app.html - Keep as-is (already has data-theme="stl")
  8. src/app.d.ts - Update imagetools import to lib-core
  9. src/routes/+layout.svelte - Replace lib-sveltekit imports with lib-core

  Development/Dot Files

  10. eslint.config.js - Update for lib-core ESLint setup
  11. jsconfig.json - Update path aliases and compiler options
  12. .prettierrc - Verify lib-core compatibility
  13. .prettierignore - Verify lib-core compatibility
  14. .gitignore - Verify completeness

  Optional Files to Create (if missing)

  15. .env.example - Template for environment variables
  16. vitest-setup-client.js - Verify lib-core compatibility
