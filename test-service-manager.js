import { createServerLogger } from './src/lib/logging/index.js';
import ServiceManager from './src/lib/services/service-manager/ServiceManager.js'
import ServiceBase from './src/lib/services/service-base/ServiceBase.js';

class ServiceOne extends ServiceBase {
  testMethod1() {
    this.logger.info('method1 executed');
  }
  testMethod2() {
    this.logger.debug('method2 executed');
  }
}

class ServiceTwo extends ServiceBase { // Fixed: was "extends Service"
  testMethod1() {
    this.logger.debug('method1 executed');
  }
  testMethod2() {
    this.logger.info('method2 executed');
  }
}

async function test() {
  const logger = createServerLogger('server-logger');
  const serviceManager = new ServiceManager({
    debug: true,
    defaultLogLevel: 'debug',
    serviceLogLevels: 'service-1:debug,service-2:info'
  });
  
  serviceManager.register('service-1', ServiceOne);
  serviceManager.register('service-2', ServiceTwo);
  
  serviceManager.onLogEvent((logEvent) => {
    // Fix: Use logEvent.source instead of logEvent.label
    console.log(`[${logEvent.level}] ${logEvent.source}: ${logEvent.message}`);
  });
  
  await serviceManager.startAll();
  
  const service1 = serviceManager.get('service-1');
  if (service1) {
    console.log('Service1 log level:', service1.logger.level); // Debug line
    service1.testMethod1();
    service1.testMethod2();
  } else console.log('service1 not registered');
  
  const service2 = serviceManager.get('service-2');
  if (service2) {
    console.log('Service2 log level:', service2.logger.level); // Debug line
    service2.testMethod1();
    service2.testMethod2();
  } else console.log('service2 not registered');
}

await test();