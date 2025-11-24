import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  getIsAppleMobile,
  getIsIpadOS,
  getIsAndroidMobile,
  getIsMobile
} from './device.js';

describe('device detection', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getIsAppleMobile', () => {
    it('should detect iPhone from platform', () => {
      vi.stubGlobal('navigator', {
        platform: 'iPhone'
      });

      expect(getIsAppleMobile()).toBe(true);
    });

    it('should detect iPad from platform', () => {
      vi.stubGlobal('navigator', {
        platform: 'iPad'
      });

      expect(getIsAppleMobile()).toBe(true);
    });

    it('should detect iPadOS from MacIntel with touch points', () => {
      vi.stubGlobal('navigator', {
        platform: 'MacIntel',
        maxTouchPoints: 5
      });

      expect(getIsAppleMobile()).toBe(true);
    });

    it('should return false for non-Apple devices', () => {
      vi.stubGlobal('navigator', {
        platform: 'Win32',
        maxTouchPoints: 0
      });

      expect(getIsAppleMobile()).toBe(false);
    });
  });

  describe('getIsIpadOS', () => {
    it('should detect iPadOS from MacIntel with touch points', () => {
      vi.stubGlobal('navigator', {
        platform: 'MacIntel',
        maxTouchPoints: 5
      });

      expect(getIsIpadOS()).toBe(true);
    });

    it('should return false for MacIntel without touch points', () => {
      vi.stubGlobal('navigator', {
        platform: 'MacIntel',
        maxTouchPoints: 0
      });

      expect(getIsIpadOS()).toBe(false);
    });
  });

  describe('getIsAndroidMobile', () => {
    it('should detect Android phone', () => {
      vi.stubGlobal('navigator', {
        platform: 'Linux',
        userAgent: 'Mozilla/5.0 (Linux; Android 13) Mobile'
      });

      expect(getIsAndroidMobile()).toBe(true);
    });

    it('should detect Android tablet', () => {
      vi.stubGlobal('navigator', {
        platform: 'Linux',
        userAgent: 'Mozilla/5.0 (Linux; Android 13)'
      });

      expect(getIsAndroidMobile()).toBe(true);
    });

    it('should exclude Android TV', () => {
      vi.stubGlobal('navigator', {
        platform: 'Linux',
        userAgent: 'Mozilla/5.0 (Linux; Android 13) TV'
      });

      expect(getIsAndroidMobile()).toBe(false);
    });

    it('should exclude Android SmartTV', () => {
      vi.stubGlobal('navigator', {
        platform: 'Linux',
        userAgent: 'Mozilla/5.0 (Linux; Android 13) SmartTV'
      });

      expect(getIsAndroidMobile()).toBe(false);
    });

    it('should return false for non-Android devices', () => {
      vi.stubGlobal('navigator', {
        platform: 'Win32',
        userAgent: 'Windows'
      });

      expect(getIsAndroidMobile()).toBe(false);
    });
  });

  describe('getIsMobile', () => {
    it('should use userAgentData when available', () => {
      vi.stubGlobal('navigator', {
        userAgentData: { mobile: true },
        platform: 'Linux'
      });

      expect(getIsMobile()).toBe(true);
    });

    it('should detect iOS as mobile', () => {
      vi.stubGlobal('navigator', {
        platform: 'iPhone',
        userAgent: 'iPhone'
      });

      expect(getIsMobile()).toBe(true);
    });

    it('should detect Android as mobile', () => {
      vi.stubGlobal('navigator', {
        platform: 'Linux',
        userAgent: 'Android'
      });

      expect(getIsMobile()).toBe(true);
    });

    it('should return false for desktop', () => {
      vi.stubGlobal('navigator', {
        platform: 'Win32',
        userAgent: 'Windows'
      });

      expect(getIsMobile()).toBe(false);
    });
  });
});
