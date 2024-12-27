import { describe, it, expect } from 'vitest';

import * as expect_ from './index.js';

describe('expect.url', () => {
	it('should test if a value is an url', () => {
		// > Positive test

		expect_.url('http://localhost');
		expect_.url('https://hkdigital.nl');
		expect_.url('https://hkdigital.nl/path/to?query=1#hash');

		// > Negative test

		try {
			expect_.url(123);
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected string but received 123');
		}

		try {
			expect_.url('not-an-url');
		} catch (e) {
			expect(e.message).toEqual('Invalid URL: Received "not-an-url"');
		}

		try {
			expect_.url('  https://hkdigital.nl  ');
		} catch (e) {
			expect(e.message).toEqual('Should not start or end with whitespace');
		}
	});
});

describe('expect.urlOrEmptyString', () => {
	it('should test if a value is an url or an empty string', () => {
		// > Positive test

		expect_.urlOrEmptyString('http://localhost');
		expect_.urlOrEmptyString('https://hkdigital.nl');
		expect_.urlOrEmptyString('');

		// > Negative test

		try {
			expect_.urlOrEmptyString(123);
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected ("" | string) but received 123');
		}

		try {
			expect_.urlOrEmptyString('not-an-url');
		} catch (e) {
			expect(e.message).toEqual('Invalid URL: Received "not-an-url"');
		}

		try {
			expect_.urlOrEmptyString('  ');
		} catch (e) {
			expect(e.message).toEqual('Invalid URL: Received "  "');
		}

		try {
			expect_.urlOrEmptyString('  https://hkdigital.nl  ');
		} catch (e) {
			expect(e.message).toEqual('Should not start or end with whitespace');
		}
	});
});

describe('expect.urlPath', () => {
	it('should test if a value is an url path', () => {
		// > Positive test

		expect_.urlPath('/');
		expect_.urlPath('');
		expect_.urlPath('/path/to');
		expect_.urlPath('path/to');

		try {
			expect_.urlPath('  /');
		} catch (e) {
			expect(e.message).toEqual('Should not start or end with whitespace');
		}

		try {
			expect_.urlPath('/  ');
		} catch (e) {
			expect(e.message).toEqual('Should not start or end with whitespace');
		}

		try {
			expect_.urlPath('/path/to?query');
		} catch (e) {
			expect(e.message).toEqual('Value should not contain search path');
		}

		try {
			expect_.urlPath('/path/to#hash');
		} catch (e) {
			expect(e.message).toEqual('Value should not contain hash path');
		}
	});
});

describe('expect.relativeUrl', () => {
	it('should test if a value is a relative url', () => {
		// > Positive test

		expect_.relativeUrl('/');
		expect_.relativeUrl('');
		expect_.relativeUrl('/path/to?query');
		expect_.relativeUrl('path/to');
		expect_.relativeUrl('path/to?query#hash');

		// Weird but allowed as relative url...
		expect_.relativeUrl('https://hkdigital.nl');

		// > Negative test

		try {
			expect_.relativeUrl(123);
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected string but received 123');
		}

		try {
			expect_.relativeUrl('  /');
		} catch (e) {
			expect(e.message).toEqual('Should not start or end with whitespace');
		}

		try {
			expect_.relativeUrl('/  ');
		} catch (e) {
			expect(e.message).toEqual('Should not start or end with whitespace');
		}
	});
});

describe('expect.absOrRelUrl', () => {
	it('should test if a value is an absolute or relative url', () => {
		// > Positive test

		expect_.absOrRelUrl('/');
		expect_.absOrRelUrl('');
		expect_.absOrRelUrl('/path/to?query');
		expect_.absOrRelUrl('path/to');
		expect_.absOrRelUrl('path/to?query#hash');
		expect_.absOrRelUrl('/src/lib/assets/sounds/test/sine-wave-1khz.mp3');

		expect_.url('http://localhost');
		expect_.url('https://hkdigital.nl');
		expect_.url('https://hkdigital.nl/path/to?query=1#hash');

		// > Negative test

		try {
			expect_.absOrRelUrl(123);
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected string but received 123');
		}

		try {
			expect_.absOrRelUrl('  /');
		} catch (e) {
			expect(e.message).toEqual('Should not start or end with whitespace');
		}

		try {
			expect_.absOrRelUrl('/  ');
		} catch (e) {
			expect(e.message).toEqual('Should not start or end with whitespace');
		}
	});
});
