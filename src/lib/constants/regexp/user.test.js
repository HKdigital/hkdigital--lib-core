import { describe, it, expect } from 'vitest';

import { RE_NAME, RE_FULLNAME, RE_USERNAME, RE_SURNAME, RE_PHONENUMBER } from './user.js';

// > Test

describe('Regexp {RE_NAME}', () => {
  it('should match names', () => {
    const re = RE_NAME;

    const cases = [
      'john',
      'john doe',
      'John',
      'John Doe',
      "John van 't Eind",
      'Xi',
      'Raphaël',
      'Amélie',
      'Lucie-Anne',
      'Céline',
      'François être',
      'John van Hövell tot Westervlier en Wezeveld',
      "John de Preud'homme d'Hailly de Nieuport"
    ];

    for (const str of cases) {
      expect(re.test(str)).toBe(true);
    }
  });

  it('should not match other characters', () => {
    const re = RE_NAME;

    const cases = ['-John', 'John Doe-', 'John*Doe', '`John doe'];

    for (const str of cases) {
      expect(re.test(str)).toBe(false);
    }
  });
});

describe('Regexp {RE_FULLNAME}', () => {
  it('Should match names', () => {
    const re = RE_FULLNAME;

    const cases = [
      'john doe',
      "Jan 'Dijk",
      "John 't Schip",
      "John van 't Eind",
      'François être',
      'John van Hövell tot Westervlier en Wezeveld',
      "John de Preud'homme d'Hailly de Nieuport",
      'John Bakker-Smit'
    ];

    for (const str of cases) {
      expect(re.test(str)).toBe(true);
    }
  });

  it('should not match other characters', () => {
    const re = new RegExp(RE_FULLNAME);

    const cases = [
      'John',
      'John **Doe',
      'John**Doe',
      'John *-Doe',
      '-John',
      'John:)Doe',
      'John :(Doe',
      'John 😄Doe',
      "John 'D😄",
    ];

    for (const str of cases) {
      expect(re.test(str)).toBe(false);
    }
  });
});

// > Test

describe('Regexp {RE_USERNAME}', () => {
  it('should match usernames', () => {
    const re = RE_USERNAME;

    const cases = [
      'john',
      'john-doe',
      'john-the-doe',
      'john.doe',
      'john_doe',
      'john1',
      '1john',
      'jd',
      'JohnDoe42#2134'
    ];

    for (const str of cases) {
      expect(re.test(str)).toBe(true);
    }
  });

  it('should not match invalid usernames', () => {
    const re = RE_USERNAME;

    const cases = [
      '-john',
      'john--doe',
      '',
      'j',
      'john-',
      'john😄',
      'john.',
      'john#',
      'john#doe',
      'Disコルド#0001'
    ];

    for (const str of cases) {
      expect(re.test(str)).toBe(false);
    }
  });
});
