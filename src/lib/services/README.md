# Services

A comprehensive service management system providing standardized lifecycle management, health monitoring, and dependency orchestration for application services.

## Overview

The services module provides two main components:

- **ServiceBase** - Base class for implementing services with lifecycle management
- **ServiceManager** - Orchestrates multiple services with dependency resolution

All services follow a standardized state machine with proper error handling, logging, and health monitoring.

## Service states

Services transition through these states during their lifecycle. Use these constants from `$lib/services/service-base/constants.js`:

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

- Standardized lifecycle methods (`configure`, `start`, `stop`, `destroy`)
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

    if (oldConfig.connectionString !== newConfig.connectionString) {
      // Reconfiguration - handle changes intelligently

      // Connection changed - need to reconnect
      await this.connection?.close();

      this.connectionString = newConfig.connectionString;
      if (this.state === 'running') {
        this.connection = await createConnection(this.connectionString);
      }
    }

    if (oldConfig.maxConnections !== newConfig.maxConnections) {
      // Pool size changed - update without reconnect
      //
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

- `_configure(newConfig, oldConfig = null)` - Configure service (handles both initial setup and reconfiguration)
- `_start()` - Start the service
- `_stop()` - Stop the service
- `_destroy()` - Clean up resources (optional)
- `_recover()` - Custom recovery logic (optional)
- `_healthCheck()` - Return health status (optional)

### Service events

ServiceBase emits these events (constants from `$lib/services/service-base/constants.js`):

- `EVENT_STATE_CHANGED` - Service state transitions
- `EVENT_TARGET_STATE_CHANGED` - Target state changes
- `EVENT_HEALTH_CHANGED` - Health status changes
- `EVENT_ERROR` - Service errors

```javascript
import { EVENT_STATE_CHANGED } from '$lib/services/service-base/constants.js';

service.on(EVENT_STATE_CHANGED, ({ state, previousState }) => {
  console.log(`Service transitioned from ${previousState} to ${state}`);
});
```

## ServiceManager

Manages multiple services with dependency resolution and coordinated lifecycle operations.

### Features

- Service registration with dependency declarations
- Automatic dependency resolution and startup ordering
- Coordinated shutdown in reverse dependency order
- Health monitoring for all services
- Centralized logging control
- Service recovery management
- Plugin system for extending configuration resolution

### Usage

```javascript
import { ServiceManager } from '$hklib-core/services/index.js';

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

### Service Access Patterns

Services receive helpful utilities in their constructor options for accessing other services:

```javascript
class AuthService extends ServiceBase {
  constructor(serviceName, options) {
    super(serviceName, options);
    
    // Store service access utilities
    this.getManager = options.getManager;   // Function to get manager (lazy)
    this.getService = options.getService;   // Bound getService function
  }
  
  async authenticateUser(credentials) {
    // Access other services with full type safety and error checking
    const database = this.getService('database');
    const user = await database.findUser(credentials.username);
    
    // Access manager for advanced operations
    const manager = this.getManager();
    const health = await manager.checkHealth();
    
    return user;
  }
}
```

**Service Access Methods:**

```javascript
// ServiceManager provides two access patterns:

// 1. Permissive - returns undefined if not found/created
const service = manager.get('optional-service');
if (service) {
  // Use service safely
}

// 2. Strict - throws error if not found/created  
const service = manager.getService('required-service'); // Throws if missing
```

**Benefits of constructor utilities:**

- **Lightweight** - Functions don't serialize, keeping services serialization-safe
- **Lazy access** - Manager is only accessed when needed
- **Type safety** - Full generic support with `getService<DatabaseService>('database')`
- **Error handling** - Clear errors when services are missing

### Service Registration

```javascript
manager.register(name, ServiceClass, serviceConfigOrLabel, options);
```

- `name` - Unique service identifier
- `ServiceClass` - Class extending ServiceBase
- `serviceConfigOrLabel` - Service configuration object (`Object<string, *>`) or config label string
- `options.dependencies` - Array of service names this service depends on
- `options.startupPriority` - Higher priority services start first (default: 0)

### Health Monitoring

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

### ServiceManager events

ServiceManager emits these events (constants from `$lib/services/service-manager/constants.js`):

- `SERVICE_STATE_CHANGED` - Service state changes
- `SERVICE_HEALTH_CHANGED` - Service health changes
- `SERVICE_ERROR` - Service errors
- `SERVICE_LOG` - Service log messages

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

### Log Event Forwarding

Forward all service log events to a centralised logger:

```javascript
import { ServiceManager } from '$lib/services/index.js';
import { createServerLogger, DEBUG } from '$lib/logging/index.js';

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

## Plugins

ServiceManager supports plugins e.g. to resolve service configurations dynamically.

### ConfigPlugin

The most common plugin for resolving service configuration from a pre-parsed configuration object. Perfect for environment variables, config files, or any structured configuration source.

#### Basic Usage with Environment Variables

```javascript
import { ServiceManager } from '$lib/services/index.js';

import ConfigPlugin from '$lib/services/manager-plugins/ConfigPlugin.js';

import { getPrivateEnv } from '$lib/util/sveltekit/env-private.js';

// Load and auto-group environment variables
const envConfig = getPrivateEnv();
//
// Example:
//
// DATABASE_HOST=localhost
// DATABASE_PORT=5432
// DATABASE_NAME=myapp
// REDIS_HOST=cache-server
// REDIS_PORT=6379
// JWT_SECRET=mysecret
// =>
// {
//   database: { host: 'localhost', port: 5432, name: 'myapp' },
//   redis: { host: 'cache-server', port: 6379 },
//   jwtSecret: 'mysecret'
// }
//

// Create plugin with grouped config
const configPlugin = new ConfigPlugin(envConfig);

// Attach to ServiceManager
const manager = new ServiceManager();
manager.attachPlugin(configPlugin);

// Register services with config labels (not config objects)
manager.register('database', DatabaseService, 'database'); // Uses envConfig.database
manager.register('cache', RedisService, 'redis'); // Uses envConfig.redis

await manager.startAll();
```

#### Configuration

The plugin constructor accepts an object with configuration data, which can come from any source. E.g. the environment or a configuration file.

```javascript
// Combine multiple config sources
const config = {
  ...getPrivateEnv(), // Environment variables
  ...(await loadConfigFile()), // Config file
  database: {
    // Override specific settings
    ...envConfig.database,
    connectionTimeout: 5000
  }
};

const plugin = new ConfigPlugin(config);
```

### Methods

```javascript
// Replace all configurations and clean up unused ones
await configPlugin.replaceAllConfigs(newConfig);

// Replace configuration for a specific label
await configPlugin.replaceConfig('database', newDatabaseConfig);

// Clean up configurations not used by any service
await configPlugin.cleanupConfigs();
```

### Live Configuration Updates

The ConfigPlugin supports pushing configuration updates to running services:

```javascript
// Replace config for a specific label and notify all affected services
const updatedServices = await configPlugin.replaceConfig('database', {
  host: 'new-host.example.com',
  port: 5433,
  maxConnections: 50
});

// Returns array of service names that were updated: ['user-service', 'order-service']
console.log(`Updated ${updatedServices.length} services`);
```

#### Service Requirements for Live Updates

For services to support live configuration updates, they must:

1. **Implement intelligent `_configure()` logic** that can handle both initial setup and reconfiguration
2. **Check for meaningful changes** between old and new config
3. **Apply changes without full restart** when possible

```javascript
class DatabaseService extends ServiceBase {
  // eslint-disable-next-line no-unused-vars
  async _configure(newConfig, oldConfig = null) {
    if (!oldConfig) {
      // Initial configuration
      this.connectionString = newConfig.connectionString;
      this.maxConnections = newConfig.maxConnections || 10;
      return;
    }

    // Live reconfiguration - handle changes intelligently
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
}
```

## Best Practices

1. **Always extend ServiceBase** for consistent lifecycle management
2. **Keep configuration lightweight** - heavy work should be in `_start()`
3. **Implement proper cleanup** in `_stop()` to prevent resource leaks
4. **Use health checks** for monitoring critical service functionality
5. **Declare dependencies explicitly** when registering with ServiceManager
6. **Handle errors gracefully** and implement recovery where appropriate
7. **Use descriptive service names** for better logging and debugging
