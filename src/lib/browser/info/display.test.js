import { describe, it, expect, beforeEach, vi } from 'vitest';

import { getIsPwa, getIsFullscreen } from './display.js';

describe('display mode detection', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getIsPwa', () => {
    it('should detect standalone mode', () => {
      vi.stubGlobal('window', {
        matchMedia: (query) => ({
          matches: query.includes('standalone')
        })
      });

      expect(getIsPwa()).toBe(true);
    });

    it('should detect fullscreen mode', () => {
      vi.stubGlobal('window', {
        matchMedia: (query) => ({
          matches: query.includes('fullscreen')
        })
      });

      expect(getIsPwa()).toBe(true);
    });

    it('should return false for browser mode', () => {
      vi.stubGlobal('window', {
        matchMedia: () => ({
          matches: false
        })
      });

      expect(getIsPwa()).toBe(false);
    });
  });

  describe('getIsFullscreen', () => {
    it('should return true when running as PWA', () => {
      vi.stubGlobal('window', {
        matchMedia: () => ({
          matches: true
        })
      });
      vi.stubGlobal('document', {
        fullscreenElement: null
      });

      expect(getIsFullscreen()).toBe(true);
    });

    it('should return true when document has fullscreen element', () => {
      vi.stubGlobal('window', {
        matchMedia: () => ({
          matches: false
        })
      });
      vi.stubGlobal('document', {
        fullscreenElement: {}
      });

      expect(getIsFullscreen()).toBe(true);
    });

    it('should return false when not fullscreen', () => {
      vi.stubGlobal('window', {
        matchMedia: () => ({
          matches: false
        })
      });
      vi.stubGlobal('document', {
        fullscreenElement: null
      });

      expect(getIsFullscreen()).toBe(false);
    });
  });
});
