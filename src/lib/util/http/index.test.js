import { describe, it, expect } from 'vitest';

import {
	getErrorFromResponse,
	setRequestHeaders,
	expectResponseOk,
	getResponseSize,
	waitForAndCheckResponse,
	loadResponseBuffer,
	toURL,
	hasProtocol,
	href,
	httpGet,
	httpPost,
	jsonGet,
	jsonPost
} from './index.js';

describe('getErrorFromResponse', () => {
	it('should be a function', () => {
		expect(typeof getErrorFromResponse).toBe('function');
	});
});

describe('setRequestHeaders', () => {
	it('should be a function', () => {
		expect(typeof setRequestHeaders).toBe('function');
	});
});

describe('expectResponseOk', () => {
	it('should be a function', () => {
		expect(typeof expectResponseOk).toBe('function');
	});
});

describe('getResponseSize', () => {
	it('should be a function', () => {
		expect(typeof getResponseSize).toBe('function');
	});
});

describe('waitForAndCheckResponse', () => {
	it('should be a function', () => {
		expect(typeof waitForAndCheckResponse).toBe('function');
	});
});

describe('loadResponseBuffer', () => {
	it('should be a function', () => {
		expect(typeof loadResponseBuffer).toBe('function');
	});
});

describe('toURL', () => {
	it('should be a function', () => {
		expect(typeof toURL).toBe('function');
	});
});

describe('hasProtocol', () => {
	it('should be a function', () => {
		expect(typeof hasProtocol).toBe('function');
	});
});

describe('href', () => {
	it('should be a function', () => {
		expect(typeof href).toBe('function');
	});
});

describe('httpGet', () => {
	it('should be a function', () => {
		expect(typeof httpGet).toBe('function');
	});
});

describe('httpPost', () => {
	it('should be a function', () => {
		expect(typeof httpPost).toBe('function');
	});
});

describe('jsonGet', () => {
	it('should be a function', () => {
		expect(typeof jsonGet).toBe('function');
	});
});

describe('jsonPost', () => {
	it('should be a function', () => {
		expect(typeof jsonPost).toBe('function');
	});
});
