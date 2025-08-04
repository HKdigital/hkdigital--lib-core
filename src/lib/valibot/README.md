# Valibot Parsers

Collection of Valibot validation parsers for common data types and formats.

## Overview

This module provides pre-configured Valibot parsers for validating and transforming common data types like URLs and user information.

## Parsers

### URL Parsers

- `UrlOrEmptyString` - Validates URL or allows empty string
- `HumanUrl` - Validates URL with automatic `https://` prefix for protocol-less URLs
- `UrlPath` - Extracts and validates URL pathname
- `RelativeUrl` - Validates relative URLs with path, search, and hash
- `AbsOrRelUrl` - Validates absolute or relative URLs

### User Parsers

- `Name` - Validates user names
- `Fullname` - Validates full names
- `Username` - Validates usernames
- `Surname` - Validates surnames
- `PhoneNumber` - Validates phone numbers

## Usage

```js
import { v, HumanUrl, Name } from '$lib/valibot/index.js';

// Validates and transforms URL (throws error if invalid)
const result = v.parse(HumanUrl, 'example.com'); // Returns 'https://example.com'

// Validates name (throws error if invalid)
const nameResult = v.parse(Name, 'John');

// Use safeParse to avoid exceptions
const safeResult = v.safeParse(HumanUrl, 'invalid-url');
if (safeResult.success) {
  console.log(safeResult.output);
} else {
  console.log(safeResult.issues); // Array of issue objects
}
```

## References

- [SafeParseResult API](https://valibot.dev/api/SafeParseResult/)
- [BaseIssue API](https://valibot.dev/api/BaseIssue/)
