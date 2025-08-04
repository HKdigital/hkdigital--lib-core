# Regular Expression Constants

This directory contains regular expression patterns and components for validating text, user data, and URL formats.

## Overview

All regular expressions use the `v` flag (Unicode Sets mode) for consistent Unicode support and advanced character class operations.

## Unicode Property Escapes

### Character Types

- **Letter (any language)**: `\p{L}`
- **Letter (Latin only)**: `\p{Script=Latin}`
- **Number (any language)**: `\p{N}`
- **Number (decimal digits only)**: `\p{Nd}` - excludes roman numerals

### Available Constants

From `text.js`:
- `LLCHAR` - Latin script characters: `\p{Script=Latin}`
- `NUMBER` - Decimal digits: `\p{Nd}`
- `LLCHAR_NUMBER` - Combination of Latin characters and numbers
- `EMOJI` - RGI Emoji: `\p{RGI_Emoji}`
- `PUNCTUATION` - Punctuation marks: `\p{Punctuation}$+<=>\\^`\\|~`

## Usage Examples

### Basic Usage
```js
import { LCHAR, NUMBER } from '$lib/constants/regexp/text.js';

// Use with 'v' flag for Unicode Sets mode
const re = new RegExp(`^(?:${LCHAR}|${NUMBER})+$`, 'v');
```

### Character Classes vs Groups
```js
// ❌ Don't use Unicode properties in character classes with 'v' flag
const invalid = new RegExp(`^[${LCHAR}]$`, 'v'); // Error

// ✅ Use non-capturing groups instead
const valid = new RegExp(`^(?:${LCHAR})$`, 'v'); // Works
```

## Flag Usage

### The `v` Flag (Unicode Sets Mode)
- Enables advanced Unicode support
- Supports set operations: `[A--B]`, `[A&&B]`, `[A||B]`
- Better emoji and complex Unicode sequence handling
- Stricter syntax requirements than `u` flag

### RGI Emoji Support
The `v` flag enables support for "Recommended for General Interchange" emoji, allowing matching of emoji regardless of their internal code point complexity.

```js
const emojiPattern = new RegExp(`^(?:${EMOJI})$`, 'v');
emojiPattern.test('😄'); // true
emojiPattern.test('👨🏾‍⚕️'); // true (complex multi-codepoint emoji)
```

## File Structure

- `text.js` - Basic Unicode character type constants
- `user.js` - User data validation patterns (names, usernames, etc.)
- `url.js` - URL and slug validation patterns
- `index.js` - Exports all regexp constants
- `*.test.js` - Test files for each module

## Validation Patterns

### User Data (user.js)
- `RE_NAME` - Personal names with Latin characters
- `RE_FULLNAME` - Full names with space separators
- `RE_SURNAME` - Surnames with optional prefixes
- `RE_USERNAME` - Usernames with alphanumeric and limited special characters
- `RE_PHONENUMBER` - Phone number formats

### URL Data (url.js)
- `URL_SLUG` - URL-safe slugs for paths (e.g., "my-blog-post")

## Browser Support

The `v` flag requires modern browser support:
- Chrome 112+ (March 2023)
- Firefox 116+ (August 2023)
- Safari 17+ (September 2023)
- Node.js 20+ (April 2023)

## References

- [Unicode Character Properties](https://en.wikipedia.org/wiki/Unicode_character_property#General_Category)
- [RegExp v flag specification](https://v8.dev/features/regexp-v-flag)
- [MDN Unicode character class escape](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Unicode_character_class_escape)