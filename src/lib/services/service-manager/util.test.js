/**
 * @fileoverview Unit tests for service-manager utilities
 */
import { describe, it, expect } from 'vitest';
import { DEBUG, INFO, WARN, ERROR } from '$lib/logging/common.js';
import {
  parseServiceLogLevels,
  expandLogLevels
} from './util.js';

describe('parseServiceLogLevels', () => {
  it('should parse valid service:level pairs', () => {
    const result = parseServiceLogLevels('auth:debug,database:info,cache:warn');
    
    expect(result).toEqual({
      auth: 'debug',
      database: 'info',
      cache: 'warn'
    });
  });

  it('should handle whitespace around entries', () => {
    const result = parseServiceLogLevels(' auth : debug , database : info ');
    
    expect(result).toEqual({
      auth: 'debug',
      database: 'info'
    });
  });

  it('should skip invalid entries', () => {
    const result = parseServiceLogLevels('auth:debug,invalid,cache:warn,');
    
    expect(result).toEqual({
      auth: 'debug',
      cache: 'warn'
    });
  });

  it('should return empty object for invalid input', () => {
    expect(parseServiceLogLevels('')).toEqual({});
    expect(parseServiceLogLevels(null)).toEqual({});
    expect(parseServiceLogLevels(undefined)).toEqual({});
    expect(parseServiceLogLevels(123)).toEqual({});
  });

  it('should handle single service', () => {
    const result = parseServiceLogLevels('auth:error');
    
    expect(result).toEqual({
      auth: 'error'
    });
  });
});

describe('expandLogLevels', () => {
  it('should expand debug level to include all levels', () => {
    const result = expandLogLevels({ auth: DEBUG });
    
    expect(result).toEqual({
      auth: [DEBUG, INFO, WARN, ERROR]
    });
  });

  it('should expand info level to include warn and error', () => {
    const result = expandLogLevels({ database: INFO });
    
    expect(result).toEqual({
      database: [INFO, WARN, ERROR]
    });
  });

  it('should expand warn level to include error', () => {
    const result = expandLogLevels({ cache: WARN });
    
    expect(result).toEqual({
      cache: [WARN, ERROR]
    });
  });

  it('should keep error level as is', () => {
    const result = expandLogLevels({ api: ERROR });
    
    expect(result).toEqual({
      api: [ERROR]
    });
  });

  it('should handle multiple services with different levels', () => {
    const result = expandLogLevels({
      auth: DEBUG,
      database: WARN,
      cache: ERROR
    });
    
    expect(result).toEqual({
      auth: [DEBUG, INFO, WARN, ERROR],
      database: [WARN, ERROR],
      cache: [ERROR]
    });
  });

  it('should handle unknown log levels', () => {
    const result = expandLogLevels({ service: 'custom' });
    
    expect(result).toEqual({
      service: ['custom']
    });
  });

  it('should handle empty input', () => {
    const result = expandLogLevels({});
    
    expect(result).toEqual({});
  });
});
