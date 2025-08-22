import { describe, it, expect } from 'vitest';

import {
  parseEnv,
  parseEnvByPrefix,
  toCamelCase,
  parseValue,
  autoGroupEnvByPrefix,
  groupEnvByPrefixes,
  filterEnvByPattern
} from './parsers.js';

describe('parseEnv', () => {
  it('should parse environment variables with default options', () => {
    const env = {
      'DATABASE_HOST': 'localhost',
      'DATABASE_PORT': '5432',
      'ENABLE_FEATURE': 'true'
    };
    
    const result = parseEnv(env);
    
    expect(result).toEqual({
      databaseHost: 'localhost',
      databasePort: 5432,
      enableFeature: true
    });
  });

  it('should filter by prefix and remove prefix', () => {
    const env = {
      'DATABASE_HOST': 'localhost',
      'DATABASE_PORT': '5432',
      'REDIS_URL': 'redis://localhost'
    };
    
    const result = parseEnv(env, { prefix: 'DATABASE_' });
    
    expect(result).toEqual({
      host: 'localhost',
      port: 5432
    });
  });

  it('should keep prefix when removePrefix is false', () => {
    const env = {
      'DATABASE_HOST': 'localhost',
      'DATABASE_PORT': '5432'
    };
    
    const result = parseEnv(env, { 
      prefix: 'DATABASE_', 
      removePrefix: false 
    });
    
    expect(result).toEqual({
      databaseHost: 'localhost',
      databasePort: 5432
    });
  });

  it('should disable camelCase conversion', () => {
    const env = {
      'DATABASE_HOST': 'localhost',
      'DATABASE_PORT': '5432'
    };
    
    const result = parseEnv(env, { camelCase: false });
    
    expect(result).toEqual({
      database_host: 'localhost',
      database_port: 5432
    });
  });

  it('should disable value parsing', () => {
    const env = {
      'DATABASE_PORT': '5432',
      'ENABLE_FEATURE': 'true'
    };
    
    const result = parseEnv(env, { parseValues: false });
    
    expect(result).toEqual({
      databasePort: '5432',
      enableFeature: 'true'
    });
  });

  it('should handle empty or null env', () => {
    expect(parseEnv(null)).toEqual({});
    expect(parseEnv(undefined)).toEqual({});
    expect(parseEnv({})).toEqual({});
  });
});

describe('parseEnvByPrefix', () => {
  it('should parse environment variables by prefix', () => {
    const env = {
      'DATABASE_HOST': 'localhost',
      'DATABASE_PORT': '5432',
      'REDIS_URL': 'redis://localhost'
    };
    
    const result = parseEnvByPrefix(env, 'DATABASE');
    
    expect(result).toEqual({
      host: 'localhost',
      port: 5432
    });
  });

  it('should handle prefix with underscore', () => {
    const env = {
      'DATABASE_HOST': 'localhost',
      'DATABASE_PORT': '5432'
    };
    
    const result = parseEnvByPrefix(env, 'DATABASE_');
    
    expect(result).toEqual({
      host: 'localhost',
      port: 5432
    });
  });

  it('should pass through options', () => {
    const env = {
      'DATABASE_HOST': 'localhost',
      'DATABASE_PORT': '5432'
    };
    
    const result = parseEnvByPrefix(env, 'DATABASE', { camelCase: false });
    
    expect(result).toEqual({
      host: 'localhost',
      port: 5432
    });
  });
});

describe('toCamelCase', () => {
  it('should convert SCREAMING_SNAKE_CASE to camelCase', () => {
    expect(toCamelCase('DATABASE_HOST')).toBe('databaseHost');
    expect(toCamelCase('API_BASE_URL')).toBe('apiBaseUrl');
    expect(toCamelCase('SINGLE')).toBe('single');
    expect(toCamelCase('A_B_C_D')).toBe('aBCD');
  });

  it('should handle empty string', () => {
    expect(toCamelCase('')).toBe('');
  });

  it('should handle single word', () => {
    expect(toCamelCase('HOST')).toBe('host');
  });

  it('should handle underscore at start or end', () => {
    expect(toCamelCase('_HOST')).toBe('Host');
    expect(toCamelCase('HOST_')).toBe('host');
    expect(toCamelCase('_HOST_')).toBe('Host');
  });
});

describe('parseValue', () => {
  it('should parse boolean values', () => {
    expect(parseValue('true')).toBe(true);
    expect(parseValue('false')).toBe(false);
  });

  it('should parse null and undefined', () => {
    expect(parseValue('null')).toBe(null);
    expect(parseValue('undefined')).toBe(undefined);
  });

  it('should parse numbers', () => {
    expect(parseValue('123')).toBe(123);
    expect(parseValue('0')).toBe(0);
    expect(parseValue('3.14')).toBe(3.14);
    expect(parseValue('-42')).toBe(-42);
  });

  it('should keep strings as strings', () => {
    expect(parseValue('hello')).toBe('hello');
    expect(parseValue('123abc')).toBe('123abc');
    expect(parseValue('true123')).toBe('true123');
  });

  it('should handle empty string', () => {
    expect(parseValue('')).toBe('');
  });

  it('should handle whitespace-only strings', () => {
    expect(parseValue('   ')).toBe('   ');
  });

  it('should parse numbers even with whitespace', () => {
    expect(parseValue(' 123 ')).toBe(123);
  });
});

describe('autoGroupEnvByPrefix', () => {
  it('should auto-group environment variables by all prefixes', () => {
    const env = {
      'DATABASE_HOST': 'localhost',
      'DATABASE_PORT': '5432',
      'DATABASE_NAME': 'myapp',
      'REDIS_HOST': 'cache',
      'REDIS_PORT': '6379',
      'SINGLE_VAR': 'value'
    };
    
    const result = autoGroupEnvByPrefix(env);
    
    expect(result).toEqual({
      database: {
        host: 'localhost',
        port: 5432,
        name: 'myapp'
      },
      redis: {
        host: 'cache',
        port: 6379
      },
      single: {
        var: 'value'    // Now grouped since it has underscore
      }
    });
  });

  it('should group all variables with prefixes, regardless of count', () => {
    const env = {
      'DATABASE_HOST': 'localhost',
      'DATABASE_PORT': '5432',
      'REDIS_URL': 'redis://localhost',    // Single REDIS variable
      'SINGLE_VAR': 'value'
    };
    
    const result = autoGroupEnvByPrefix(env);
    
    expect(result).toEqual({
      database: {
        host: 'localhost',
        port: 5432
      },
      redis: {
        url: 'redis://localhost'            // Still grouped despite being single
      },
      single: {
        var: 'value'                        // Also grouped since it has underscore
      }
    });
  });

  it('should handle mixed prefix and non-prefix variables', () => {
    const env = {
      'API_KEY': 'secret',
      'API_URL': 'https://api.example.com',
      'SINGLEVAR': 'value'
    };
    
    const result = autoGroupEnvByPrefix(env);
    
    expect(result).toEqual({
      api: {
        key: 'secret',
        url: 'https://api.example.com'
      },
      singlevar: 'value'
    });
  });

  it('should disable camelCase conversion', () => {
    const env = {
      'DATABASE_HOST': 'localhost',
      'DATABASE_PORT': '5432'
    };
    
    const result = autoGroupEnvByPrefix(env, { camelCase: false });
    
    expect(result).toEqual({
      database: {
        host: 'localhost',
        port: 5432
      }
    });
  });

  it('should disable value parsing', () => {
    const env = {
      'DATABASE_HOST': 'localhost',
      'DATABASE_PORT': '5432'
    };
    
    const result = autoGroupEnvByPrefix(env, { parseValues: false });
    
    expect(result).toEqual({
      database: {
        host: 'localhost',
        port: '5432'
      }
    });
  });

  it('should handle empty environment', () => {
    expect(autoGroupEnvByPrefix({})).toEqual({});
  });

  it('should handle single-word variables without underscore', () => {
    const env = {
      'HOST': 'localhost',
      'PORT': '3000'
    };
    
    const result = autoGroupEnvByPrefix(env);
    
    expect(result).toEqual({
      host: 'localhost',
      port: 3000
    });
  });
});

describe('groupEnvByPrefixes', () => {
  it('should group environment variables by specified prefixes', () => {
    const env = {
      'DATABASE_HOST': 'localhost',
      'DATABASE_PORT': '5432',
      'REDIS_HOST': 'cache',
      'REDIS_PORT': '6379',
      'JWT_SECRET': 'secret',
      'JWT_EXPIRES_IN': '24h'
    };
    
    const result = groupEnvByPrefixes(env, ['DATABASE', 'REDIS', 'JWT']);
    
    expect(result).toEqual({
      database: {
        host: 'localhost',
        port: 5432
      },
      redis: {
        host: 'cache',
        port: 6379
      },
      jwt: {
        secret: 'secret',
        expiresIn: '24h'
      }
    });
  });

  it('should handle missing prefixes gracefully', () => {
    const env = {
      'DATABASE_HOST': 'localhost',
      'DATABASE_PORT': '5432'
    };
    
    const result = groupEnvByPrefixes(env, ['DATABASE', 'MISSING']);
    
    expect(result).toEqual({
      database: {
        host: 'localhost',
        port: 5432
      },
      missing: {}
    });
  });

  it('should disable camelCase when specified', () => {
    const env = {
      'DATABASE_HOST': 'localhost'
    };
    
    const result = groupEnvByPrefixes(env, ['DATABASE'], { camelCase: false });
    
    expect(result).toEqual({
      database: {
        host: 'localhost'
      }
    });
  });
});

describe('filterEnvByPattern', () => {
  it('should filter environment variables by regex pattern', () => {
    const env = {
      'DATABASE_HOST': 'localhost',
      'DATABASE_PORT': '5432',
      'REDIS_URL': 'redis://localhost',
      'JWT_SECRET': 'secret'
    };
    
    const result = filterEnvByPattern(env, /^DATABASE_/);
    
    expect(result).toEqual({
      databaseHost: 'localhost',
      databasePort: 5432
    });
  });

  it('should filter environment variables by string pattern', () => {
    const env = {
      'API_KEY': 'secret',
      'API_URL': 'https://api.example.com',
      'DATABASE_HOST': 'localhost'
    };
    
    const result = filterEnvByPattern(env, '^API_');
    
    expect(result).toEqual({
      apiKey: 'secret',
      apiUrl: 'https://api.example.com'
    });
  });

  it('should pass through parsing options', () => {
    const env = {
      'API_KEY': 'secret',
      'API_TIMEOUT': '5000'
    };
    
    const result = filterEnvByPattern(env, /^API_/, { 
      camelCase: false,
      parseValues: false
    });
    
    expect(result).toEqual({
      api_key: 'secret',
      api_timeout: '5000'
    });
  });

  it('should handle empty matches', () => {
    const env = {
      'DATABASE_HOST': 'localhost'
    };
    
    const result = filterEnvByPattern(env, /^REDIS_/);
    
    expect(result).toEqual({});
  });

  it('should handle null or undefined env', () => {
    expect(filterEnvByPattern(null, /pattern/)).toEqual({});
    expect(filterEnvByPattern(undefined, /pattern/)).toEqual({});
  });
});