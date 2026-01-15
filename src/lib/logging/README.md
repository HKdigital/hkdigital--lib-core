# Logging

Universal logging utilities for SvelteKit applications with
server/client/universal logger factories.

## Installation

```bash
pnpm add -D pino-pretty
```

## Module Structure

For optimal tree-shaking, the logging module is split into three entry
points:

- `logging/server.js` - Server-only code (pino logging)
- `logging/client.js` - Client-only code (console logging)
- `logging/common.js` - Shared utilities (log levels, Logger class)

This ensures that server-side pino dependencies don't end up in client
bundles and vice versa.

## Usage

### Server-side logging

```javascript
import { createServerLogger, DEBUG }
  from '@hkdigital/lib-core/logging/server.js';

// Server-side logging (uses pino)
const logger = createServerLogger('app', DEBUG);

logger.debug('Debug info', { data: 'details' });
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', {
  error: new Error('Something went wrong')
});
```

### Client-side logging

```javascript
import { createClientLogger, DEBUG }
  from '@hkdigital/lib-core/logging/client.js';

// Client-side logging (uses console)
const logger = createClientLogger('app', DEBUG);

logger.debug('Debug info', { data: 'details' });
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', {
  error: new Error('Something went wrong')
});
```

### Shared utilities

```javascript
import { Logger, DEBUG, INFO, WARN, ERROR }
  from '@hkdigital/lib-core/logging/common.js';

// Access log levels
console.log(DEBUG); // 'debug'
console.log(INFO);  // 'info'
console.log(WARN);  // 'warn'
console.log(ERROR); // 'error'

// Access Logger class for advanced usage
```

## SvelteKit Integration

### Server-side logging (src/hooks.server.js)

```javascript
import { createServerLogger, DEBUG }
  from '@hkdigital/lib-core/logging/server.js';

let logger;

// Initialize server logging and services
export async function init() {
  logger = createServerLogger('server', DEBUG);
  
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
import { initClientServices } from '$lib/services/client.js';
import { getClientLogger } from '$lib/logging/client.js';

export async function init() {
  // Init services
  try {
    await initClientServices();

    getClientLogger().info('Client initialization complete');
  } catch (error) {
    getClientLogger().error('Client initialization failed', 
      /** @type {Error} */ (error));
    // throw error;
  }
  finally {
    getClientLogger().info('Client application initialized', {
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    });
  }
}

/** @type {import('@sveltejs/kit').HandleClientError} */
export function handleError({ error, event }) {
  // Handle SvelteKit-specific errors:
  // navigation errors, load function failures, component errors, ...
  getClientLogger().error(/** @type {Error} */ (error), {
    url: event.url?.pathname,
    userAgent: navigator.userAgent
  });
}
```

### Client Service Integration

When integrating with a service management system, you can set up global 
error handling and forward service logs to the main logger:

```javascript
import { ServiceManager } from '@hkdigital/lib-core/services/index.js';
import { initClientLogger } from '$lib/logging/client.js';

/** @type {ServiceManager} */
let manager;

export async function initClientServices() {
  if (!manager) {
    const logger = initClientLogger();

    // Catch errors and unhandled promise rejections
    
    // Log unhandled errors
    window.addEventListener('error', (event) => {
      logger.error(event, { url: window.location.pathname });
      event.preventDefault();
    });

    // Log unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      logger.error(event, { url: window.location.pathname });
      // Ignored by Firefox
      event.preventDefault();
    });

    manager = new ServiceManager({ debug: true });

    // Listen to all log events and forward them to the logger
    manager.onLogEvent((logEvent) => {
      logger.logFromEvent(logEvent);
    });

    // Register services
    manager.register(SERVICE_AUDIO, AudioService);
    manager.register(SERVICE_EVENT_LOG, EventLogService);
    manager.register(SERVICE_PLAYER_DATA, PlayerDataService);
  }

  await manager.startAll();
  return manager;
}

export function getManager() {
  if (!manager) {
    throw new Error('Client services should be initialised first');
  }
  return manager;
}
```

## Development

Requires `pino-pretty` as peer dependency for development mode formatting.
