import { describe, it, expect } from 'vitest';

import { LCHAR, LNUMBER, LCHAR_LNUMBER, EMOJI, PUNCT, PUNCT_RICH } from './text.js';

// > Test

describe('Regexp part {LCHAR}', () => {
  it('should match latin characters', () => {
    const re = new RegExp(`^(?:${LCHAR})$`, 'v');

    const cases = ['a', 'A', 'z', 'Z', 'š', 'œ', 'þ', 'ß', 'ë'];

    for (const str of cases) {
      expect(re.test(str)).toBe(true);
    }
  });

  it('should not match other characters', () => {
    const re = new RegExp(`^(?:${LCHAR})$`, 'v');

    const cases = ['1', '😄', '+', '.'];

    for (const str of cases) {
      expect(re.test(str)).toBe(false);
    }
  });
});

// > Test

describe('Regexp part {LNUMBER}', () => {
  it('should match Latin numbers', () => {
    const re = new RegExp(`^(?:${LNUMBER})$`, 'v');

    const cases = ['1', '0', '9'];

    for (const str of cases) {
      expect(re.test(str)).toBe(true);
    }
  });

  it('should not match other characters', () => {
    const re = new RegExp(`^(?:${LNUMBER})$`, 'v');

    const cases = ['a', '😄', 'I', 'V', '-1', '+', '.', '٠', '०'];

    for (const str of cases) {
      expect(re.test(str)).toBe(false);
    }
  });
});

// > Test

describe('Regexp part {LCHAR_LNUMBER}', () => {
  it('should match latin characters and numbers', () => {
    const re = new RegExp(`^(?:${LCHAR}|${LNUMBER})$`, 'v');

    const cases = ['a', 'A', 'z', 'Z', 'š', 'œ', 'þ', 'ß', '0', '9'];

    for (const str of cases) {
      expect(re.test(str)).toBe(true);
    }
  });

  it('should not match other characters', () => {
    const re = new RegExp(`^(?:${LCHAR}|${LNUMBER})$`, 'v');

    const cases = ['😄', '+', '.', '٠', '०'];

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

describe('Regexp part {PUNCT_RICH}', () => {
  it('should match Unicode punctuation characters', () => {
    const re = new RegExp(`^(?:${PUNCT_RICH})$`, 'v');

    const cases = ['!', '.', '?', '"', "'", '—'];

    for (const str of cases) {
      expect(re.test(str)).toBe(true);
    }
  });

  it('should not match other characters', () => {
    const re = new RegExp(`^(?:${PUNCT_RICH})$`, 'v');

    const cases = ['1', 'a', 'A', '😄'];

    for (const str of cases) {
      expect(re.test(str)).toBe(false);
    }
  });
});
