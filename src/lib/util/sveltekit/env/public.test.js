import { describe, it, expect, vi, beforeEach } from 'vitest';

import { getPublicEnv, getPublicEnvByPrefix, getRawPublicEnv } from './public.js';

// Mock the SvelteKit environment
vi.mock('$env/dynamic/public', () => ({
  env: {
    'PUBLIC_API_URL': 'https://api.example.com',
    'PUBLIC_API_TIMEOUT': '5000',
    'PUBLIC_API_KEY': 'public-key',
    'PUBLIC_FEATURE_FLAGS': 'true',
    'PUBLIC_DEBUG': 'false',
    'PUBLIC_SINGLE_VAR': 'value'
  }
}));

describe('getPublicEnv', () => {
  it('should get all public environment variables with auto grouping', () => {
    const result = getPublicEnv();
    
    expect(result).toEqual({
      public: {
        apiUrl: 'https://api.example.com',
        apiTimeout: 5000,
        apiKey: 'public-key',
        featureFlags: true,
        debug: false,
        singleVar: 'value'
      }
    });
  });

  it('should disable auto grouping when specified', () => {
    const result = getPublicEnv({ autoGroup: false });
    
    expect(result).toEqual({
      publicApiUrl: 'https://api.example.com',
      publicApiTimeout: 5000,
      publicApiKey: 'public-key',
      publicFeatureFlags: true,
      publicDebug: false,
      publicSingleVar: 'value'
    });
  });

  it('should pass through parsing options', () => {
    const result = getPublicEnv({ 
      autoGroup: false,
      camelCase: false,
      parseValues: false 
    });
    
    expect(result).toEqual({
      public_api_url: 'https://api.example.com',
      public_api_timeout: '5000',
      public_api_key: 'public-key',
      public_feature_flags: 'true',
      public_debug: 'false',
      public_single_var: 'value'
    });
  });

  it('should handle custom commonPrefixes with auto grouping', () => {
    const result = getPublicEnv({ 
      commonPrefixes: ['PUBLIC_FEATURE'],
      minGroupSize: 1 
    });
    
    // All PUBLIC_ variables get grouped together, including PUBLIC_FEATURE_FLAGS
    expect(result).toEqual({
      public: {
        apiUrl: 'https://api.example.com',
        apiTimeout: 5000,
        apiKey: 'public-key',
        debug: false,
        singleVar: 'value',
        featureFlags: true
      }
    });
  });

  it('should respect minGroupSize option', () => {
    const result = getPublicEnv({ minGroupSize: 7 });
    
    expect(result).toEqual({
      publicApiUrl: 'https://api.example.com',
      publicApiTimeout: 5000,
      publicApiKey: 'public-key',
      publicFeatureFlags: true,
      publicDebug: false,
      publicSingleVar: 'value'
    });
  });
});

describe('getPublicEnvByPrefix', () => {
  it('should get public environment variables by prefix', () => {
    const result = getPublicEnvByPrefix('PUBLIC_API');
    
    expect(result).toEqual({
      url: 'https://api.example.com',
      timeout: 5000,
      key: 'public-key'
    });
  });

  it('should handle prefix with underscore', () => {
    const result = getPublicEnvByPrefix('PUBLIC_API_');
    
    expect(result).toEqual({
      url: 'https://api.example.com',
      timeout: 5000,
      key: 'public-key'
    });
  });

  it('should pass through parsing options', () => {
    const result = getPublicEnvByPrefix('PUBLIC_API', { 
      camelCase: false,
      parseValues: false 
    });
    
    expect(result).toEqual({
      url: 'https://api.example.com',
      timeout: '5000',
      key: 'public-key'
    });
  });

  it('should return empty object for non-existent prefix', () => {
    const result = getPublicEnvByPrefix('NONEXISTENT');
    
    expect(result).toEqual({});
  });

  it('should handle single variable prefix', () => {
    const result = getPublicEnvByPrefix('PUBLIC_DEBUG');
    
    expect(result).toEqual({});
  });
});

describe('getRawPublicEnv', () => {
  it('should return raw public environment variables', () => {
    const result = getRawPublicEnv();
    
    expect(result).toEqual({
      'PUBLIC_API_URL': 'https://api.example.com',
      'PUBLIC_API_TIMEOUT': '5000',
      'PUBLIC_API_KEY': 'public-key',
      'PUBLIC_FEATURE_FLAGS': 'true',
      'PUBLIC_DEBUG': 'false',
      'PUBLIC_SINGLE_VAR': 'value'
    });
  });

  it('should return a copy of the environment object', () => {
    const result1 = getRawPublicEnv();
    const result2 = getRawPublicEnv();
    
    expect(result1).toEqual(result2);
    expect(result1).not.toBe(result2);
  });
});