# SvelteKit Environment Utilities

A collection of utilities for working with SvelteKit environment variables with automatic grouping, type parsing, and intelligent organization.

## Overview

These utilities automatically organize your environment variables into logical groups based on their prefixes, parse values to appropriate types, and provide a clean API for accessing configuration in both client and server contexts.

## Key Features

- 🎯 **Simple & Predictable**: Variables with underscores get grouped by prefix
- 🔄 **Automatic Type Parsing**: Converts strings to numbers, booleans, null, etc.
- 🏗️ **Smart Grouping**: `DATABASE_HOST` + `DATABASE_PORT` → `{ database: { host, port } }`
- 📦 **SvelteKit Integration**: Works with public/private environment variables
- 🔒 **Type Safe**: Full TypeScript support with proper environment separation

## Basic Examples

### Simple Prefix Grouping

```javascript
import { autoGroupEnvByPrefix } from '$lib/util/sveltekit/env/parsers.js';

// Environment variables:
// DATABASE_HOST=localhost
// DATABASE_PORT=5432
// REDIS_URL=redis://cache
// DEBUG_MODE=true
// API_KEY=secret123

const env = {
  'DATABASE_HOST': 'localhost',
  'DATABASE_PORT': '5432',
  'REDIS_URL': 'redis://cache',
  'DEBUG_MODE': 'true',
  'API_KEY': 'secret123'
};

const config = autoGroupEnvByPrefix(env);
console.log(config);
// Output:
// {
//   database: {
//     host: 'localhost',
//     port: 5432           // ← Parsed as number
//   },
//   redis: {
//     url: 'redis://cache'
//   },
//   debug: {
//     mode: true           // ← Parsed as boolean
//   },
//   api: {
//     key: 'secret123'
//   }
// }
```

### Variables Without Underscores

```javascript
const env = {
  'DATABASE_HOST': 'localhost',  // → database.host (grouped)
  'API_KEY': 'secret',          // → api.key (grouped)
  'HOST': 'localhost',          // → host (top-level, no underscore)
  'PORT': '3000'                // → port (top-level, no underscore)
};

const config = autoGroupEnvByPrefix(env);
// Output:
// {
//   database: { host: 'localhost' },
//   api: { key: 'secret' },
//   host: 'localhost',          // ← Stays top-level
//   port: 3000                  // ← Stays top-level
// }
```

## SvelteKit Integration

### Public Environment Variables

```javascript
// .env file:
// PUBLIC_API_URL=https://api.example.com
// PUBLIC_API_TIMEOUT=5000
// PUBLIC_FEATURE_FLAGS=true

import { getPublicEnv } from '$lib/util/sveltekit/env/public.js';

// ✅ Safe to use on client and server
const config = getPublicEnv();
console.log(config);
// Output:
// {
//   public: {
//     apiUrl: 'https://api.example.com',
//     apiTimeout: 5000,
//     featureFlags: true
//   }
// }
```

### Private Environment Variables

```javascript
// .env file:
// DATABASE_HOST=localhost
// DATABASE_PORT=5432
// JWT_SECRET=super-secret-key
// REDIS_URL=redis://localhost:6379

import { getPrivateEnv } from '$lib/util/sveltekit/env/private.js';

// ⚠️ Server-side only!
const config = getPrivateEnv();
console.log(config);
// Output:
// {
//   database: {
//     host: 'localhost',
//     port: 5432
//   },
//   jwt: {
//     secret: 'super-secret-key'
//   },
//   redis: {
//     url: 'redis://localhost:6379'
//   }
// }
```

### Combined Environment (Public + Private)

```javascript
// .env file:
// PUBLIC_API_URL=https://api.example.com
// DATABASE_HOST=localhost
// DATABASE_PORT=5432

import { getAllEnv } from '$lib/util/sveltekit/env/all.js';

// ⚠️ Server-side only! (contains private vars)
const config = getAllEnv();
console.log(config);
// Output:
// {
//   database: {
//     host: 'localhost',
//     port: 5432
//   },
//   public: {
//     apiUrl: 'https://api.example.com'
//   }
// }

// Private variables override public ones with same name
```

## Prefix-Specific Access

### Get Variables by Specific Prefix

```javascript
import { getPrivateEnvByPrefix } from '$lib/util/sveltekit/env/private.js';

// Only get DATABASE_* variables
const dbConfig = getPrivateEnvByPrefix('DATABASE');
console.log(dbConfig);
// Output:
// {
//   host: 'localhost',     // DATABASE_HOST (prefix removed)
//   port: 5432,           // DATABASE_PORT (prefix removed)
//   name: 'myapp'         // DATABASE_NAME (prefix removed)
// }

// Works with or without trailing underscore
const dbConfig2 = getPrivateEnvByPrefix('DATABASE_'); // Same result
```

## Type Parsing

### Automatic Value Conversion

```javascript
const env = {
  'SERVER_PORT': '3000',           // → 3000 (number)
  'ENABLE_LOGGING': 'true',        // → true (boolean)
  'DISABLE_CACHE': 'false',        // → false (boolean)
  'NULL_VALUE': 'null',            // → null
  'UNDEFINED_VALUE': 'undefined',  // → undefined
  'API_URL': 'https://api.com',    // → 'https://api.com' (string)
  'MIXED_VALUE': '123abc'          // → '123abc' (string, can't parse as number)
};

const config = autoGroupEnvByPrefix(env);
// All values are parsed to appropriate types automatically
```

### Disable Type Parsing

```javascript
const config = autoGroupEnvByPrefix(env, { 
  parseValues: false 
});
// All values remain as strings
```

## Naming Conventions

### CamelCase Conversion (Default)

```javascript
const env = {
  'DATABASE_HOST': 'localhost',
  'API_BASE_URL': 'https://api.com',
  'JWT_EXPIRES_IN': '24h'
};

const config = autoGroupEnvByPrefix(env, { camelCase: true }); // default
// Output:
// {
//   database: { host: 'localhost' },
//   api: { baseUrl: 'https://api.com' },
//   jwt: { expiresIn: '24h' }
// }
```

### Keep Original Case

```javascript
const config = autoGroupEnvByPrefix(env, { camelCase: false });
// Output:
// {
//   database: { host: 'localhost' },
//   api: { base_url: 'https://api.com' },
//   jwt: { expires_in: '24h' }
// }
```

## Real-World Usage Examples

### Database Configuration

```javascript
// .env
// DATABASE_HOST=localhost
// DATABASE_PORT=5432
// DATABASE_NAME=myapp
// DATABASE_USER=admin
// DATABASE_PASSWORD=secret
// DATABASE_SSL=true

import { getPrivateEnvByPrefix } from '$lib/util/sveltekit/env/private.js';

const dbConfig = getPrivateEnvByPrefix('DATABASE');
console.log(dbConfig);
// Output:
// {
//   host: 'localhost',
//   port: 5432,
//   name: 'myapp',
//   user: 'admin',
//   password: 'secret',
//   ssl: true
// }

// Use directly with database client
import pg from 'pg';
const client = new pg.Client(dbConfig);
```

### API Configuration

```javascript
// .env
// PUBLIC_API_URL=https://api.example.com
// PUBLIC_API_TIMEOUT=5000
// PUBLIC_API_RETRIES=3
// API_SECRET=private-key

import { getAllEnv } from '$lib/util/sveltekit/env/all.js';

const config = getAllEnv();
const apiConfig = {
  ...config.public,  // Public API settings
  secret: config.api.secret  // Private API key
};

console.log(apiConfig);
// Output:
// {
//   url: 'https://api.example.com',
//   timeout: 5000,
//   retries: 3,
//   secret: 'private-key'
// }
```

### Feature Flags

```javascript
// .env
// PUBLIC_FEATURE_NEW_UI=true
// PUBLIC_FEATURE_BETA_DASHBOARD=false
// PUBLIC_FEATURE_ANALYTICS=true

import { getPublicEnvByPrefix } from '$lib/util/sveltekit/env/public.js';

const features = getPublicEnvByPrefix('PUBLIC_FEATURE');
console.log(features);
// Output:
// {
//   newUi: true,
//   betaDashboard: false,
//   analytics: true
// }

// Use in components
{#if features.newUi}
  <NewUIComponent />
{:else}
  <LegacyUIComponent />
{/if}
```

## API Reference

### Core Functions

- `autoGroupEnvByPrefix(env, options)` - Groups environment variables by prefix
- `parseEnv(env, options)` - Parses environment variables with options
- `parseEnvByPrefix(env, prefix, options)` - Parses variables with specific prefix

### SvelteKit Functions

- `getPublicEnv(options)` - Get public environment variables (client + server safe)
- `getPrivateEnv(options)` - Get private environment variables (server only)
- `getAllEnv(options)` - Get combined environment variables (server only)
- `getPublicEnvByPrefix(prefix, options)` - Get public variables by prefix
- `getPrivateEnvByPrefix(prefix, options)` - Get private variables by prefix
- `getAllEnvByPrefix(prefix, options)` - Get combined variables by prefix

### Raw Access

- `getRawPublicEnv()` - Get raw public environment object
- `getRawPrivateEnv()` - Get raw private environment object  
- `getRawAllEnv()` - Get raw combined environment object

### Options

All functions accept these options:

```javascript
{
  camelCase: true,      // Convert SNAKE_CASE to camelCase
  parseValues: true,    // Parse strings to numbers/booleans/null
  autoGroup: true       // Enable automatic prefix grouping (SvelteKit functions only)
}
```

## Security Notes

- **Public variables** (`PUBLIC_*`) are safe to use on client and server
- **Private variables** are server-side only and will cause build errors if imported on client
- **Combined functions** (`getAllEnv*`) are server-side only
- Private variables take precedence over public ones when names conflict

## Migration from Other Solutions

### From Manual Environment Access

```javascript
// Before ❌
const dbHost = process.env.DATABASE_HOST;
const dbPort = parseInt(process.env.DATABASE_PORT);
const dbSsl = process.env.DATABASE_SSL === 'true';

// After ✅
const { database } = getPrivateEnv();
const { host, port, ssl } = database;
```

### From dotenv Libraries

```javascript
// Before ❌
import dotenv from 'dotenv';
dotenv.config();

const config = {
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT)
  }
};

// After ✅
import { getPrivateEnv } from '$lib/util/sveltekit/env/private.js';
const { database } = getPrivateEnv();
```

## Best Practices

1. **Use descriptive prefixes**: `DATABASE_`, `REDIS_`, `JWT_`, `API_`
2. **Group related settings**: Put all database settings under `DATABASE_*`
3. **Use appropriate access level**: Public for client-safe config, private for secrets
4. **Leverage type parsing**: Use `'true'/'false'` for booleans, numbers as strings
5. **Consistent naming**: Stick to `UPPER_SNAKE_CASE` for environment variables
6. **Document your variables**: Comment your `.env` files with examples

## TypeScript Support

All functions include full TypeScript definitions. For better type safety, consider defining interfaces for your configuration:

```typescript
interface DatabaseConfig {
  host: string;
  port: number;
  ssl: boolean;
}

const { database }: { database: DatabaseConfig } = getPrivateEnv();
```