# Service Patterns and Best Practices

Design patterns and best practices for implementing services with the
ServiceBase and ServiceManager system.

**See also:**
- **API Reference**: [README.md](./README.md) - ServiceBase and
  ServiceManager API
- **Plugins**: [PLUGINS.md](./PLUGINS.md) - Plugin system and
  ConfigPlugin
- **Architecture**: [docs/setup/services-logging.md](../../docs/setup/services-logging.md)
  - Integration patterns

## Service Access Patterns

Services receive helpful utilities in their constructor options for
accessing other services and the manager.

### Basic Pattern

```javascript
/**
 * Example service that depends on other services
 */
class AuthService extends ServiceBase {
  /** @type {(<T>(serviceName: string) => T)} */
  #getService;

  /** @type {() => import('@hkdigital/lib-core/services/index.js').ServiceManager} */
  #getManager;

  constructor(serviceName, options) {
    super(serviceName, options);

    // Store service access utilities as private methods
    this.#getService = options.getService;   // Bound getService function
    this.#getManager = options.getManager;   // Function to get manager (lazy)
  }

  async authenticateUser(credentials) {
    // Access other services with full type safety and error checking
    const database = this.#getService('database');
    const user = await database.findUser(credentials.username);

    // Access manager for advanced operations when needed
    const manager = this.#getManager();
    const health = await manager.checkHealth();

    return user;
  }
}
```

### Recommended Pattern: Private Methods

The recommended approach is to store service access functions as
**private methods** using the hash prefix. This pattern provides:

**Benefits:**
- **Keeps the API clean** - No public getService/getManager methods
  exposed
- **Prevents serialization issues** - Private fields don't serialize
  to JSON
- **Enforces proper encapsulation** - Service dependencies stay
  internal
- **Provides type safety** - Full generic support with
  `this.#getService<DatabaseService>('database')`

**Example:**

```javascript
/**
 * Unified service for tracking complete player data including progress
 * and profile matches
 */
export default class PlayerService extends ServiceBase {

  /** @type {(<T>(serviceName: string) => T)} */
  #getService;

  /**
   * @param {string} serviceName
   * @param {import('@hkdigital/lib-core/services/typedef.js').ServiceOptions} [options]
   */
  constructor(serviceName, options) {
    super(serviceName, options);

    this.#getService = options?.getService;
  }

  async getPlayerProfile(playerId) {
    // Access dependent services cleanly
    const database = this.#getService('database');
    const analytics = this.#getService('analytics');

    const profile = await database.getPlayer(playerId);
    const stats = await analytics.getPlayerStats(playerId);

    return { ...profile, stats };
  }
}
```

### Service Access Methods

ServiceManager provides two access patterns:

```javascript
// 1. Permissive - returns undefined if not found/created
const service = manager.get('optional-service');
if (service) {
  // Use service safely
}

// 2. Strict - throws error if not found/created
const service = manager.getService('required-service'); // Throws if missing
```

**When to use each:**
- Use `get()` for optional services or when checking availability
- Use `getService()` for required dependencies (clearer error messages)

### Constructor Utilities Benefits

**Lightweight:**
Functions don't serialize, keeping services serialization-safe.

**Lazy access:**
Manager is only accessed when needed, avoiding circular dependencies
during initialization.

**Type safety:**
Full generic support with JSDoc annotations enables IDE autocomplete
and type checking.

**Error handling:**
Clear, consistent errors when services are missing or not yet
initialized.

## Configuration Patterns

### Initial Configuration vs Reconfiguration

Services should handle both initial setup and runtime reconfiguration
intelligently.

**Pattern:**

```javascript
class DatabaseService extends ServiceBase {
  // eslint-disable-next-line no-unused-vars
  async _configure(newConfig, oldConfig = null) {
    if (!oldConfig) {
      // Initial configuration - store all settings
      this.connectionString = newConfig.connectionString;
      this.maxConnections = newConfig.maxConnections || 10;
      this.timeout = newConfig.timeout || 5000;
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

    if (oldConfig.timeout !== newConfig.timeout) {
      // Timeout changed - just update the setting
      this.timeout = newConfig.timeout;
    }
  }
}
```

**Key principles:**
- Check `!oldConfig` to detect initial configuration
- Compare old and new config to identify what changed
- Apply minimal changes (don't restart if not needed)
- Update running state when possible

### Configuration Defaults

Handle missing configuration gracefully with sensible defaults.

**Pattern:**

```javascript
async _configure(newConfig, oldConfig = null) {
  // Use defaults for missing values
  this.host = newConfig.host || 'localhost';
  this.port = newConfig.port || 5432;
  this.maxConnections = newConfig.maxConnections || 10;
  this.timeout = newConfig.timeout || 5000;
  this.retryAttempts = newConfig.retryAttempts ?? 3; // Use ?? for zero values
}
```

## Lifecycle Patterns

### Proper Resource Management

Always clean up resources in the stop method.

**Pattern:**

```javascript
class WebSocketService extends ServiceBase {
  async _start() {
    this.ws = new WebSocket(this.url);
    this.intervalId = setInterval(() => this.#ping(), 30000);

    await new Promise((resolve) => {
      this.ws.onopen = resolve;
    });
  }

  async _stop() {
    // Clear timers
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Close connections
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  async _destroy() {
    // Clean up any remaining resources
    await this._stop();
  }
}
```

### Async Initialization

Keep `_configure()` lightweight, do heavy work in `_start()`.

**Good:**

```javascript
async _configure(newConfig, oldConfig = null) {
  // Just store config
  this.apiKey = newConfig.apiKey;
  this.endpoint = newConfig.endpoint;
}

async _start() {
  // Heavy work here
  this.client = await createApiClient(this.apiKey, this.endpoint);
  await this.client.authenticate();
}
```

**Bad:**

```javascript
async _configure(newConfig, oldConfig = null) {
  // Don't do heavy work in configure
  this.client = await createApiClient(newConfig.apiKey);
  await this.client.authenticate(); // ❌ Heavy operation
}
```

## Health Check Patterns

### Return Useful Metrics

Health checks should return actionable information.

**Pattern:**

```javascript
async _healthCheck() {
  const start = Date.now();

  try {
    await this.connection.ping();

    return {
      latency: Date.now() - start,
      connections: this.connection.activeConnections,
      queueSize: this.connection.queueSize
    };
  } catch (error) {
    return {
      error: error.message,
      lastSuccessful: this.lastSuccessfulPing
    };
  }
}
```

### Implement Recovery Logic

Provide custom recovery for services that can auto-heal.

**Pattern:**

```javascript
async _recover() {
  // Close broken connection
  await this.connection?.close();

  // Wait before reconnecting
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Recreate connection
  this.connection = await createConnection(this.connectionString);

  // Verify it works
  await this.connection.ping();
}
```

## Error Handling Patterns

### Graceful Degradation

Handle errors without crashing the entire system.

**Pattern:**

```javascript
class CacheService extends ServiceBase {
  async get(key) {
    try {
      return await this.redis.get(key);
    } catch (error) {
      this.logger.warn('Cache read failed, falling back', { key, error });
      return null; // Graceful fallback
    }
  }

  async set(key, value) {
    try {
      await this.redis.set(key, value);
    } catch (error) {
      this.logger.error('Cache write failed', { key, error });
      // Don't throw - cache writes are not critical
    }
  }
}
```

### Timeout Handling

Set appropriate timeouts for long-running operations.

**Pattern:**

```javascript
async _start() {
  const timeout = this.config.startTimeout || 10000;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    this.connection = await fetch(this.endpoint, {
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
```

## Dependency Management Patterns

### Declare Dependencies Explicitly

Always declare service dependencies for proper startup ordering.

**Pattern:**

```javascript
// Register services with explicit dependencies
manager.register('database', DatabaseService, dbConfig);

manager.register(
  'cache',
  CacheService,
  cacheConfig,
  {
    dependencies: ['database'] // Cache needs database
  }
);

manager.register(
  'auth',
  AuthService,
  authConfig,
  {
    dependencies: ['database', 'cache'] // Auth needs both
  }
);
```

### Startup Priority

Use priority for services that should start early.

**Pattern:**

```javascript
// Start logger first (highest priority)
manager.register(
  'logger',
  LoggerService,
  logConfig,
  { startupPriority: 100 }
);

// Then database (high priority)
manager.register(
  'database',
  DatabaseService,
  dbConfig,
  { startupPriority: 50 }
);

// Then other services (default priority: 0)
manager.register('auth', AuthService, authConfig);
```

## Best Practices

### Service Design

1. **Always extend ServiceBase** for consistent lifecycle management
2. **Keep configuration lightweight** - heavy work should be in
   `_start()`
3. **Implement proper cleanup** in `_stop()` to prevent resource leaks
4. **Use health checks** for monitoring critical service functionality
5. **Handle errors gracefully** and implement recovery where
   appropriate

### Service Registration

6. **Declare dependencies explicitly** when registering with
   ServiceManager
7. **Use descriptive service names** for better logging and debugging
8. **Set appropriate priorities** for services with ordering
   requirements

### Service Implementation

9. **Store service access as private methods** using hash prefix
10. **Return useful metrics** from health checks
11. **Implement intelligent reconfiguration** that applies minimal
    changes
12. **Handle missing config gracefully** with sensible defaults

### Resource Management

13. **Clean up all resources** in `_stop()` (timers, connections,
    listeners)
14. **Set appropriate timeouts** for long-running operations
15. **Use graceful degradation** instead of throwing errors when
    possible
16. **Test service lifecycle** (start, stop, restart, reconfigure)
