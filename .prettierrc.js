/**
 * @see https://prettier.io/docs/en/options
 *
 * Defaults
 * --------
 * useTabs: false
 * singleQuote: false
 * semi: true
 * trailingComma: 'all'
 * bracketSpacing: true
 * bracketSameLine: false
 * quoteProps: 'as-needed'
 * arrowParens: 'always'
 * singleAttributePerLine: false
 * printWidth: 80
 */
export default {
  useTabs: false,
  singleQuote: true,
  semi: true,
  trailingComma: 'none',
  bracketSpacing: true,
  bracketSameLine: false,
  quoteProps: 'consistent',
  arrowParens: 'always',
  singleAttributePerLine: false,
  printWidth: 80,
  plugins: ['prettier-plugin-svelte', 'prettier-plugin-tailwindcss'],
  overrides: [
    {
      files: '*.svelte',
      options: {
        parser: 'svelte'
      }
    }
  ]
};
