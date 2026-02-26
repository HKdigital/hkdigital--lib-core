# Service Manager Plugins

Plugin system for extending ServiceManager functionality, primarily for
dynamic configuration resolution.

**See also:**
- **API Reference**: [README.md](./README.md) - ServiceBase and
  ServiceManager API
- **Patterns**: [PATTERNS.md](./PATTERNS.md) - Service implementation
  patterns
- **Architecture**: [docs/setup/services-logging.md](../../docs/setup/services-logging.md)
  - Integration examples

## Plugin System Overview

ServiceManager supports plugins to extend its functionality. Plugins
can:

- Resolve service configurations dynamically
- Transform configuration before services receive it
- React to service lifecycle events
- Add custom validation logic

## ConfigPlugin

The most common plugin for resolving service configuration from a
pre-parsed configuration object. Perfect for environment variables,
config files, or any structured configuration source.

### Basic Usage with Environment Variables

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

**Key concept:**
Instead of passing configuration objects directly, pass config **labels**
(strings) that the plugin resolves to actual configuration.

### Configuration Sources

The plugin constructor accepts an object with configuration data, which
can come from any source.

**Environment variables:**

```javascript
import { getPrivateEnv } from '$lib/util/sveltekit/env-private.js';

const envConfig = getPrivateEnv();
const plugin = new ConfigPlugin(envConfig);
```

**Config files:**

```javascript
import configData from './config.json' with { type: 'json' };

const plugin = new ConfigPlugin(configData);
```

**Combine multiple sources:**

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

#### replaceAllConfigs()

Replace all configurations and clean up unused ones.

```javascript
// Update entire configuration set
await configPlugin.replaceAllConfigs(newConfig);
```

**Use case:**
When you need to reload configuration from a file or external source.

#### replaceConfig()

Replace configuration for a specific label.

```javascript
// Update single service configuration
await configPlugin.replaceConfig('database', newDatabaseConfig);
```

**Use case:**
When you need to update a specific service's configuration without
affecting others.

#### cleanupConfigs()

Clean up configurations not used by any service.

```javascript
// Remove unused configurations
await configPlugin.cleanupConfigs();
```

**Use case:**
Memory optimization when configuration object is large and contains
many unused entries.

## Live Configuration Updates

The ConfigPlugin supports pushing configuration updates to running
services without restart.

### Basic Live Update

```javascript
// Replace config for a specific label and notify all affected services
const updatedServices = await configPlugin.replaceConfig('database', {
  host: 'new-host.example.com',
  port: 5433,
  maxConnections: 50
});

// Returns array of service names that were updated
console.log(`Updated ${updatedServices.length} services`);
// => "Updated 2 services" (e.g., ['user-service', 'order-service'])
```

**What happens:**
1. Plugin updates the stored configuration for the label
2. Plugin finds all services using that config label
3. Each service's `configure()` method is called with new config
4. Services intelligently apply changes (see patterns below)

### Service Requirements for Live Updates

For services to support live configuration updates, they must:

1. **Implement intelligent `_configure()` logic** that handles both
   initial setup and reconfiguration
2. **Check for meaningful changes** between old and new config
3. **Apply changes without full restart** when possible

**Example implementation:**

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

### Live Update Patterns

**Hot-reload safe properties:**

```javascript
async _configure(newConfig, oldConfig = null) {
  // These can be updated without restart
  this.timeout = newConfig.timeout || 5000;
  this.retryAttempts = newConfig.retryAttempts || 3;
  this.logLevel = newConfig.logLevel || 'INFO';
}
```

**Properties requiring reconnect:**

```javascript
async _configure(newConfig, oldConfig = null) {
  if (!oldConfig ||
      oldConfig.host !== newConfig.host ||
      oldConfig.port !== newConfig.port) {

    // Close existing connection
    await this.connection?.close();

    // Update config
    this.host = newConfig.host;
    this.port = newConfig.port;

    // Reconnect if running
    if (this.state === 'running') {
      this.connection = await this.#connect();
    }
  }
}
```

**No-op for unchanged config:**

```javascript
async _configure(newConfig, oldConfig = null) {
  if (oldConfig &&
      oldConfig.apiKey === newConfig.apiKey &&
      oldConfig.endpoint === newConfig.endpoint) {
    // Nothing changed, skip reconfiguration
    return;
  }

  // Apply changes
  this.apiKey = newConfig.apiKey;
  this.endpoint = newConfig.endpoint;
}
```

## Advanced Usage

### Multiple Services Sharing Configuration

Multiple services can share the same configuration label.

```javascript
const config = {
  database: {
    host: 'localhost',
    port: 5432,
    name: 'myapp'
  }
};

const plugin = new ConfigPlugin(config);
manager.attachPlugin(plugin);

// Both services use the same config
manager.register('user-db', UserDatabaseService, 'database');
manager.register('order-db', OrderDatabaseService, 'database');

// Update affects both services
await plugin.replaceConfig('database', {
  host: 'new-host',
  port: 5432,
  name: 'myapp'
});
// Both user-db and order-db reconnect to new host
```

### Configuration with Defaults

Provide base configuration and let services apply defaults.

```javascript
const config = {
  database: {
    host: 'localhost',
    port: 5432
    // maxConnections not specified
  }
};

const plugin = new ConfigPlugin(config);
manager.attachPlugin(plugin);

manager.register('database', DatabaseService, 'database');

// Service applies defaults in _configure()
class DatabaseService extends ServiceBase {
  async _configure(newConfig, oldConfig = null) {
    this.host = newConfig.host;
    this.port = newConfig.port;
    this.maxConnections = newConfig.maxConnections || 10; // Default
  }
}
```

### Environment-Specific Configuration

Use environment variables to switch configurations.

```javascript
import { getPrivateEnv } from '$lib/util/sveltekit/env-private.js';

const env = getPrivateEnv();

const config = {
  database: {
    host: env.DATABASE_HOST || 'localhost',
    port: env.DATABASE_PORT || 5432,
    name: env.DATABASE_NAME || 'myapp',
    ssl: env.NODE_ENV === 'production'
  }
};

const plugin = new ConfigPlugin(config);
```

## Error Handling

### Invalid Configuration Labels

When a service requests a non-existent config label:

```javascript
manager.register('cache', CacheService, 'redis'); // 'redis' not in config

// Plugin will pass through the label as-is to the service
// Service's _configure() receives 'redis' string instead of object
```

**Best practice:**
Validate configuration in service's `_configure()`:

```javascript
async _configure(newConfig, oldConfig = null) {
  if (typeof newConfig === 'string') {
    throw new Error(
      `Configuration label '${newConfig}' not found in ConfigPlugin`
    );
  }

  // Continue with valid config object
  this.host = newConfig.host;
}
```

### Configuration Validation

Validate configuration before applying:

```javascript
async _configure(newConfig, oldConfig = null) {
  // Validate required fields
  if (!newConfig.host || !newConfig.port) {
    throw new Error('Database config requires host and port');
  }

  // Validate types
  if (typeof newConfig.port !== 'number') {
    throw new Error('Database port must be a number');
  }

  // Validate ranges
  if (newConfig.port < 1 || newConfig.port > 65535) {
    throw new Error('Database port must be between 1 and 65535');
  }

  // Apply validated config
  this.host = newConfig.host;
  this.port = newConfig.port;
}
```

## Best Practices

1. **Use config labels consistently** - Match label names to service
   names when possible
2. **Group related config** - Use prefixes (DATABASE_*, REDIS_*) for
   auto-grouping
3. **Validate config in services** - Don't assume ConfigPlugin has all
   labels
4. **Implement intelligent reconfiguration** - Check what changed
   before taking action
5. **Test live updates** - Ensure services handle config changes
   gracefully
6. **Provide sensible defaults** - Make services work with minimal
   config
7. **Document required fields** - Make it clear what each service needs
8. **Use environment variables** - Keep secrets out of code

## Creating Custom Plugins

Custom plugins can extend ServiceManager functionality. Plugin
interface:

```javascript
class CustomPlugin {
  constructor(options) {
    this.options = options;
  }

  /**
   * Called when plugin is attached to ServiceManager
   *
   * @param {ServiceManager} manager
   */
  attach(manager) {
    this.manager = manager;
    // Setup listeners, initialization, etc.
  }

  /**
   * Called when ServiceManager resolves config for a service
   *
   * @param {string} serviceName
   * @param {*} config
   *
   * @returns {*} Resolved config
   */
  resolveConfig(serviceName, config) {
    // Transform or resolve config
    return config;
  }

  /**
   * Called when plugin is detached
   */
  detach() {
    // Cleanup
  }
}
```

**Example - Validation Plugin:**

```javascript
class ValidationPlugin {
  constructor(schemas) {
    this.schemas = schemas; // Map of service name -> validation schema
  }

  attach(manager) {
    this.manager = manager;
  }

  resolveConfig(serviceName, config) {
    const schema = this.schemas[serviceName];

    if (schema) {
      const result = schema.safeParse(config);

      if (!result.success) {
        throw new Error(
          `Invalid config for ${serviceName}: ${result.error.message}`
        );
      }

      return result.data;
    }

    return config;
  }

  detach() {
    this.manager = null;
  }
}

// Usage
import { v } from '$lib/valibot/valibot.js';

const schemas = {
  database: v.object({
    host: v.string(),
    port: v.number(),
    name: v.string()
  })
};

const plugin = new ValidationPlugin(schemas);
manager.attachPlugin(plugin);
```
