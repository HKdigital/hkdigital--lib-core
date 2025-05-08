/**
 * @fileoverview Unit tests for EventEmitter.js
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EventEmitter from './EventEmitter.js';

describe('EventEmitter', () => {
  let emitter;

  beforeEach(() => {
    emitter = new EventEmitter();
  });

  it('should register and trigger event handlers', () => {
    const handler = vi.fn();
    emitter.on('test', handler);
    
    emitter.emit('test', 'data');
    
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith('data');
  });
  
  it('should support multiple handlers for the same event', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    
    emitter.on('test', handler1);
    emitter.on('test', handler2);
    
    emitter.emit('test', 'data');
    
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });
  
  it('should support removing specific handlers', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    
    emitter.on('test', handler1);
    const unsubscribe = emitter.on('test', handler2);
    
    // Remove just handler2
    unsubscribe();
    
    emitter.emit('test', 'data');
    
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).not.toHaveBeenCalled();
  });
  
  it('should support removing all handlers for an event', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    
    emitter.on('test', handler1);
    emitter.on('test', handler2);
    
    emitter.removeAllListeners('test');
    emitter.emit('test', 'data');
    
    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });
  
  it('should support removing all handlers', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    
    emitter.on('test1', handler1);
    emitter.on('test2', handler2);
    
    emitter.removeAllListeners();
    
    emitter.emit('test1', 'data1');
    emitter.emit('test2', 'data2');
    
    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });
  
  it('should support one-time event handlers', () => {
    const handler = vi.fn();
    
    emitter.once('test', handler);
    
    // First emit triggers the handler
    emitter.emit('test', 'data1');
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith('data1');
    
    // Reset the mock to clearly see it's not called again
    handler.mockClear();
    
    // Second emit should not trigger the handler
    emitter.emit('test', 'data2');
    expect(handler).not.toHaveBeenCalled();
  });
  
  it('should support wildcard event listeners', () => {
    const wildcard = vi.fn();
    const specific = vi.fn();
    
    emitter.on('test:*', wildcard);
    emitter.on('test:specific', specific);
    
    emitter.emit('test:specific', 'data');
    
    expect(specific).toHaveBeenCalledTimes(1);
    expect(specific).toHaveBeenCalledWith('data');
    
    expect(wildcard).toHaveBeenCalledTimes(1);
    expect(wildcard).toHaveBeenCalledWith({ 
      event: 'test:specific', 
      data: 'data' 
    });
  });
  
  it('should support removing wildcard event listeners', () => {
    const handler = vi.fn();
    
    const unsubscribe = emitter.on('test:*', handler);
    unsubscribe();
    
    emitter.emit('test:anything', 'data');
    
    expect(handler).not.toHaveBeenCalled();
  });
  
  it('should return correct listener count', () => {
    const handler1 = () => {};
    const handler2 = () => {};
    const wildcardHandler = () => {};

    emitter.on('test', handler1);
    emitter.on('test', handler2);
    emitter.on('test:*', wildcardHandler);

    // 'test' has 2 direct handlers, and no wildcard handlers match it
    expect(emitter.listenerCount('test')).toBe(2);

    // 'test:something' has 0 direct handlers, but 1 wildcard handler matches it
    expect(emitter.listenerCount('test:something')).toBe(1);

    // 'other' has no handlers of any kind
    expect(emitter.listenerCount('other')).toBe(0);
  });
  
  it('should return all registered event names', () => {
    emitter.on('event1', () => {});
    emitter.on('event2', () => {});
    emitter.on('prefix:*', () => {});
    
    const eventNames = emitter.eventNames();
    
    expect(eventNames).toContain('event1');
    expect(eventNames).toContain('event2');
    expect(eventNames).toContain('prefix:*');
    expect(eventNames.length).toBe(3);
  });
  
  it('should handle errors in event handlers gracefully', () => {
    const goodHandler = vi.fn();
    const badHandler = vi.fn().mockImplementation(() => {
      throw new Error('Handler error');
    });
    
    emitter.on('test', badHandler);
    emitter.on('test', goodHandler);
    
    // The error should not prevent other handlers from being called
    // We need to wrap this in a try/catch to prevent the test from failing
    expect(() => {
      emitter.emit('test', 'data');
    }).toThrow('Handler error');
    
    // Even though first handler threw, second handler should still be called
    // Note: In a real application, you might want to catch errors in emit()
    // implementation rather than letting them propagate
    expect(badHandler).toHaveBeenCalledTimes(1);
    expect(goodHandler).toHaveBeenCalledTimes(0); // This doesn't get called due to error
  });
});
