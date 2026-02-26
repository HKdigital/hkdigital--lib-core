# Services

A comprehensive service management system providing standardized
lifecycle management, health monitoring, and dependency orchestration
for application services.

**See also:**
- **Architecture**: [docs/setup/services-logging.md](../../docs/setup/services-logging.md)
  - How services and logging work together
- **Patterns**: [PATTERNS.md](./PATTERNS.md) - Service access patterns
  and best practices
- **Plugins**: [PLUGINS.md](./PLUGINS.md) - ConfigPlugin and plugin
  system
- **Logging**: [src/lib/logging/README.md](../logging/README.md) -
  Logging system integration
- **Main README**: [README.md](../../README.md) - Library overview and
  setup

## Overview

The services module provides two main components:

- **ServiceBase** - Base class for implementing services with lifecycle
  management
- **ServiceManager** - Orchestrates multiple services with dependency
  resolution

All services follow a standardized state machine with proper error
handling, logging, and health monitoring.

## Service States

Services transition through these states during their lifecycle. Use
these constants from `$lib/services/service-base/constants.js`:

- `STATE_CREATED` - Service instantiated but not configured
- `STATE_CONFIGURING` - Currently running configuration
- `STATE_CONFIGURED` - Ready to start
- `STATE_STARTING` - Currently starting up
- `STATE_RUNNING` - Operational and healthy
- `STATE_STOPPING` - Currently shutting down
- `STATE_STOPPED` - Cleanly stopped
- `STATE_DESTROYING` - Being destroyed and cleaned up
- `STATE_DESTROYED` - Completely destroyed
- `STATE_ERROR` - Failed and non-operational
- `STATE_RECOVERING` - Attempting recovery from error

```javascript
import {
  STATE_RUNNING,
  STATE_ERROR
} from '$lib/services/service-base/constants.js';

if (service.state === STATE_RUNNING) {
  // Service is operational
}
```

## ServiceBase

Base class that all services should extend. Provides:

- Standardized lifecycle methods (`configure`, `start`, `stop`,
  `destroy`)
- Flexible configuration system with reconfiguration support
- Health monitoring and recovery
- Event emission for state changes
- Integrated logging
- Error handling and timeout management

### Basic Usage

```javascript
import { ServiceBase } from '$lib/services/index.js';

class DatabaseService extends ServiceBase {
  // eslint-disable-next-line no-unused-vars
  async _configure(newConfig, oldConfig = null) {
    if (!oldConfig) {
      // Initial configuration
      this.connectionString = newConfig.connectionString;
      this.maxConnections = newConfig.maxConnections || 10;
      return;
    }

    // Reconfiguration - handle changes intelligently
    if (oldConfig.connectionString !== newConfig.connectionString) {
      // Connection changed - need to reconnect
      await this.connection?.close();
      this.connectionString = newConfig.connectionString;

      if (this.state === 'running') {
        this.connection = await createConnection(this.connectionString);
      }
    }

    if (oldConfig.maxConnections !== newConfig.maxConnections) {
      // Pool size changed - update without reconnect
      this.maxConnections = newConfig.maxConnections;
      await this.connection?.setMaxConnections(this.maxConnections);
    }
  }

  async _start() {
    this.connection = await createConnection(this.connectionString);
  }

  async _stop() {
    await this.connection?.close();
  }

  async _healthCheck() {
    const start = Date.now();
    await this.connection.ping();
    return { latency: Date.now() - start };
  }
}

// Usage
const db = new DatabaseService('database');
await db.configure({
  connectionString: 'postgres://localhost/myapp',
  maxConnections: 20
});
await db.start();

// Listen to events
db.on('healthChanged', ({ healthy }) => {
  console.log(`Database is ${healthy ? 'healthy' : 'unhealthy'}`);
});

// Reconfigure at runtime
await db.configure({
  connectionString: 'postgres://localhost/myapp',
  maxConnections: 50 // Hot-reloaded without restart
});
```

### Protected Methods to Override

Implement these methods to define service behavior:

- `_configure(newConfig, oldConfig = null)` - Configure service
  (handles both initial setup and reconfiguration)
- `_start()` - Start the service
- `_stop()` - Stop the service
- `_destroy()` - Clean up resources (optional)
- `_recover()` - Custom recovery logic (optional)
- `_healthCheck()` - Return health status (optional)

**See [PATTERNS.md](./PATTERNS.md) for implementation patterns and best
practices.**

### Service Events

ServiceBase emits these events (constants from
`$lib/services/service-base/constants.js`):

- `EVENT_STATE_CHANGED` - Service state transitions
- `EVENT_TARGET_STATE_CHANGED` - Target state changes
- `EVENT_HEALTH_CHANGED` - Health status changes
- `EVENT_ERROR` - Service errors

```javascript
import { EVENT_STATE_CHANGED }
  from '$lib/services/service-base/constants.js';

service.on(EVENT_STATE_CHANGED, ({ state, previousState }) => {
  console.log(`Service transitioned from ${previousState} to ${state}`);
});
```

## ServiceManager

Manages multiple services with dependency resolution and coordinated
lifecycle operations.

### Features

- Service registration with dependency declarations
- Automatic dependency resolution and startup ordering
- Coordinated shutdown in reverse dependency order
- Health monitoring for all services
- Centralized logging control
- Service recovery management
- Plugin system for extending configuration resolution

### Basic Usage

```javascript
import { ServiceManager } from '@hkdigital/lib-core/services/index.js';

import DatabaseService from './services/DatabaseService.js';
import AuthService from './services/AuthService.js';

const manager = new ServiceManager({
  debug: true,
  stopTimeout: 10000
});

// Register services with dependencies
manager.register('database', DatabaseService, {
  connectionString: 'postgres://localhost/myapp'
});

manager.register(
  'auth',
  AuthService,
  {
    secret: process.env.JWT_SECRET
  },
  {
    dependencies: ['database'] // auth depends on database
  }
);

// Start all services in dependency order
await manager.startAll();

// Check system health
const health = await manager.checkHealth();

// Stop all services in reverse dependency order
await manager.stopAll();
```

### Service Registration

```javascript
manager.register(name, ServiceClass, serviceConfigOrLabel, options);
```

**Parameters:**
- `name` - Unique service identifier
- `ServiceClass` - Class extending ServiceBase
- `serviceConfigOrLabel` - Service configuration object
  (`Object<string, *>`) or config label string (when using ConfigPlugin)
- `options.dependencies` - Array of service names this service depends
  on
- `options.startupPriority` - Higher priority services start first
  (default: 0)

### Service Access

ServiceManager provides methods to access registered services:

```javascript
// Permissive - returns undefined if not found/created
const service = manager.get('optional-service');
if (service) {
  // Use service safely
}

// Strict - throws error if not found/created
const service = manager.getService('required-service');
```

**Within services**, use constructor utilities for type-safe access:

```javascript
class AuthService extends ServiceBase {
  /** @type {(<T>(serviceName: string) => T)} */
  #getService;

  constructor(serviceName, options) {
    super(serviceName, options);
    this.#getService = options.getService;
  }

  async authenticate(credentials) {
    const database = this.#getService('database');
    return await database.findUser(credentials.username);
  }
}
```

**See [PATTERNS.md](./PATTERNS.md) for detailed service access
patterns.**

### Health Monitoring

Monitor service health individually or system-wide:

```javascript
import {
  SERVICE_HEALTH_CHANGED,
  SERVICE_ERROR,
  SERVICE_STATE_CHANGED,
  SERVICE_LOG
} from '$lib/services/service-manager/constants.js';

// Listen for health changes
manager.on(SERVICE_HEALTH_CHANGED, ({ service, healthy }) => {
  if (!healthy) {
    console.error(`Service ${service} became unhealthy`);
  }
});

// Check individual service health
const dbHealth = await manager.getServiceHealth('database');

// Check all services health
const systemHealth = await manager.checkHealth();
```

### Error Handling and Recovery

ServiceManager provides automatic error handling and recovery:

```javascript
// Listen for service errors
manager.on(SERVICE_ERROR, async ({ service, error }) => {
  console.log(`Service ${service} failed:`, error.message);

  // Attempt automatic recovery
  await manager.recoverService(service);
});

// Manual recovery
await manager.recoverService('database');
```

### Logging Configuration

ServiceManager provides centralized logging control for all services:

```javascript
const manager = new ServiceManager({
  debug: true,                    // Sets defaultLogLevel to DEBUG
  defaultLogLevel: 'INFO',        // Default level for all services
  managerLogLevel: 'DEBUG',       // Level for ServiceManager itself
  serviceLogLevels: {             // Per-service levels
    database: 'ERROR',
    auth: 'DEBUG'
  }
});

// Change manager log level at runtime
manager.setManagerLogLevel('ERROR');

// Change service log levels at runtime
manager.setServiceLogLevel('database', 'INFO');

// Set multiple service levels at once
manager.setServiceLogLevel({
  database: 'INFO',
  auth: 'DEBUG'
});

// Parse string format
manager.setServiceLogLevel('database:info,auth:debug');
```

### ServiceManager Events

ServiceManager emits these events (constants from
`$lib/services/service-manager/constants.js`):

- `SERVICE_STATE_CHANGED` - Service state changes
- `SERVICE_HEALTH_CHANGED` - Service health changes
- `SERVICE_ERROR` - Service errors
- `SERVICE_LOG` - Service log messages

### Log Event Forwarding

Forward all service log events to a centralized logger:

```javascript
import { ServiceManager } from '$lib/services/index.js';
import { createServerLogger, DEBUG } from '$lib/logging/server.js';

const manager = new ServiceManager();
const logger = createServerLogger('SystemLogger', DEBUG);

// Listen to all log events and forward them to the logger
const unsubscribe = manager.onLogEvent((logEvent) => {
  logger.logFromEvent(logEvent);
});

// Register services
manager.register('database', DatabaseService, { ... });
manager.register('auth', AuthService, { ... });

await manager.startAll();

// Cleanup when done
unsubscribe();
```

**See [docs/setup/services-logging.md](../../docs/setup/services-logging.md)
for complete integration examples.**

## Plugins

ServiceManager supports plugins to extend functionality, primarily for
dynamic configuration resolution.

### ConfigPlugin

The most common plugin for resolving service configuration from
environment variables or config files:

```javascript
import { ServiceManager } from '$lib/services/index.js';
import ConfigPlugin from '$lib/services/manager-plugins/ConfigPlugin.js';
import { getPrivateEnv } from '$lib/util/sveltekit/env-private.js';

// Load environment config
const envConfig = getPrivateEnv();

// Create and attach plugin
const configPlugin = new ConfigPlugin(envConfig);
const manager = new ServiceManager();
manager.attachPlugin(configPlugin);

// Register services with config labels (not config objects)
manager.register('database', DatabaseService, 'database');
manager.register('cache', RedisService, 'redis');

await manager.startAll();

// Hot-reload configuration
await configPlugin.replaceConfig('database', newDatabaseConfig);
```

**See [PLUGINS.md](./PLUGINS.md) for complete plugin documentation and
live configuration updates.**

## Quick Reference

### Service Lifecycle

```
created → configuring → configured → starting → running
                                                    ↓
                                                 stopping → stopped → destroying → destroyed
                                                    ↓
                                                  error ← → recovering
```

### Common Operations

```javascript
// Create and start service
const service = new MyService('my-service');
await service.configure(config);
await service.start();

// Check health
const health = await service.healthCheck();

// Reconfigure
await service.configure(newConfig);

// Stop service
await service.stop();

// Destroy service
await service.destroy();
```

### ServiceManager Operations

```javascript
// Register services
manager.register('name', ServiceClass, config, options);

// Lifecycle
await manager.startAll();
await manager.stopAll();
await manager.destroyAll();

// Access
const service = manager.get('name');
const service = manager.getService('name'); // Throws if missing

// Health
const health = await manager.checkHealth();
const serviceHealth = await manager.getServiceHealth('name');

// Recovery
await manager.recoverService('name');
```

## Next Steps

- **Patterns**: See [PATTERNS.md](./PATTERNS.md) for service access
  patterns, configuration patterns, and best practices
- **Plugins**: See [PLUGINS.md](./PLUGINS.md) for ConfigPlugin and
  custom plugins
- **Architecture**: See [docs/setup/services-logging.md](../../docs/setup/services-logging.md)
  for integration with logging and SvelteKit hooks
