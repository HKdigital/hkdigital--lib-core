# Logging

Universal logging utilities for SvelteKit applications with server/client/universal logger factories.

## Installation

```bash
pnpm add -D pino-pretty
```

## Usage

```javascript
import { createServerLogger,
         createClientLogger } from '@hkdigital/lib-core/logging/index.js';

// Server-side logging (uses pino)
const serverLogger = createServerLogger('app');

// Client-side logging (uses console)
const clientLogger = createClientLogger('app'); 

// Log at different levels
serverLogger.debug('Debug info', { data: 'details' });
serverLogger.info('Info message');
serverLogger.warn('Warning message');
serverLogger.error('Error message', { error: new Error('Something went wrong') });
```

## SvelteKit Integration

### Server-side logging (src/hooks.server.js)

```javascript
import { createServerLogger } from '@hkdigital/lib-core/logging/index.js';

let logger;

// Initialize server logging and services
export async function init() {
  logger = createServerLogger('server');
  
  try {
    logger.info('Initializing server');
    
    // Initialize your services here
    // const serviceManager = new ServiceManager();
    // await serviceManager.startAll();
    
    logger.info('Server initialization complete');
  } catch (error) {
    logger.error('Server initialization failed:', error);
    throw error;
  }
}

// Graceful shutdown
export async function destroy() {
  if (logger) {
    logger.info('Shutting down server');
    
    // Clean up services here
    // if (serviceManager) {
    //   await serviceManager.stopAll();
    // }
  }
}

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  const start = Date.now();
  
  logger?.info('Request started', {
    method: event.request.method,
    url: event.url.pathname,
    userAgent: event.request.headers.get('user-agent')
  });

  try {
    const response = await resolve(event);
    const duration = Date.now() - start;
    
    logger?.info('Request completed', {
      method: event.request.method,
      url: event.url.pathname,
      status: response.status,
      duration: `${duration}ms`
    });
    
    return response;
  } catch (error) {
    logger?.error('Request failed', {
      method: event.request.method,
      url: event.url.pathname,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}
```

### Client-side logging (src/hooks.client.js)

```javascript
import { createClientLogger } from '@hkdigital/lib-core/logging/index.js';

const logger = createClientLogger('client');

/** @type {import('@sveltejs/kit').HandleClientError} */
export function handleError({ error, event }) {
  logger.error(error, { 
    url: event.url?.pathname, 
    userAgent: navigator.userAgent 
  });
}

// Initialize client-side logging
export function init() {
  logger.info('Client application initialized', {
    userAgent: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`
  });
  
  // Log unhandled errors
  window.addEventListener('error', (event) => {
    logger.error(event, { url: window.location.pathname });
  });
  
  // Log unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error(event, { url: window.location.pathname });
  });
}

// Cleanup when app is destroyed
export function destroy() {
  logger.info('Client application destroyed');
  // Note: Console adapter doesn't require cleanup
}
```

## Development

Requires `pino-pretty` as peer dependency for development mode formatting.
