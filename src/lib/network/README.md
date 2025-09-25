# Network

Network utilities for HTTP requests, responses, caching, and specialized media loaders.

## Quick Start

```javascript
import * as http from '$lib/network/http.js';
import * as cache from '$lib/network/cache.js';
import * as loaders from '$lib/network/loaders.js';
```

## HTTP Utilities

### Making Requests

```javascript
import { httpRequest, jsonRequest } from '$lib/network/http.js';

// Basic HTTP request
const response = await httpRequest('https://api.example.com/data');

// JSON request with POST
const result = await jsonRequest('https://api.example.com/users', {
  method: 'POST',
  body: { name: 'John', email: 'john@example.com' }
});
```

### HTTP Methods

Convenient methods for common HTTP operations:

```javascript
import { 
  httpGet, 
  httpPost, 
  httpPut, 
  httpPatch, 
  httpDelete 
} from '$lib/network/http.js';

// GET request
const response = await httpGet({ url: '/api/users' });
const data = await response.text();

// POST request with form data
const formResponse = await httpPost({
  url: '/api/users',
  body: new FormData(form)
});

// PUT request with custom headers
const putResponse = await httpPut({
  url: '/api/users/123',
  body: 'raw data',
  headers: { 'Content-Type': 'text/plain' }
});

// PATCH request
const patchResponse = await httpPatch({
  url: '/api/users/123',
  body: JSON.stringify({ status: 'active' }),
  headers: { 'Content-Type': 'application/json' }
});

// DELETE request
const deleteResponse = await httpDelete({ url: '/api/users/123' });
```

### JSON HTTP Methods

Convenient methods for common JSON API operations:

```javascript
import { 
  jsonGet, 
  jsonPost, 
  jsonPut, 
  jsonPatch, 
  jsonDelete 
} from '$lib/network/http.js';

// GET request for JSON data
const users = await jsonGet({ url: '/api/users' });

// POST request with JSON body
const newUser = await jsonPost({
  url: '/api/users',
  body: JSON.stringify({ name: 'Jane', email: 'jane@example.com' })
});

// PUT request to update resource
const updatedUser = await jsonPut({
  url: '/api/users/123',
  body: JSON.stringify({ name: 'Jane Smith' })
});

// PATCH request for partial updates
const patchedUser = await jsonPatch({
  url: '/api/users/123', 
  body: JSON.stringify({ email: 'newemail@example.com' })
});

// DELETE request
const result = await jsonDelete({ url: '/api/users/123' });
```

### URL Utilities

```javascript
import { toURL, addSearchParams } from '$lib/network/http.js';

const url = toURL('https://example.com', { page: 1, limit: 10 });
// Result: https://example.com?page=1&limit=10
```

### Headers and Response Handling

```javascript
import { 
  setRequestHeaders, 
  waitForAndCheckResponse,
  getErrorFromResponse 
} from '$lib/network/http.js';

// Set custom headers
const headers = setRequestHeaders({ 'Authorization': 'Bearer token' });

// Handle response with error checking
const response = await fetch('/api/data');
const result = await waitForAndCheckResponse(response);
```

## Caching

### Memory Cache (for temporary storage)

```javascript
import { MemoryResponseCache } from '$lib/network/cache.js';

const cache = new MemoryResponseCache();

// Store response with 1-hour expiration
const response = await fetch('https://api.example.com/data');
await cache.set('api-data', response, { expiresIn: 3600000 });

// Retrieve cached response
const cached = await cache.get('api-data');
if (cached) {
  console.log('Cached data:', cached.response);
}
```

### IndexedDB Cache (for persistent storage)

```javascript
import { IndexedDbCache } from '$lib/network/cache.js';

const cache = new IndexedDbCache('my-app-cache');

// Store response persistently
const response = await fetch('https://api.example.com/users');
await cache.set('users-list', response, { 
  expiresIn: 86400000, // 24 hours
  etag: response.headers.get('etag')
});

// Check if cached version is still valid
const cached = await cache.get('users-list');
if (cached && !cache.isExpired(cached)) {
  return cached.response;
}
```

## Media Loaders

Advanced network-based loaders for media assets with loading state management and streaming support. See the [loaders documentation](./loaders/README.md) for detailed usage examples.

```javascript
import { ImageLoader, AudioLoader, ImageScene } from '$lib/network/loaders.js';

// Load a single image with progress tracking
const imageLoader = new ImageLoader({ imageSource: { src: '/image.jpg' } });
imageLoader.load();

// Load multiple images as a scene
const scene = new ImageScene();
scene.defineImage({ label: 'hero', imageSource: heroImage });
scene.load();
```

## Network State Management

For managing loading states across network operations:

```javascript
import { NetworkLoader } from '$lib/network/states/index.js';

// Base class for custom network loaders
class CustomLoader extends NetworkLoader {
  // Implementation
}
```

## Available Exports

### HTTP (`$lib/network/http.js`)
- `httpRequest()` - Make HTTP requests with configuration
- `httpGet()`, `httpPost()`, `httpPut()`, `httpPatch()`, `httpDelete()` - Convenient HTTP methods
- `jsonRequest()` - Make JSON API requests
- `jsonGet()`, `jsonPost()`, `jsonPut()`, `jsonPatch()`, `jsonDelete()` - Convenient JSON HTTP methods
- `toURL()` - Convert strings to URL objects with params
- `setRequestHeaders()` - Set and merge request headers
- `waitForAndCheckResponse()` - Handle responses with error checking
- `getErrorFromResponse()` - Extract errors from failed responses
- HTTP constants and error types

### Cache (`$lib/network/cache.js`)
- `MemoryResponseCache` - In-memory response caching
- `IndexedDbCache` - Persistent browser storage caching
- Cache-related type definitions

### Loaders (`$lib/network/loaders.js`)
- `ImageLoader` - Single image loading with progress tracking
- `ImageVariantsLoader` - Responsive image variants loading
- `ImageScene` - Multi-image loading and management
- `AudioLoader` - Audio data loading and processing
- `AudioScene` - Multi-audio loading and management
- Media utilities and type definitions

### States (`$lib/network/states/`)
- `NetworkLoader` - Base class for network-based loaders
- Loading state management and progress tracking

## Error Handling

All HTTP utilities throw structured errors:

```javascript
import { httpRequest } from '$lib/network/http.js';

try {
  const response = await httpRequest('/api/data');
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Request was cancelled');
  } else if (error.name === 'TimeoutError') {
    console.log('Request timed out');
  } else {
    console.log('HTTP error:', error.message);
  }
}
```