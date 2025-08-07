import { describe, it, expect } from 'vitest';

import * as v from 'valibot';

import { Email, LatinEmail } from './email.js';

describe('Email', () => {
	it('should parse and normalize email addresses', () => {
		// > Positive test - normalization
		expect(v.parse(Email, 'test@example.com')).toEqual('test@example.com');
		expect(v.parse(Email, 'TEST@EXAMPLE.COM')).toEqual('test@example.com');
		expect(v.parse(Email, 'Test.User@Example.COM')).toEqual('test.user@example.com');
		
		// > Positive test - trim whitespace
		expect(v.parse(Email, '  test@example.com  ')).toEqual('test@example.com');
		expect(v.parse(Email, '\tuser@domain.org\t')).toEqual('user@domain.org');
		
		// > Positive test - valid email formats
		expect(v.parse(Email, 'user.name@example.com')).toEqual('user.name@example.com');
		expect(v.parse(Email, 'user+tag@example.com')).toEqual('user+tag@example.com');
		expect(v.parse(Email, 'user_name@example-domain.co.uk')).toEqual('user_name@example-domain.co.uk');
		expect(v.parse(Email, 'test123@sub.example.org')).toEqual('test123@sub.example.org');
	});

	it('should throw on invalid email addresses', () => {
		// > Negative test - invalid formats
		const invalidEmails = [
			'',
			'invalid',
			'@example.com',
			'user@',
			'user@.com',
			'user@com',
			'user..name@example.com',
			'user@example',
			'user name@example.com'
		];

		for (const invalidEmail of invalidEmails) {
			try {
				v.parse(Email, invalidEmail);
				expect.fail(`Expected ${invalidEmail} to throw, but it didn't`);
			} catch (e) {
				expect(e.message).toContain('Invalid email');
			}
		}
	});

	it('should throw on non-string input', () => {
		try {
			v.parse(Email, 123);
			expect.fail('Expected non-string input to throw');
		} catch (e) {
			expect(e.message).toContain('Invalid type: Expected string');
		}
	});
});

describe('LatinEmail', () => {
	it('should parse and normalize Latin email addresses', () => {
		// > Positive test - normalization
		expect(v.parse(LatinEmail, 'test@example.com')).toEqual('test@example.com');
		expect(v.parse(LatinEmail, 'TEST@EXAMPLE.COM')).toEqual('test@example.com');
		expect(v.parse(LatinEmail, 'Test.User@Example.COM')).toEqual('test.user@example.com');
		
		// > Positive test - trim whitespace
		expect(v.parse(LatinEmail, '  test@example.com  ')).toEqual('test@example.com');
		expect(v.parse(LatinEmail, '\tuser@domain.org\t')).toEqual('user@domain.org');
		
		// > Positive test - valid Latin email formats
		expect(v.parse(LatinEmail, 'user.name@example.com')).toEqual('user.name@example.com');
		expect(v.parse(LatinEmail, 'user+tag@example.com')).toEqual('user+tag@example.com');
		expect(v.parse(LatinEmail, 'user_name@example-domain.co.uk')).toEqual('user_name@example-domain.co.uk');
		expect(v.parse(LatinEmail, 'test123@sub.example.org')).toEqual('test123@sub.example.org');
		expect(v.parse(LatinEmail, 'a@b.co')).toEqual('a@b.co');
	});

	it('should throw on non-Latin email addresses', () => {
		// > Negative test - non-Latin characters
		const nonLatinEmails = [
			'test@пример.com',
			'пользователь@example.com',
			'test@例え.com',
			'用户@example.com',
			'test@مثال.com',
			'مستخدم@example.com'
		];

		for (const nonLatinEmail of nonLatinEmails) {
			try {
				v.parse(LatinEmail, nonLatinEmail);
				expect.fail(`Expected ${nonLatinEmail} to throw, but it didn't`);
			} catch (e) {
				expect(e.message).toContain('Email address contains non-Latin characters');
			}
		}
	});

	it('should throw on invalid email addresses', () => {
		// > Negative test - invalid formats
		const invalidEmails = [
			'',
			'invalid',
			'@example.com',
			'user@',
			'user@.com',
			'user@com',
			'user..name@example.com',
			'user@example',
			'user name@example.com'
		];

		for (const invalidEmail of invalidEmails) {
			try {
				v.parse(LatinEmail, invalidEmail);
				expect.fail(`Expected ${invalidEmail} to throw, but it didn't`);
			} catch (e) {
				expect(e.message).toMatch(/Email address contains non-Latin characters|Invalid email/);
			}
		}
	});

	it('should throw on non-string input', () => {
		try {
			v.parse(LatinEmail, 123);
			expect.fail('Expected non-string input to throw');
		} catch (e) {
			expect(e.message).toContain('Invalid type: Expected string');
		}
	});
});