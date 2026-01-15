# Import Path Validation

This directory contains validation scripts for enforcing consistent
import path conventions across the project.

## Overview

The `validate-imports.mjs` script checks all JavaScript and Svelte
files to ensure imports follow project conventions. These rules align
with how Node.js and Vite resolve modules, ensuring code works both
during development and when published as a package.

## Running the Linter

```bash
# Run validation
node scripts/validate-imports.mjs

# Add to package.json scripts
{
  "scripts": {
    "lint:imports": "node scripts/validate-imports.mjs"
  }
}
```

## Import Rules Summary

1. **No cross-domain relative imports** - Use `$lib/` for 3+ levels up
2. **Write index.js explicitly** - Don't rely on implicit directory
   resolution (except in test files)
3. **Standard extensions optional** - `.js` and `.svelte` can be
   omitted
4. **Non-standard extensions required** - `.svelte.js`, `.test.js`,
   etc. must be explicit
5. **Import paths must exist** - All imports must resolve to actual
   files
6. **No node_modules aliases in library code** - Library code
   (`src/lib/`) must not use aliases pointing to `node_modules` (apps
   only)

## Import Rules

### Rule 1: No cross-domain relative imports

**Don't navigate up 3+ levels with relative paths**

When importing from a different domain (different main folder under
`src/lib/`), use `$lib/` imports instead of long relative paths.

❌ Bad:
```javascript
// In src/lib/ui/components/MyComponent.svelte
import { http } from '../../../network/http.js';
```

✅ Good:
```javascript
// In src/lib/ui/components/MyComponent.svelte
import { http } from '$lib/network/http.js';
```

**Why:** Makes imports clearer, easier to refactor, and independent of
file location.

### Rule 2: Write index.js explicitly (except same-directory)

**If importing from a directory, write the index.js explicitly**

When a directory contains an `index.js` file, don't rely on implicit
resolution - write it explicitly.

❌ Bad:
```javascript
// When src/lib/ui/primitives/ has index.js
import { Button } from '$lib/ui/primitives';
import { Card } from '../components/cards';
```

✅ Good:
```javascript
import { Button } from '$lib/ui/primitives/index.js';
import { Card } from '../components/cards/index.js';
```

✅ Exception - same-directory imports allowed:
```javascript
// In drag-drop/DropZoneArea.svelte
import { DropZone } from './index.js';  // OK - sibling file
```

✅ Exception - test files can import from index.js:
```javascript
// In *.test.js or *.spec.js files
import { helper } from './index.js';  // OK in tests
```

**Why:**
- Makes it explicit that you're importing from a re-export file
- Same-directory imports are allowed for module cohesion (files
  within the same module can use their local index.js)
- Parent navigation (`../index.js`) should use cross-domain imports
  or specific files instead

### Rule 3: Standard extensions are optional

**Standard extensions (.js, .svelte) can be omitted**

Both `$lib/` and relative imports can omit `.js` and `.svelte`
extensions. Vite and Node.js will resolve them correctly.

✅ All valid:
```javascript
// File exists at src/lib/util/array.js
import { arraySlice } from '$lib/util/array';
import { arraySlice } from '$lib/util/array.js';

// File exists at ./components/Button.svelte
import Button from './components/Button';
import Button from './components/Button.svelte';
```

**Why:** Vite and Node.js automatically resolve extensions, so
requiring them is unnecessary for internal code.

### Rule 4: Non-standard extensions must be explicit

**Files with non-standard extensions require the full extension**

Non-standard extensions like `.svelte.js`, `.test.js`, or `.spec.js`
are not automatically resolved by module loaders, so they must be
written explicitly in imports.

❌ Bad:
```javascript
// File is MyComponent.state.svelte.js
import { state } from './MyComponent.state.svelte';
import { state } from './MyComponent.state';
```

✅ Good:
```javascript
// File is MyComponent.state.svelte.js
import { state } from './MyComponent.state.svelte.js';
```

**Why:** Module resolution only tries standard extensions (.js,
.svelte). Non-standard compound extensions won't be found
automatically and will cause import errors.

### Rule 5: Import paths must exist

**All import paths must resolve to actual files**

The linter verifies that every internal import (`$lib/`, `./`, `../`)
points to a file that exists on the filesystem. This catches typos,
moved/deleted files, and incorrect paths early.

❌ Bad:
```javascript
// File doesn't exist
import { helper } from './utlis.js';  // Typo: should be "utils"
import Button from '$lib/ui/Buttton.svelte';  // Typo in filename
import { old } from './deleted-file.js';  // File was removed
```

✅ Good:
```javascript
// All files exist
import { helper } from './utils.js';
import Button from '$lib/ui/Button.svelte';
import { current } from './existing-file.js';
```

**Special handling:**
- **Query parameters**: Vite asset imports with query strings (e.g.,
  `'./image.jpg?preset=render'`) are supported - the query string is
  stripped before checking file existence
- **Resolution order**: Follows Node.js/Vite resolution (tries `.js`,
  `.svelte`, `.svelte.js`, `/index.js` for extensionless imports)

**Why:** Catches broken imports immediately instead of discovering
them at build time or runtime. Helps prevent errors when refactoring
or moving files.

### Rule 6: No node_modules aliases in library code

**Library code must not use aliases pointing to node_modules**

When building a library with `@sveltejs/package`, aliases that point
to `node_modules` get resolved to relative paths that become invalid
in the published package. This breaks consuming projects.

❌ Bad (in `src/lib/` with alias pointing to node_modules):
```javascript
// svelte.config.js
alias: {
  '$ext-lib': 'node_modules/@some/library/dist'
}

// In src/lib/ui/MyComponent.svelte
import { Button } from '$ext-lib/ui/primitives.js';

// After build in dist/**, this becomes:
import { Button } from '../../../../../node_modules/@some/library/dist/ui/primitives.js';
// ^ Broken when installed in another project!
```

✅ Good (use direct package imports):
```javascript
// In src/lib/ui/MyComponent.svelte
import { Button } from '@some/library/ui/primitives.js';
```

✅ Also good (aliases work fine in app code):
```javascript
// In src/routes/+page.svelte (not built/published)
import { Button } from '$ext-lib/ui/primitives.js';
```

**Scope:**
- **Enforced in**: `src/lib/**` (library code that gets built)
- **Allowed in**: `src/routes/**` (app code, not published)
- **Local aliases OK**: Aliases pointing to local directories (like
  `$lib` → `src/lib`) work everywhere

**Why:** Build tools resolve aliases during compilation. For
node_modules aliases, they generate relative paths that only work from
the original project structure, not when the package is installed
elsewhere.

## How Module Resolution Works

Understanding how Node.js and Vite resolve imports helps explain
these rules:

### Resolution order for `import { x } from './foo'`

1. Try `./foo` (exact match)
2. Try `./foo.js`
3. Try `./foo.svelte`
4. Try `./foo/index.js`
5. Try `./foo/index.svelte`

### Examples

```javascript
// Import: from './components/things'
// Resolution:
//   1. ./components/things (not found)
//   2. ./components/things.js (✓ found!) → uses this file
//   3. Never checks ./components/things/index.js

// Import: from './components/cards'
// Resolution:
//   1. ./components/cards (not found)
//   2. ./components/cards.js (not found)
//   3. ./components/cards.svelte (not found)
//   4. ./components/cards/index.js (✓ found!) → uses this file
//      → Should write './components/cards/index.js' explicitly
```

## Directory imports vs file imports

The linter follows Node.js/Vite resolution order and only flags
directory imports when they actually resolve to a directory's
index.js:

✅ No warning - imports a file:
```javascript
// src/lib/util/array.js exists (file)
import { arraySlice } from '$lib/util/array';
```

⚠️ Warning - imports a directory's index.js:
```javascript
// src/lib/ui/primitives/ directory with index.js
import { Button } from '$lib/ui/primitives';
// Should be: from '$lib/ui/primitives/index.js'
```

### Edge case: file and directory with same name

When both a file and directory exist with the same base name, the
file is always resolved first:

```javascript
// src/lib/util/env.js (file) exists
// src/lib/util/env/index.js (directory) also exists
import { isTestEnv } from '$lib/util/env';
// ✅ Resolves to env.js, no warning
```

The linter correctly follows this resolution order.

## Test file exceptions

Test files (*.test.js, *.spec.js) are exempt from Rule 2 because
they test the public API. It's natural for tests to import from
`./index.js` alongside the code being tested.

```javascript
// In Button.test.js
import { Button } from './index.js';  // ✅ OK in test files
```

## External package imports

The linter only checks internal imports (`$lib/`, `./`, `../`).
External package imports are not validated:

```javascript
import { derived } from 'svelte/store';  // Not checked
import { v } from 'valibot';             // Not checked
```

## Implementation details

The validator:
1. Scans all `.js` and `.svelte` files in `src/`
2. Parses import statements using regex
3. Resolves paths to filesystem locations
4. Checks if directories contain `index.js` files
5. Reports violations with file:line references

Exit codes:
- `0` - All imports valid
- `1` - Violations found or script error
