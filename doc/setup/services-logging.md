# Services and Logging Architecture

This document describes the centralized service management and logging
architecture used in SvelteKit projects with `@hkdigital/lib-core`.

**For detailed API documentation:**
- **Logging**: [src/lib/logging/README.md](../../src/lib/logging/README.md)
  - Server and client logger API reference
- **Services**: [src/lib/services/README.md](../../src/lib/services/README.md)
  - ServiceBase and ServiceManager reference

## Architecture Overview

The project uses a centralized service management pattern with
integrated logging:

- **Service managers**: Centralized service registration and lifecycle
  management
- **Logging**: Separated into dedicated modules with proper
  initialization order
- **Hooks integration**: SvelteKit hooks handle initialization and
  cleanup

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

## Core Concepts

### 1. Separation of Concerns

**Logging logic** is isolated in dedicated modules:
- `src/lib/logging/server.js` - Server-side pino logging
- `src/lib/logging/client.js` - Client-side console logging

**Service management** handles registration and lifecycle:
- Services extend `ServiceBase` for standardized lifecycle
- `ServiceManager` orchestrates multiple services with dependencies
- Service accessor functions provide clean API

**Hooks** focus on SvelteKit integration:
- Initialize loggers and services during app startup
- Handle errors and cleanup
- Bridge SvelteKit events to logging system

### 2. Initialization Order

The proper initialization sequence ensures dependencies are available:

1. Logger is initialized first (standalone)
2. Service manager is created
3. Service manager forwards log events to logger
4. Services are registered and started
5. Application code uses initialized services and logger

### 3. Centralized Configuration

- Single place to configure each logger
- Consistent logging patterns across the application
- Easy to modify logging behavior
- Per-service log level control via `ServiceManager`

## Integration Pattern

### Minimal Server Integration

```javascript
// src/lib/logging/server.js
import { createServerLogger, DEBUG }
  from '@hkdigital/lib-core/logging/server.js';

let logger;

export function initServerLogger() {
  if (!logger) {
    logger = createServerLogger('server-logger', DEBUG);
  }
  return logger;
}

export function getServerLogger() {
  if (!logger) {
    throw new Error('Server logger should be initialised first');
  }
  return logger;
}
```

```javascript
// src/lib/services/server/manager.js
import { ServiceManager } from '@hkdigital/lib-core/services/index.js';
import { initServerLogger } from '$lib/logging/server.js';

let manager;

export async function initServerServices() {
  if (!manager) {
    const logger = initServerLogger();

    manager = new ServiceManager({
      debug: false,
      managerLogLevel: 'INFO'
    });

    // Forward all service logs to centralized logger
    manager.onLogEvent((logEvent) => {
      logger.logFromEvent(logEvent);
    });

    // Register services here
    // manager.register('database', DatabaseService, config);
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

```javascript
// src/hooks.server.js
import { initServerServices } from '$lib/services/server.js';
import { getServerLogger } from '$lib/logging/server.js';

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
```

**See [src/lib/logging/README.md](../../src/lib/logging/README.md)
for complete hooks examples.**

### Minimal Client Integration

```javascript
// src/lib/logging/client.js
import { createClientLogger, DEBUG }
  from '@hkdigital/lib-core/logging/client.js';

let logger;

export function initClientLogger() {
  if (!logger) {
    logger = createClientLogger('client-logger', DEBUG);
  }
  return logger;
}

export function getClientLogger() {
  if (!logger) {
    throw new Error('Client logger should be initialised first');
  }
  return logger;
}
```

```javascript
// src/lib/services/client/manager.js
import { ServiceManager } from '@hkdigital/lib-core/services/index.js';
import { initClientLogger } from '$lib/logging/client.js';

let manager;

export async function initClientServices() {
  if (!manager) {
    const logger = initClientLogger();

    // Setup global error handlers
    window.addEventListener('error', (event) => {
      logger.error(event, { url: window.location.pathname });
      event.preventDefault();
    });

    manager = new ServiceManager({ debug: true });

    // Forward all service logs to centralized logger
    manager.onLogEvent((logEvent) => {
      logger.logFromEvent(logEvent);
    });

    // Register services here
    // manager.register('audio', AudioService);
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

**See [src/lib/logging/README.md](../../src/lib/logging/README.md)
for complete hooks examples.**

## Key Benefits

### Proper Initialization Order
Logger initializes first, then services use it for all logging needs.

### Centralized Log Management
All service logs flow through the ServiceManager to a single logger,
providing unified log formatting and filtering.

### Separation of Concerns
Clear boundaries between logging logic, service management, and
SvelteKit integration.

### Type Safety with JSDoc
Full type support for service access and logger methods without
TypeScript overhead.

## Usage Examples

### Adding a New Service

1. Create the service class extending `ServiceBase`
2. Add service name constant to `service-names.js`
3. Register in manager:
   ```javascript
   manager.register(SERVICE_MY_FEATURE, MyFeatureService, config);
   ```
4. Add accessor function in `services.js`:
   ```javascript
   export function getMyFeatureService() {
     return getManager().get(SERVICE_MY_FEATURE);
   }
   ```

**See [src/lib/services/README.md](../../src/lib/services/README.md)
for detailed service creation guide.**

### Using Logging in Application Code

```javascript
// Server-side
import { getServerLogger } from '$lib/logging/server.js';

const logger = getServerLogger();
logger.info('Operation completed', { userId: 123 });

// Client-side
import { getClientLogger } from '$lib/logging/client.js';

const logger = getClientLogger();
logger.debug('User interaction', { action: 'click' });
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

## Next Steps

- **Logging API**: See [src/lib/logging/README.md](../../src/lib/logging/README.md)
  for log levels, formatters, and advanced usage
- **Services API**: See [src/lib/services/README.md](../../src/lib/services/README.md)
  for lifecycle management, health checks, and plugins
- **Project Setup**: See [new-project.md](./new-project.md) for
  complete setup guide
