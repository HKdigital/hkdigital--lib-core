# Services and Logging Setup

This document describes the centralized services and logging architecture used in this SvelteKit project with `@hkdigital/lib-core`.

## Architecture Overview

The project uses a centralized service management pattern with integrated logging:

- **Service Managers**: Centralized service registration and lifecycle management
- **Logging**: Separated into dedicated modules with proper initialization order
- **Hooks Integration**: SvelteKit hooks handle initialization and cleanup

## Project Structure

```
src/
├── hooks.client.js         # Client-side SvelteKit hooks
├── hooks.server.js         # Server-side SvelteKit hooks
├── lib/
│   ├── logging/
│   │   ├── client.js       # Client logger setup
│   │   └── server.js       # Server logger setup
│   └── services/
│       ├── client.js       # Re-exports from client/ folder
│       ├── server.js       # Re-exports from server/ folder
│       ├── client/
│       │   ├── manager.js     # Client service manager
│       │   ├── services.js    # Service accessor functions
│       │   ├── service-names.js # Service name constants
│       │   └── ...services
│       └── server/
│           ├── manager.js     # Server service manager
│           ├── services.js    # Service accessor functions
│           ├── service-names.js # Service name constants
│           └── ...services
```

## Logging Setup

### Server Logging (`src/lib/logging/server.js`)

```javascript
import { createServerLogger } from '@hkdigital/lib-core/logging/index.js';

/** @typedef {import('$hklib-core/logging/index.js').Logger} Logger */

/** @type {Logger} */
let logger;

/**
 * Initialize the server logger
 *
 * @returns {Logger} The initialized logger instance
 */
export function initServerLogger() {
  if (!logger) {
    logger = createServerLogger('server-logger');
  }
  return logger;
}

/**
 * Get the server logger instance
 *
 * @returns {Logger} The server logger
 */
export function getServerLogger() {
  if (!logger) {
    throw new Error('Server logger should be initialised first');
  }

  return logger;
}
```

### Client Logging (`src/lib/logging/client.js`)

```javascript
import { createClientLogger } from '@hkdigital/lib-core/logging/index.js';

/** @typedef {import('$hklib-core/logging/index.js').Logger} Logger */

/** @type {Logger} */
let logger;

/**
 * Initialize the client logger
 *
 * @returns {Logger} The initialized logger instance
 */
export function initClientLogger() {
  if (!logger) {
    logger = createClientLogger('client-logger');
  }
  return logger;
}

/**
 * Get the client logger instance
 *
 * @returns {Logger} The client logger
 */
export function getClientLogger() {
  if (!logger) {
    throw new Error('Client logger should be initialised first');
  }

  return logger;
}
```

## Service Manager Setup

### Service Entry Points

The services folder uses centralized entry files to re-export all functionality:

#### Server Services (`src/lib/services/server.js`)
```javascript
export * from './server/manager.js';
export * from './server/services.js';
export * from './server/service-names.js';
```

#### Client Services (`src/lib/services/client.js`)
```javascript
export * from './client/manager.js';
export * from './client/services.js';
export * from './client/service-names.js';
```

This pattern allows importing everything from a single location:
```javascript
import { initServerServices, getSessionService, SERVICE_SESSION } from '$lib/services/server.js';
```

### Server Service Manager (`src/lib/services/server/manager.js`)

```javascript
import { ServiceManager } from '$hklib-core/services';
import { SERVICE_LOG } from '@hkdigital/lib-core/services/index.js';

import { initServerLogger } from '$lib/logging/server.js';

import { SERVICE_SESSION } from './service-names.js';
import SessionService from './SessionService.js';

let manager;

export async function initServerServices() {
  if (!manager) {
    const logger = initServerLogger();

    manager = new ServiceManager({
      debug: false,           // Set to true for DEBUG level on all services
      stopTimeout: 10000,     // Global shutdown timeout
      managerLogLevel: 'INFO', // ServiceManager's own log level
      serviceLogLevels: {     // Optional: per-service log levels
        // 'session': 'DEBUG'   // Uncomment to debug specific services
      }
    });

    // Listen to all log events (both manager and services)
    manager.onLogEvent((logEvent) => {
      logger.logFromEvent(logEvent);
    });

    // Register services
    manager.register(SERVICE_SESSION, SessionService);
  }

  await manager.startAll();

  return manager;
}

export function getManager() {
  if (!manager) {
    throw new Error('Server services should be initialised first');
  }

  return manager;
}
```

### Service services (`src/lib/services/server/services.js`)

```js

export function getSessionService() {
  return getManager().get(SERVICE_SESSION);
}
```

### Client Service Manager (`src/lib/services/client/manager.js`)

```javascript
import { ServiceManager } from '$hklib-core/services/index.js';

import { initClientLogger } from '$lib/logging/client.js';

import { SERVICE_AUDIO, SERVICE_EVENT_LOG, SERVICE_PLAYER_DATA } from './service-names.js';

import AudioService from './AudioService.svelte.js';
import EventLogService from './EventLogService.js';
import PlayerDataService from './PlayerDataService.svelte.js';

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

    console.log("done addEventListener");

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

### Client services (`src/lib/services/client/services.js`)

```js


// Service accessor functions
export function getAudioService() {
  return getManager().get(SERVICE_AUDIO);
}

export function getEventLogService() {
  return getManager().get(SERVICE_EVENT_LOG);
}

export function getPlayerDataService() {
  return getManager().get(SERVICE_PLAYER_DATA);
}
```

## SvelteKit Hooks Integration

### Server Hooks (`src/hooks.server.js`)

```javascript
import { initServerServices, getSessionService } from '$lib/services/server.js';
import { getServerLogger } from '$lib/logging/server.js';

// Initialize server logging and services
export async function init() {
  try {
    await initServerServices();

    const logger = getServerLogger();
    logger.info('Server initialization complete');
  } catch (error) {
    const logger = getServerLogger();
    logger.error('Server initialization failed:', error);
    throw error;
  }
}

// Handle server errors
export const handleError = ({ error, status, message }) => {
  if (status !== 404) {
    const logger = getServerLogger();
    logger.error(error);
  }

  return { message };
};

// Handle all requests
export async function handle({ event, resolve }) {
  const { cookies, locals } = event;
  const sessionService = getSessionService();

  const sessionId = sessionService.getOrCreateSessionId(cookies);
  await sessionService.setLocals(cookies, locals);

  const logger = getServerLogger();
  logger.debug({ sessionId, sessionData: locals.sessionData }, 'Request sessionData');

  const response = await resolve(event);
  return response;
}

// Graceful shutdown
export async function destroy() {
  try {
    const logger = getServerLogger();
    logger.info('Shutting down server');
  } catch (error) {
    // Logger might not be initialized
  }
}
```

### Client Hooks (`src/hooks.client.js`)

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

## Key Benefits

### Separation of Concerns
- **Logging logic** is isolated in dedicated modules
- **Service management** handles registration and lifecycle
- **Hooks** focus on SvelteKit integration

### Centralized Configuration
- Single place to configure each logger
- Consistent logging patterns across the application
- Easy to modify logging behavior

### Proper Initialization Order
1. Service manager initializes logger
2. Logger is configured with SERVICE_LOG event handling
3. Services are registered and started
4. Hooks use the initialized loggers

## Usage Examples

### Adding a New Service

1. Create the service class in the appropriate folder
2. Add service name to `service-names.js`
3. Register in the manager:
   ```javascript
   manager.register(SERVICE_NEW_FEATURE, NewFeatureService);
   ```
4. Add accessor function:
   ```javascript
   export function getNewFeatureService() {
     return getManager().get(SERVICE_NEW_FEATURE);
   }
   ```

### Using Logging in Application Code

```javascript
// Server-side
import { getServerLogger } from '$lib/logging/server.js';

const logger = getServerLogger();
logger.info('Operation completed');

// Client-side
import { getClientLogger } from '$lib/logging/client.js';

const logger = getClientLogger();
logger.debug('User interaction', { data });
```

### Error Handling Pattern

```javascript
try {
  await riskyOperation();
  logger.info('Operation succeeded');
} catch (error) {
  logger.error('Operation failed:', error);
  throw error;
}
```

This architecture provides a robust foundation for service management and logging that scales with application complexity while maintaining clear separation of concerns.
