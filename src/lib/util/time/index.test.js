import { describe, it, expect } from 'vitest';

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

describe('delay', () => {
	it('should be a function', () => {
		expect(typeof delay).toBe('function');
	});
});

describe('sinceMs', () => {
	it('should be a function', () => {
		expect(typeof sinceMs).toBe('function');
	});
});

describe('timeToString', () => {
	it('should be a function', () => {
		expect(typeof timeToString).toBe('function');
	});
});

describe('toDate', () => {
	it('should be a function', () => {
		expect(typeof toDate).toBe('function');
	});
});

describe('getWeekNumber', () => {
	it('should be a function', () => {
		expect(typeof getWeekNumber).toBe('function');
	});
});

describe('getMonthName', () => {
	it('should be a function', () => {
		expect(typeof getMonthName).toBe('function');
	});
});

describe('getDayName', () => {
	it('should be a function', () => {
		expect(typeof getDayName).toBe('function');
	});
});

describe('getTimeAtStartOfDay', () => {
	it('should be a function', () => {
		expect(typeof getTimeAtStartOfDay).toBe('function');
	});
});

describe('getTimeAtEndOfDay', () => {
	it('should be a function', () => {
		expect(typeof getTimeAtEndOfDay).toBe('function');
	});
});
