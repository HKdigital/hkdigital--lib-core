import { describe, it, expect } from 'vitest';

import { CHAR, NUMBER, CHAR_NUMBER, EMOJI, PUNCT } from './text.js';

// > Test

describe('Regexp part {CHAR}', () => {
  it('should match latin characters', () => {
    const re = new RegExp(`^[${CHAR}]$`, 'u');

    const cases = ['a', 'A', 'z', 'Z', 'š', 'œ', 'þ', 'ß', 'ë'];

    for (const str of cases) {
      expect(re.test(str)).toBe(true);
    }
  });

  it('should not match other characters', () => {
    const re = new RegExp(`^[${CHAR}]$`, 'u');

    const cases = ['1', '😄', '+', '.'];

    for (const str of cases) {
      expect(re.test(str)).toBe(false);
    }
  });
});

// > Test

describe('Regexp part {NUMBER}', () => {
  it('should match numbers', () => {
    const re = new RegExp(`^[${NUMBER}]$`, 'u');

    const cases = ['1', '0'];

    for (const str of cases) {
      expect(re.test(str)).toBe(true);
    }
  });

  it('should not match other characters', () => {
    const re = new RegExp(`^[${NUMBER}]$`, 'u');

    const cases = ['a', '😄', 'I', 'V', '-1', '+', '.'];

    for (const str of cases) {
      expect(re.test(str)).toBe(false);
    }
  });
});

// > Test

describe('Regexp part {CHAR_NUMBER}', () => {
  it('should match latin characters and numbers', () => {
    const re = new RegExp(`^[${CHAR_NUMBER}]$`, 'u');

    const cases = ['a', 'A', 'z', 'Z', 'š', 'œ', 'þ', 'ß'];

    for (const str of cases) {
      expect(re.test(str)).toBe(true);
    }
  });

  it('should not match other characters', () => {
    const re = new RegExp(`^[${CHAR_NUMBER}]$`, 'u');

    const cases = ['😄', '+', '.'];

    for (const str of cases) {
      expect(re.test(str)).toBe(false);
    }
  });
});

// > Test

describe('Regexp part {EMOJI}', () => {
  it('should match Emoji', () => {
    const re = new RegExp(`^[${EMOJI}]$`, 'v');

    // '⚽' = '\u26BD'
    // '👨🏾‍⚕️' = '\u{1F468}\u{1F3FE}\u200D\u2695\uFE0F'

    const cases = ['😄', '⚽', '👨🏾‍⚕️'];

    for (const str of cases) {
      expect(re.test(str)).toBe(true);
    }
  });

  it('should not match other characters', () => {
    const re = new RegExp(`^[${EMOJI}]$`, 'v');

    const cases = ['1', 'a', 'A', '+', '.'];

    for (const str of cases) {
      expect(re.test(str)).toBe(false);
    }
  });
});

// > Test

describe('Regexp part {PUNCT}', () => {
  it('should match Punctuation charaPUNCTcters', () => {
    const re = new RegExp(`^[${PUNCT}]$`, 'u');

    const cases = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~“‘’”';

    for (const str of cases) {
      expect(re.test(str)).toBe(true);
    }
  });

  it('should not match other characters', () => {
    const re = new RegExp(`^[${PUNCT}]$`, 'v');

    const cases = ['1', 'a', 'A', '😄'];

    for (const str of cases) {
      expect(re.test(str)).toBe(false);
    }
  });
});
