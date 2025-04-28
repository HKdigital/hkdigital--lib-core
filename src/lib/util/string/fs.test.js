import { describe, it, expect } from 'vitest';

import {
  basename,
  extname,
  dirname,
  join,
  normalize,
  isAbsolute,
  segments
} from './fs.js';

describe('basename', () => {
  it('should extract filename with extension by default', () => {
    // Standard paths
    expect(basename('/path/to/file.txt')).toBe('file.txt');
    expect(basename('path/to/file.txt')).toBe('file.txt');
    expect(basename('file.txt')).toBe('file.txt');

    // Trailing slashes
    expect(basename('/path/to/file.txt/')).toBe('file.txt');

    // Multiple extensions
    expect(basename('/path/to/file.tar.gz')).toBe('file.tar.gz');

    // No extension
    expect(basename('/path/to/file')).toBe('file');

    // Hidden files
    expect(basename('/path/to/.hidden')).toBe('.hidden');

    // Edge cases
    expect(basename('')).toBe('');
    expect(basename('/')).toBe('');
  });

  it('should extract filename without extension when specified', () => {
    // Standard paths
    expect(basename('/path/to/file.txt', false)).toBe('file');
    expect(basename('path/to/file.txt', false)).toBe('file');

    // Multiple extensions
    expect(basename('/path/to/file.tar.gz', false)).toBe('file.tar');

    // No extension
    expect(basename('/path/to/file', false)).toBe('file');

    // Hidden files
    expect(basename('/path/to/.hidden', false)).toBe('.hidden');
  });

  it('should throw error for non-string inputs', () => {
    expect(() => basename(123)).toThrow('Path must be a string');
    expect(() => basename(null)).toThrow('Path must be a string');
    expect(() => basename(undefined)).toThrow('Path must be a string');
    expect(() => basename({})).toThrow('Path must be a string');
  });
});

describe('extname', () => {
  it('should extract extension without dot by default', () => {
    expect(extname('/path/to/file.txt')).toBe('txt');
    expect(extname('file.jpg')).toBe('jpg');
    expect(extname('/path/to/file.tar.gz')).toBe('gz');
  });

  it('should extract extension with dot when specified', () => {
    expect(extname('/path/to/file.txt', true)).toBe('.txt');
    expect(extname('file.jpg', true)).toBe('.jpg');
    expect(extname('/path/to/file.tar.gz', true)).toBe('.gz');
  });

  it('should return empty string for files without extension', () => {
    expect(extname('/path/to/file')).toBe('');
    expect(extname('file')).toBe('');
    expect(extname('/path/to/.hidden')).toBe('');
  });

  it('should throw error for non-string inputs', () => {
    expect(() => extname(123)).toThrow('Path must be a string');
    expect(() => extname(null)).toThrow('Path must be a string');
  });
});

describe('dirname', () => {
  it('should extract directory name from path', () => {
    expect(dirname('/path/to/file.txt')).toBe('/path/to');
    expect(dirname('path/to/file.txt')).toBe('path/to');
    expect(dirname('/path/to/')).toBe('/path');
  });

  // it('should handle edge cases', () => {
  //   expect(dirname('/file.txt')).toBe('/');
  //   expect(dirname('file.txt')).toBe('.');
  //   expect(dirname('')).toBe('.');
  //   expect(dirname('/')).toBe('/');
  // });

  it('should throw error for non-string inputs', () => {
    expect(() => dirname(123)).toThrow('Path must be a string');
    expect(() => dirname(null)).toThrow('Path must be a string');
  });
});

// describe('join', () => {
//   it('should join path segments with forward slashes', () => {
//     expect(join('path', 'to', 'file.txt')).toBe('path/to/file.txt');
//     expect(join('/path', 'to', 'file.txt')).toBe('/path/to/file.txt');
//     expect(join('path', '/to/', '/file.txt')).toBe('path/to/file.txt');
//   });

//   it('should handle empty segments', () => {
//     expect(join('path', '', 'file.txt')).toBe('path/file.txt');
//     expect(join()).toBe('.');
//   });

//   it('should normalize multiple consecutive slashes', () => {
//     expect(join('path/', '/to/', '/file.txt')).toBe('path/to/file.txt');
//   });
// });

describe('normalize', () => {
  it('should normalize paths with . and .. segments', () => {
    expect(normalize('/path/to/../file.txt')).toBe('/path/file.txt');
    expect(normalize('path/./to/file.txt')).toBe('path/to/file.txt');
    expect(normalize('path/to/../../file.txt')).toBe('file.txt');
  });

  it('should preserve trailing slashes', () => {
    expect(normalize('/path/to/')).toBe('/path/to/');
    expect(normalize('path/to/')).toBe('path/to/');
  });

  it('should handle paths with backslashes', () => {
    expect(normalize('path\\to\\file.txt')).toBe('path/to/file.txt');
  });

  it('should handle edge cases', () => {
    expect(normalize('')).toBe('.');
    expect(normalize('.')).toBe('.');
    expect(normalize('..')).toBe('..');
    expect(normalize('/')).toBe('/');
  });

  it('should throw error for non-string inputs', () => {
    expect(() => normalize(123)).toThrow('Path must be a string');
    expect(() => normalize(null)).toThrow('Path must be a string');
  });
});

describe('isAbsolute', () => {
  it('should correctly identify absolute paths', () => {
    expect(isAbsolute('/path/to/file.txt')).toBe(true);
    expect(isAbsolute('/file.txt')).toBe(true);
    expect(isAbsolute('/')).toBe(true);
  });

  it('should correctly identify relative paths', () => {
    expect(isAbsolute('path/to/file.txt')).toBe(false);
    expect(isAbsolute('file.txt')).toBe(false);
    expect(isAbsolute('./file.txt')).toBe(false);
    expect(isAbsolute('../file.txt')).toBe(false);
    expect(isAbsolute('')).toBe(false);
  });

  it('should throw error for non-string inputs', () => {
    expect(() => isAbsolute(123)).toThrow('Path must be a string');
    expect(() => isAbsolute(null)).toThrow('Path must be a string');
  });
});

describe('segments', () => {
  it('should return path segments as an array', () => {
    expect(segments('/path/to/file.txt')).toEqual(['path', 'to', 'file.txt']);
    expect(segments('path/to/file.txt')).toEqual(['path', 'to', 'file.txt']);
  });

  it('should handle paths with . and .. segments', () => {
    expect(segments('/path/./to/../file.txt')).toEqual(['path', 'file.txt']);
  });

  // it('should handle edge cases', () => {
  //   expect(segments('')).toEqual([]);
  //   expect(segments('/')).toEqual([]);
  //   expect(segments('file.txt')).toEqual(['file.txt']);
  // });

  it('should throw error for non-string inputs', () => {
    expect(() => segments(123)).toThrow('Path must be a string');
    expect(() => segments(null)).toThrow('Path must be a string');
  });
});
