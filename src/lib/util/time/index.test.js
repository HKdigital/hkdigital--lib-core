import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  SECOND_MS,
  MINUTE_MS,
  HOUR_MS,
  DAY_MS,
  TIME_2025_01_01
} from '$lib/constants/time.js';

import {
  delay,
  sinceMs,
  timeToString,
  toDate,
  getWeekNumber,
  getMonthName,
  getDayName,
  getTimeAtStartOfDay,
  getTimeAtEndOfDay
} from './index.js';

/**
 * Helper function to freeze time for testing time-dependent functions
 * @param {number} timestamp - The timestamp to freeze time at
 *
 * @returns {() => void} Function to restore original Date behavior
 */
function mockDate(timestamp) {
  const originalDate = global.Date;

  const mockDateImplementation = class extends Date {
    constructor(...args) {
      if (args.length === 0) {
        super(timestamp);
        return;
      }
      // @ts-ignore - Rest parameters typing issue
      super(...args);
    }
    static now() {
      return timestamp;
    }
  };

  // @ts-ignore
  global.Date = mockDateImplementation;

  return () => {
    global.Date = originalDate;
  };
}

describe('delay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be a function', () => {
    expect(typeof delay).toBe('function');
  });

  it('should resolve after specified delay', async () => {
    const delayMs = 1000;
    const promise = delay(delayMs);

    expect(vi.getTimerCount()).toBe(1);

    vi.advanceTimersByTime(delayMs - 1);
    let resolved = false;
    promise.then(() => { resolved = true; });

    await Promise.resolve(); // Allow microtasks to execute
    expect(resolved).toBe(false);

    vi.advanceTimersByTime(1);
    await Promise.resolve(); // Allow microtasks to execute
    expect(resolved).toBe(true);
  });

  it('should pick random delay when min and max are provided', async () => {
    const minDelay = 1000;
    const maxDelay = 2000;
    const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const promise = delay(minDelay, maxDelay);

    // With Math.random() = 0.5, we expect delay to be 1500ms
    const expectedDelay = minDelay + 0.5 * (maxDelay - minDelay);

    vi.advanceTimersByTime(expectedDelay - 1);
    let resolved = false;
    promise.then(() => { resolved = true; });

    await Promise.resolve();
    expect(resolved).toBe(false);

    vi.advanceTimersByTime(1);
    await Promise.resolve();
    expect(resolved).toBe(true);

    mockRandom.mockRestore();
  });

  it('should cancel timer when promise is rejected', async () => {
    const delayMs = 1000;
    const promise = delay(delayMs);

    expect(vi.getTimerCount()).toBe(1);

    // Reject the promise
    promise.reject(new Error('Cancelled'));

    // We need to allow time for the catch handler to execute
    await Promise.resolve();
    await Promise.resolve();

    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('sinceMs', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be a function', () => {
    expect(typeof sinceMs).toBe('function');
  });

  it('should return ms since the specified time', () => {
    const now = 1735689600000; // Example timestamp
    const restore = mockDate(now);

    const reference = now - 10000; // 10 seconds earlier

    expect(sinceMs(reference)).toBe(10000);

    restore();
  });

  it('should use TIME_2025_01_01 as default', () => {
    const now = TIME_2025_01_01 + 86400000; // 1 day after default time
    const restore = mockDate(now);

    expect(sinceMs()).toBe(86400000);

    restore();
  });
});

describe('timeToString', () => {
  it('should be a function', () => {
    expect(typeof timeToString).toBe('function');
  });

  it('should format milliseconds correctly for seconds', () => {
    expect(timeToString(3500)).toBe('00:03.500');
  });

  it('should format milliseconds correctly for minutes and seconds', () => {
    expect(timeToString(65000)).toBe('01:05.000');
  });

  it('should format milliseconds correctly for hours, minutes and seconds', () => {
    expect(timeToString(3665000)).toBe('01:01:05.000');
  });

  it('should format milliseconds correctly for days, hours, minutes and seconds', () => {
    expect(timeToString(90000000)).toBe('01:01:00:00.000');
  });

  it('should pad numbers correctly', () => {
    expect(timeToString(3661001)).toBe('01:01:01.001');
  });
});

describe('toDate', () => {
  it('should be a function', () => {
    expect(typeof toDate).toBe('function');
  });

  it('should return the same Date object if input is a Date', () => {
    const dateObj = new Date('2025-01-01');
    const result = toDate(dateObj);

    expect(result).toBe(dateObj);
  });

  it('should convert timestamp to Date object', () => {
    const timestamp = 1735689600000; // January 1, 2025 UTC
    const result = toDate(timestamp);

    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(timestamp);
  });

  it('should throw error for invalid input', () => {
    // @ts-ignore
    expect(() => toDate()).toThrow('Missing or invalid parameter [dateOrTimestamp]');

    // @ts-ignore
    expect(() => toDate('2025-01-01')).toThrow('Missing or invalid parameter [dateOrTimestamp]');
    expect(() => toDate(null)).toThrow('Missing or invalid parameter [dateOrTimestamp]');
  });
});

describe('getWeekNumber', () => {
  it('should be a function', () => {
    expect(typeof getWeekNumber).toBe('function');
  });

  it('should return correct ISO week number for known dates', () => {
    // January 1, 2025 is a Wednesday, belongs to week 1
    expect(getWeekNumber(new Date('2025-01-01'))).toBe(1);

    // January 5, 2025 is a Sunday, belongs to week 1
    expect(getWeekNumber(new Date('2025-01-05'))).toBe(1);

    // January 6, 2025 is a Monday, belongs to week 2
    expect(getWeekNumber(new Date('2025-01-06'))).toBe(2);

    // December 29, 2024 is a Sunday, belongs to week 52
    expect(getWeekNumber(new Date('2024-12-29'))).toBe(52);

    // December 30, 2024 is a Monday, belongs to week 1 of 2025
    expect(getWeekNumber(new Date('2024-12-30'))).toBe(1);
  });

  it('should handle timestamps as input', () => {
    const timestamp = new Date('2025-01-01').getTime();
    expect(getWeekNumber(timestamp)).toBe(1);
  });
});

describe('getMonthName', () => {
  it('should be a function', () => {
    expect(typeof getMonthName).toBe('function');
  });

  it('should return correct month name in Dutch by default', () => {
    // Januari
    expect(getMonthName(new Date(2025, 0, 15))).toBe('januari');

    // Juli
    expect(getMonthName(new Date(2025, 6, 15))).toBe('juli');

    // December
    expect(getMonthName(new Date(2025, 11, 15))).toBe('december');
  });

  it('should support English locale when specified', () => {
    // January
    expect(getMonthName(new Date(2025, 0, 15), 'en-US')).toBe('January');

    // July
    expect(getMonthName(new Date(2025, 6, 15), 'en-US')).toBe('July');
  });

  it('should accept timestamps as input', () => {
    const date = new Date(2025, 3, 15); // April
    expect(getMonthName(date.getTime())).toBe('april');
  });

  it('should support different locales', () => {
    const date = new Date(2025, 0, 15); // January

    expect(getMonthName(date, 'nl-NL')).toBe('januari');
    expect(getMonthName(date, 'es-ES')).toBe('enero');
    expect(getMonthName(date, 'fr-FR')).toBe('janvier');
  });

  it('should support different month format options', () => {
    const date = new Date(2025, 0, 15); // January

    expect(getMonthName(date, 'nl-NL', { month: 'short' })).toBe('jan');
    expect(getMonthName(date, 'nl-NL', { month: 'narrow' })).toBe('J');
    expect(getMonthName(date, 'nl-NL', { month: 'numeric' })).toBe('1');
    expect(getMonthName(date, 'nl-NL', { month: '2-digit' })).toBe('01');
  });
});

describe('getDayName', () => {
  it('should be a function', () => {
    expect(typeof getDayName).toBe('function');
  });

  it('should return correct day name in Dutch by default', () => {
    // Woensdag (January 15, 2025 is a Wednesday)
    expect(getDayName(new Date(2025, 0, 15))).toBe('woensdag');

    // Zondag
    expect(getDayName(new Date(2025, 0, 19))).toBe('zondag');

    // Maandag
    expect(getDayName(new Date(2025, 0, 20))).toBe('maandag');
  });

  it('should support English locale when specified', () => {
    // Wednesday
    expect(getDayName(new Date(2025, 0, 15), 'en-US')).toBe('Wednesday');

    // Sunday
    expect(getDayName(new Date(2025, 0, 19), 'en-US')).toBe('Sunday');
  });

  it('should accept timestamps as input', () => {
    const date = new Date(2025, 0, 15); // Wednesday
    expect(getDayName(date.getTime())).toBe('woensdag');
  });

  it('should support different locales', () => {
    const date = new Date(2025, 0, 15); // Wednesday

    expect(getDayName(date, 'nl-NL')).toBe('woensdag');
    expect(getDayName(date, 'es-ES')).toBe('miércoles');
    expect(getDayName(date, 'fr-FR')).toBe('mercredi');
  });

  it('should support different weekday format options', () => {
    const date = new Date(2025, 0, 15); // Wednesday

    expect(getDayName(date, 'nl-NL', { weekday: 'short' })).toBe('wo');
    expect(getDayName(date, 'nl-NL', { weekday: 'narrow' })).toBe('W');
  });
});

describe('getTimeAtStartOfDay', () => {
  it('should be a function', () => {
    expect(typeof getTimeAtStartOfDay).toBe('function');
  });

  it('should return timestamp at midnight for given date', () => {
    const date = new Date('2025-01-15T14:30:45.123');
    const result = getTimeAtStartOfDay(date);

    const expected = new Date('2025-01-15T00:00:00.000').getTime();
    expect(result).toBe(expected);
  });

  it('should handle timestamp input', () => {
    const timestamp = new Date('2025-01-15T14:30:45.123').getTime();
    const result = getTimeAtStartOfDay(timestamp);

    const expected = new Date('2025-01-15T00:00:00.000').getTime();
    expect(result).toBe(expected);
  });

  it('should use current date when no argument provided', () => {
    const now = new Date('2025-01-15T14:30:45.123');
    const restore = mockDate(now.getTime());

    const result = getTimeAtStartOfDay();

    const expected = new Date('2025-01-15T00:00:00.000').getTime();
    expect(result).toBe(expected);

    restore();
  });
});

describe('getTimeAtEndOfDay', () => {
  it('should be a function', () => {
    expect(typeof getTimeAtEndOfDay).toBe('function');
  });

  it('should return timestamp at 23:59:59.999 for given date', () => {
    const date = new Date('2025-01-15T14:30:45.123');
    const result = getTimeAtEndOfDay(date);

    const expected = new Date('2025-01-15T23:59:59.999').getTime();
    expect(result).toBe(expected);
  });

  it('should handle timestamp input', () => {
    const timestamp = new Date('2025-01-15T14:30:45.123').getTime();
    const result = getTimeAtEndOfDay(timestamp);

    const expected = new Date('2025-01-15T23:59:59.999').getTime();
    expect(result).toBe(expected);
  });

  it('should use current date when no argument provided', () => {
    const now = new Date('2025-01-15T14:30:45.123');
    const restore = mockDate(now.getTime());

    const result = getTimeAtEndOfDay();

    const expected = new Date('2025-01-15T23:59:59.999').getTime();
    expect(result).toBe(expected);

    restore();
  });
});
