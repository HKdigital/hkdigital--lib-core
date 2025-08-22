import { describe, it, expect, vi, beforeEach } from 'vitest';

import { getAllEnv, getAllEnvByPrefix, getRawAllEnv } from './all.js';

// Mock the public and private environment modules
vi.mock('./public.js', () => ({
  getPublicEnv: vi.fn(),
  getRawPublicEnv: vi.fn()
}));

vi.mock('./private.js', () => ({
  getPrivateEnv: vi.fn(),
  getRawPrivateEnv: vi.fn()
}));

vi.mock('./parsers.js', () => ({
  autoGroupEnvByPrefix: vi.fn()
}));

// Import the mocked functions
import { getPublicEnv, getRawPublicEnv } from './public.js';
import { getPrivateEnv, getRawPrivateEnv } from './private.js';
import { autoGroupEnvByPrefix } from './parsers.js';

describe('getAllEnv', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should combine public and private env with auto grouping', () => {
    const mockRawPublic = {
      'PUBLIC_API_URL': 'https://api.example.com',
      'PUBLIC_API_TIMEOUT': '5000'
    };
    
    const mockRawPrivate = {
      'DATABASE_HOST': 'localhost',
      'DATABASE_PORT': '5432',
      'PUBLIC_API_URL': 'https://private-api.example.com' // Should override
    };

    const mockGroupedResult = {
      publicApi: { url: 'https://private-api.example.com', timeout: 5000 },
      database: { host: 'localhost', port: 5432 }
    };

    getRawPublicEnv.mockReturnValue(mockRawPublic);
    getRawPrivateEnv.mockReturnValue(mockRawPrivate);
    autoGroupEnvByPrefix.mockReturnValue(mockGroupedResult);

    const result = getAllEnv();

    expect(getRawPublicEnv).toHaveBeenCalledOnce();
    expect(getRawPrivateEnv).toHaveBeenCalledOnce();
    expect(autoGroupEnvByPrefix).toHaveBeenCalledWith({
      'PUBLIC_API_URL': 'https://private-api.example.com', // Private overrides
      'PUBLIC_API_TIMEOUT': '5000',
      'DATABASE_HOST': 'localhost',
      'DATABASE_PORT': '5432'
    }, {});
    expect(result).toEqual(mockGroupedResult);
  });

  it('should disable auto grouping when specified', () => {
    const mockPublicParsed = {
      publicApiUrl: 'https://api.example.com',
      publicApiTimeout: 5000
    };
    
    const mockPrivateParsed = {
      databaseHost: 'localhost',
      databasePort: 5432,
      publicApiUrl: 'https://private-api.example.com' // Should override
    };

    getPublicEnv.mockReturnValue(mockPublicParsed);
    getPrivateEnv.mockReturnValue(mockPrivateParsed);

    const result = getAllEnv({ autoGroup: false });

    expect(getPublicEnv).toHaveBeenCalledWith({ autoGroup: false });
    expect(getPrivateEnv).toHaveBeenCalledWith({ autoGroup: false });
    expect(autoGroupEnvByPrefix).not.toHaveBeenCalled();
    
    expect(result).toEqual({
      publicApiUrl: 'https://private-api.example.com', // Private overrides
      publicApiTimeout: 5000,
      databaseHost: 'localhost',
      databasePort: 5432
    });
  });

  it('should pass through parsing options to autoGroupEnvByPrefix', () => {
    const options = {
      camelCase: false,
      parseValues: false
    };

    getRawPublicEnv.mockReturnValue({});
    getRawPrivateEnv.mockReturnValue({});
    autoGroupEnvByPrefix.mockReturnValue({});

    getAllEnv(options);

    expect(autoGroupEnvByPrefix).toHaveBeenCalledWith({}, {
      camelCase: false,
      parseValues: false
    });
  });

  it('should pass through parsing options when auto grouping disabled', () => {
    const options = {
      autoGroup: false,
      camelCase: false,
      parseValues: false
    };

    getPublicEnv.mockReturnValue({});
    getPrivateEnv.mockReturnValue({});

    getAllEnv(options);

    expect(getPublicEnv).toHaveBeenCalledWith({
      autoGroup: false,
      camelCase: false,
      parseValues: false
    });
    expect(getPrivateEnv).toHaveBeenCalledWith({
      autoGroup: false,
      camelCase: false,
      parseValues: false
    });
  });

  it('should handle empty environments', () => {
    getRawPublicEnv.mockReturnValue({});
    getRawPrivateEnv.mockReturnValue({});
    autoGroupEnvByPrefix.mockReturnValue({});

    const result = getAllEnv();

    expect(result).toEqual({});
    expect(autoGroupEnvByPrefix).toHaveBeenCalledWith({}, {});
  });
});

describe('getAllEnvByPrefix', () => {
  it('should add underscore to prefix if not present', () => {
    const mockCombined = {
      'DATABASE_HOST': 'localhost',
      'DATABASE_PORT': '5432'
    };
    
    getRawPublicEnv.mockReturnValue({});
    getRawPrivateEnv.mockReturnValue(mockCombined);
    autoGroupEnvByPrefix.mockReturnValue({
      host: 'localhost',
      port: 5432
    });

    const result = getAllEnvByPrefix('DATABASE');

    expect(autoGroupEnvByPrefix).toHaveBeenCalledWith(mockCombined, {
      prefix: 'DATABASE_',
      removePrefix: true
    });
  });

  it('should not add extra underscore if prefix already has one', () => {
    const mockCombined = {
      'API_KEY': 'secret',
      'API_URL': 'https://api.example.com'
    };
    
    getRawPublicEnv.mockReturnValue({});
    getRawPrivateEnv.mockReturnValue(mockCombined);
    autoGroupEnvByPrefix.mockReturnValue({
      key: 'secret',
      url: 'https://api.example.com'
    });

    const result = getAllEnvByPrefix('API_');

    expect(autoGroupEnvByPrefix).toHaveBeenCalledWith(mockCombined, {
      prefix: 'API_',
      removePrefix: true
    });
  });
});

describe('getRawAllEnv', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should combine raw public and private environment variables', () => {
    const mockRawPublic = {
      'PUBLIC_API_URL': 'https://api.example.com',
      'PUBLIC_API_TIMEOUT': '5000'
    };
    
    const mockRawPrivate = {
      'DATABASE_HOST': 'localhost',
      'DATABASE_PORT': '5432',
      'PUBLIC_API_URL': 'https://private-api.example.com' // Should override
    };

    getRawPublicEnv.mockReturnValue(mockRawPublic);
    getRawPrivateEnv.mockReturnValue(mockRawPrivate);

    const result = getRawAllEnv();

    expect(getRawPublicEnv).toHaveBeenCalledOnce();
    expect(getRawPrivateEnv).toHaveBeenCalledOnce();
    
    expect(result).toEqual({
      'PUBLIC_API_URL': 'https://private-api.example.com', // Private overrides
      'PUBLIC_API_TIMEOUT': '5000',
      'DATABASE_HOST': 'localhost',
      'DATABASE_PORT': '5432'
    });
  });

  it('should handle empty public environment', () => {
    getRawPublicEnv.mockReturnValue({});
    getRawPrivateEnv.mockReturnValue({
      'DATABASE_HOST': 'localhost'
    });

    const result = getRawAllEnv();

    expect(result).toEqual({
      'DATABASE_HOST': 'localhost'
    });
  });

  it('should handle empty private environment', () => {
    getRawPublicEnv.mockReturnValue({
      'PUBLIC_API_URL': 'https://api.example.com'
    });
    getRawPrivateEnv.mockReturnValue({});

    const result = getRawAllEnv();

    expect(result).toEqual({
      'PUBLIC_API_URL': 'https://api.example.com'
    });
  });

  it('should handle both environments empty', () => {
    getRawPublicEnv.mockReturnValue({});
    getRawPrivateEnv.mockReturnValue({});

    const result = getRawAllEnv();

    expect(result).toEqual({});
  });

  it('should demonstrate private variables taking precedence', () => {
    const mockRawPublic = {
      'SHARED_VAR': 'public-value',
      'PUBLIC_ONLY': 'public-only-value'
    };
    
    const mockRawPrivate = {
      'SHARED_VAR': 'private-value',
      'PRIVATE_ONLY': 'private-only-value'
    };

    getRawPublicEnv.mockReturnValue(mockRawPublic);
    getRawPrivateEnv.mockReturnValue(mockRawPrivate);

    const result = getRawAllEnv();

    expect(result).toEqual({
      'SHARED_VAR': 'private-value', // Private wins
      'PUBLIC_ONLY': 'public-only-value',
      'PRIVATE_ONLY': 'private-only-value'
    });
  });
});