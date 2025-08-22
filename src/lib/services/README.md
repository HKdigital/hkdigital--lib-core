# Services

A comprehensive service management system providing standardized lifecycle management, health monitoring, and dependency orchestration for application services.

## Overview

The services module provides two main components:

- **ServiceBase** - Base class for implementing services with lifecycle management
- **ServiceManager** - Orchestrates multiple services with dependency resolution

All services follow a standardized state machine with proper error handling, logging, and health monitoring.

## Service States

Services transition through these states during their lifecycle:

- `created` - Service instantiated but not configured
- `configuring` - Currently running configuration
- `configured` - Ready to start
- `starting` - Currently starting up
- `running` - Operational and healthy
- `stopping` - Currently shutting down
- `stopped` - Cleanly stopped
- `destroying` - Being destroyed and cleaned up
- `destroyed` - Completely destroyed
- `error` - Failed and non-operational
- `recovering` - Attempting recovery from error

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
  maxConnections: 50  // Hot-reloaded without restart
});
```

### Protected Methods to Override

- `_configure(newConfig, oldConfig = null)` - Configure service (handles both initial setup and reconfiguration)
- `_start()` - Start the service
- `_stop()` - Stop the service
- `_destroy()` - Clean up resources (optional)
- `_recover()` - Custom recovery logic (optional)
- `_healthCheck()` - Return health status (optional)

### Events

- `stateChanged` - Service state transitions
- `healthChanged` - Health status changes
- `error` - Service errors

## ServiceManager

Manages multiple services with dependency resolution and coordinated lifecycle operations.

### Features

- Service registration with dependency declarations
- Automatic dependency resolution and startup ordering
- Coordinated shutdown in reverse dependency order
- Health monitoring for all services
- Centralized logging control
- Service recovery management

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

manager.register('auth', AuthService, {
  secret: process.env.JWT_SECRET
}, {
  dependencies: ['database'] // auth depends on database
});

// Start all services in dependency order
await manager.startAll();

// Check system health
const health = await manager.checkHealth();

// Stop all services in reverse dependency order
await manager.stopAll();
```

### Service Registration

```javascript
manager.register(name, ServiceClass, config, options);
```

- `name` - Unique service identifier
- `ServiceClass` - Class extending ServiceBase
- `config` - Service-specific configuration
- `options.dependencies` - Array of service names this service depends on

### Health Monitoring

```javascript
// Listen for health changes
manager.on('service:healthChanged', ({ service, healthy }) => {
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

```javascript
// Listen for service errors
manager.on('service:error', async ({ service, error }) => {
  console.log(`Service ${service} failed:`, error.message);
  
  // Attempt automatic recovery
  await manager.recoverService(service);
});

// Manual recovery
await manager.recoverService('database');
```

## Best Practices

1. **Always extend ServiceBase** for consistent lifecycle management
2. **Keep configuration lightweight** - heavy work should be in `_start()`
3. **Implement proper cleanup** in `_stop()` to prevent resource leaks
4. **Use health checks** for monitoring critical service functionality
5. **Declare dependencies explicitly** when registering with ServiceManager
6. **Handle errors gracefully** and implement recovery where appropriate
7. **Use descriptive service names** for better logging and debugging

## Testing

Services include comprehensive test suites demonstrating:

- Lifecycle state transitions
- Error handling and recovery
- Dependency resolution
- Health monitoring
- Event emission

Run tests with your project's test command to ensure service reliability.
