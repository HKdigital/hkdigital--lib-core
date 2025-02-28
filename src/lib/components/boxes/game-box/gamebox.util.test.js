import { describe, it, expect } from 'vitest';

import {
  getGameWidthOnLandscape,
  getGameWidthOnPortrait,
  ERROR_WINDOW_SIZE_NOT_LANDSCAPE,
  ERROR_WINDOW_SIZE_NOT_PORTRAIT
} from './gamebox.util.js';

// > Test

describe('getGameWidthOnLandscape', () => {
  it('should return 0 if window height is 0', () => {
    expect(
      getGameWidthOnLandscape({
        windowWidth: 1600,
        windowHeight: 0,
        aspectOnLandscape: 16 / 9
      })
    ).toEqual(0);
  });

  it('should return full screen width without game aspect', () => {
    expect(
      getGameWidthOnLandscape({
        windowWidth: 1600,
        windowHeight: 900
      })
    ).toEqual(1600);
  });

  it('should return full screen width if game aspect is wider', () => {
    expect(
      getGameWidthOnLandscape({
        windowWidth: 1600,
        windowHeight: 1000,
        aspectOnLandscape: 16 / 9
      })
    ).toEqual(1600);
  });

  it('should return width based on window height if window aspect is wider', () => {
    expect(
      getGameWidthOnLandscape({
        windowWidth: 1600,
        windowHeight: 800,
        aspectOnLandscape: 16 / 9
      })
    ).toEqual((16 / 9) * 800);
  });

  it('should throw an exception if window is not landscape', () => {
    try {
      getGameWidthOnLandscape({
        windowWidth: 900,
        windowHeight: 1600,
        aspectOnLandscape: 16 / 9
      });
    } catch (e) {
      expect(e.message).toEqual(ERROR_WINDOW_SIZE_NOT_LANDSCAPE);
    }
  });
});

// > Test

describe('getGameWidthOnPortrait', () => {
  it('should return 0 if window height is 0', () => {
    expect(
      getGameWidthOnPortrait({
        windowWidth: 900,
        windowHeight: 0,
        aspectOnPortrait: 9 / 16
      })
    ).toEqual(0);
  });

  it('should return full screen width without game aspect', () => {
    expect(
      getGameWidthOnPortrait({
        windowWidth: 900,
        windowHeight: 1600
      })
    ).toEqual(900);
  });

  it('should return full screen width if window aspect is smaller', () => {
    expect(
      getGameWidthOnPortrait({
        windowWidth: 800,
        windowHeight: 1600,
        aspectOnPortrait: 9 / 16
      })
    ).toEqual(800);
  });

  it('should return width based on window height if window aspect is wider', () => {
    expect(
      getGameWidthOnPortrait({
        windowWidth: 1000,
        windowHeight: 1600,
        aspectOnPortrait: 9 / 16
      })
    ).toEqual((9 / 16) * 1600);
  });

  it('should throw an exception if window is not portrait', () => {
    try {
      getGameWidthOnPortrait({
        windowWidth: 1600,
        windowHeight: 900,
        aspectOnPortrait: 9 / 16
      });
    } catch (e) {
      expect(e.message).toEqual(ERROR_WINDOW_SIZE_NOT_PORTRAIT);
    }
  });
});
