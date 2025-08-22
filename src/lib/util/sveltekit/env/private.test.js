import { describe, it, expect, vi } from 'vitest';

import { getPrivateEnv, getPrivateEnvByPrefix, getRawPrivateEnv } from './private.js';

// Mock the SvelteKit environment
vi.mock('$env/dynamic/private', () => ({
  env: {
    'DATABASE_HOST': 'localhost',
    'DATABASE_PORT': '5432',
    'DATABASE_NAME': 'myapp',
    'DATABASE_USER': 'admin',
    'REDIS_URL': 'redis://localhost:6379',
    'REDIS_TTL': '3600',
    'JWT_SECRET': 'super-secret-key',
    'JWT_EXPIRES_IN': '24h',
    'SINGLE_SECRET': 'secret-value',
    'API_RATE_LIMIT': '1000'
  }
}));

describe('getPrivateEnv', () => {
  it('should get all private environment variables with auto grouping', () => {
    const result = getPrivateEnv();
    
    expect(result).toEqual({
      database: {
        host: 'localhost',
        port: 5432,
        name: 'myapp',
        user: 'admin'
      },
      redis: {
        url: 'redis://localhost:6379',
        ttl: 3600
      },
      jwt: {
        secret: 'super-secret-key',
        expiresIn: '24h'
      },
      single: {
        secret: 'secret-value'     // Now grouped since it has underscore
      },
      api: {
        rateLimit: 1000           // Now grouped since it has underscore
      }
    });
  });

  it('should disable auto grouping when specified', () => {
    const result = getPrivateEnv({ autoGroup: false });
    
    expect(result).toEqual({
      databaseHost: 'localhost',
      databasePort: 5432,
      databaseName: 'myapp',
      databaseUser: 'admin',
      redisUrl: 'redis://localhost:6379',
      redisTtl: 3600,
      jwtSecret: 'super-secret-key',
      jwtExpiresIn: '24h',
      singleSecret: 'secret-value',
      apiRateLimit: 1000
    });
  });

  it('should pass through parsing options', () => {
    const result = getPrivateEnv({ 
      autoGroup: false,
      camelCase: false,
      parseValues: false 
    });
    
    expect(result).toEqual({
      database_host: 'localhost',
      database_port: '5432',
      database_name: 'myapp',
      database_user: 'admin',
      redis_url: 'redis://localhost:6379',
      redis_ttl: '3600',
      jwt_secret: 'super-secret-key',
      jwt_expires_in: '24h',
      single_secret: 'secret-value',
      api_rate_limit: '1000'
    });
  });

  it('should automatically group all prefixes', () => {
    const result = getPrivateEnv();
    
    expect(result).toEqual({
      database: {
        host: 'localhost',
        port: 5432,
        name: 'myapp',
        user: 'admin'
      },
      redis: {
        url: 'redis://localhost:6379',
        ttl: 3600
      },
      jwt: {
        secret: 'super-secret-key',
        expiresIn: '24h'
      },
      api: {
        rateLimit: 1000
      },
      single: {
        secret: 'secret-value'
      }
    });
  });

  it('should group all variables with prefixes automatically', () => {
    const result = getPrivateEnv();
    
    expect(result).toEqual({
      database: {
        host: 'localhost',
        port: 5432,
        name: 'myapp',
        user: 'admin'
      },
      redis: {
        url: 'redis://localhost:6379',
        ttl: 3600
      },
      jwt: {
        secret: 'super-secret-key',
        expiresIn: '24h'
      },
      single: {
        secret: 'secret-value'
      },
      api: {
        rateLimit: 1000
      }
    });
  });
});

describe('getPrivateEnvByPrefix', () => {
  it('should get private environment variables by prefix', () => {
    const result = getPrivateEnvByPrefix('DATABASE');
    
    expect(result).toEqual({
      host: 'localhost',
      port: 5432,
      name: 'myapp',
      user: 'admin'
    });
  });

  it('should handle prefix with underscore', () => {
    const result = getPrivateEnvByPrefix('DATABASE_');
    
    expect(result).toEqual({
      host: 'localhost',
      port: 5432,
      name: 'myapp',
      user: 'admin'
    });
  });

  it('should get JWT configuration by prefix', () => {
    const result = getPrivateEnvByPrefix('JWT');
    
    expect(result).toEqual({
      secret: 'super-secret-key',
      expiresIn: '24h'
    });
  });

  it('should pass through parsing options', () => {
    const result = getPrivateEnvByPrefix('DATABASE', { 
      camelCase: false,
      parseValues: false 
    });
    
    expect(result).toEqual({
      host: 'localhost',
      port: '5432',
      name: 'myapp',
      user: 'admin'
    });
  });

  it('should return empty object for non-existent prefix', () => {
    const result = getPrivateEnvByPrefix('NONEXISTENT');
    
    expect(result).toEqual({});
  });

  it('should handle Redis configuration', () => {
    const result = getPrivateEnvByPrefix('REDIS');
    
    expect(result).toEqual({
      url: 'redis://localhost:6379',
      ttl: 3600
    });
  });
});

describe('getRawPrivateEnv', () => {
  it('should return raw private environment variables', () => {
    const result = getRawPrivateEnv();
    
    expect(result).toEqual({
      'DATABASE_HOST': 'localhost',
      'DATABASE_PORT': '5432',
      'DATABASE_NAME': 'myapp',
      'DATABASE_USER': 'admin',
      'REDIS_URL': 'redis://localhost:6379',
      'REDIS_TTL': '3600',
      'JWT_SECRET': 'super-secret-key',
      'JWT_EXPIRES_IN': '24h',
      'SINGLE_SECRET': 'secret-value',
      'API_RATE_LIMIT': '1000'
    });
  });

  it('should return a copy of the environment object', () => {
    const result1 = getRawPrivateEnv();
    const result2 = getRawPrivateEnv();
    
    expect(result1).toEqual(result2);
    expect(result1).not.toBe(result2);
  });
});