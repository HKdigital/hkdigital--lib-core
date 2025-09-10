/**
 * Test to debug ServiceManager log level handling
 */

import { describe, it, expect } from 'vitest';

import { createServerLogger } from '$lib/logging/index.js';
import { INFO } from '$lib/logging/levels.js';
import ServiceManager from './ServiceManager.js';
import ServiceBase from '../service-base/ServiceBase.js';

class ServiceOne extends ServiceBase {
  testMethod1() {
    this.logger.info('method1 executed');
  }
  testMethod2() {
    this.logger.debug('method2 executed');
  }
}

class ServiceTwo extends ServiceBase {
  testMethod1() {
    this.logger.debug('method1 executed');
  }
  testMethod2() {
    this.logger.info('method2 executed');
  }
}

describe('ServiceManager Log Level Debug', () => {
  it('should apply correct log levels to services', async () => {
    const logger = createServerLogger('test-logger', INFO);
    const serviceManager = new ServiceManager({
      debug: true,
      defaultLogLevel: 'debug',
      serviceLogLevels: 'service-1:debug,service-2:info'
    });
    
    serviceManager.register('service-1', ServiceOne);
    serviceManager.register('service-2', ServiceTwo);
    
    // Capture log events
    const logEvents = [];
    serviceManager.onLogEvent((logEvent) => {
      logEvents.push(logEvent);
      console.log(`[${logEvent.level}] ${logEvent.source}: ${logEvent.message}`);
    });
    
    await serviceManager.startAll();
    
    const service1 = serviceManager.get('service-1');
    const service2 = serviceManager.get('service-2');
    
    expect(service1).toBeDefined();
    expect(service2).toBeDefined();
    
    console.log('Service1 log level:', service1.logger.level);
    console.log('Service2 log level:', service2.logger.level);
    
    // Test the methods
    service1.testMethod1(); // info - should show
    service1.testMethod2(); // debug - should show (service-1 has debug level)
    
    service2.testMethod1(); // debug - should NOT show (service-2 has info level)
    service2.testMethod2(); // info - should show
    
    // Check that service1 has debug level and service2 has info level
    expect(service1.logger.level).toBe('debug');
    expect(service2.logger.level).toBe('info');
  });
});