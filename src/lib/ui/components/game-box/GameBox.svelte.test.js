/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import GameBoxWrapper from './GameBox.test-wrapper.svelte';

// Helper to render Svelte component in tests
function render(Component, options = {}) {
  const target = document.createElement('div');
  document.body.appendChild(target);

  const component = mount(Component, {
    target,
    props: options.props || {}
  });

  return {
    container: target,
    component,
    unmount: () => {
      unmount(component);
      target.remove();
    }
  };
}

// Default clamping configuration required by GameBox
const defaultClamping = {
  ui: { min: 0.5, max: 2 },
  textBase: { min: 0.5, max: 2 },
  textHeading: { min: 0.5, max: 2 },
  textUi: { min: 0.5, max: 2 }
};

describe('GameBox', () => {
  beforeEach(() => {
    // Clean up DOM completely
    document.body.innerHTML = '';

    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 667 });

    // Mock screen and orientation
    Object.defineProperty(window, 'screen', {
      writable: true,
      configurable: true,
      value: {
        width: 375,
        height: 667,
        orientation: {
          angle: 0,
          type: 'portrait-primary',
          addEventListener: vi.fn(),
          removeEventListener: vi.fn()
        }
      }
    });

    // Mock navigator
    Object.defineProperty(window.navigator, 'userAgent', {
      writable: true,
      configurable: true,
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    });

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation(query => {
        // Determine orientation based on window dimensions
        const isPortrait = window.innerHeight > window.innerWidth;

        let matches = false;
        if (query.includes('orientation: portrait')) {
          matches = isPortrait;
        } else if (query.includes('orientation: landscape')) {
          matches = !isPortrait;
        } else if (query.includes('standalone') || query.includes('fullscreen')) {
          matches = true;
        }

        return {
          matches,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        };
      })
    });

    // Mock document.fullscreenElement
    Object.defineProperty(document, 'fullscreenElement', {
      writable: true,
      configurable: true,
      value: null
    });

    // Mock document.documentElement.requestFullscreen
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      writable: true,
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined)
    });
  });

  afterEach(() => {
    // Clean up DOM after each test
    document.body.innerHTML = '';
  });

  describe('Component Rendering', () => {
    it('should render the game box container', async () => {
      const { container } = render(GameBoxWrapper, {
        props: {
          aspectOnPortrait: 9 / 16,
          clamping: defaultClamping
        }
      });

      await vi.waitFor(() => {
        const gameBox = container.querySelector('[data-component="game-box"]');
        expect(gameBox).not.toBeNull();
      }, { timeout: 2000 });
    });

    it('should set portrait orientation data attribute in portrait mode', async () => {
      const { container } = render(GameBoxWrapper, {
        props: {
          aspectOnPortrait: 9 / 16,
          clamping: defaultClamping
        }
      });

      await vi.waitFor(() => {
        const gameBox = container.querySelector('[data-component="game-box"]');
        expect(gameBox?.getAttribute('data-orientation')).toBe('portrait');
      }, { timeout: 2000 });
    });

    it('should render portrait content in portrait mode', async () => {
      const { container } = render(GameBoxWrapper, {
        props: {
          aspectOnPortrait: 9 / 16,
          clamping: defaultClamping
        }
      });

      await vi.waitFor(() => {
        const portraitContent = container.querySelector('[data-testid="portrait-content"]');
        expect(portraitContent).not.toBeNull();
      }, { timeout: 2000 });
    });

    it('should set landscape orientation data attribute in landscape mode', async () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 667 });
      Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 375 });

      const { container } = render(GameBoxWrapper, {
        props: {
          aspectOnLandscape: 16 / 9,
          clamping: defaultClamping
        }
      });

      await vi.waitFor(() => {
        const gameBox = container.querySelector('[data-component="game-box"]');
        expect(gameBox?.getAttribute('data-orientation')).toBe('landscape');
      }, { timeout: 2000 });
    });

    it('should render landscape content in landscape mode', async () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 667 });
      Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 375 });

      const { container } = render(GameBoxWrapper, {
        props: {
          aspectOnLandscape: 16 / 9,
          clamping: defaultClamping
        }
      });

      await vi.waitFor(() => {
        const landscapeContent = container.querySelector('[data-testid="landscape-content"]');
        expect(landscapeContent).not.toBeNull();
      }, { timeout: 2000 });
    });
  });

  describe('Game Dimensions', () => {
    it('should calculate dimensions based on aspect ratio for portrait', async () => {
      const { container } = render(GameBoxWrapper, {
        props: {
          aspectOnPortrait: 9 / 16,
          clamping: defaultClamping
        }
      });

      await vi.waitFor(() => {
        const gameBox = container.querySelector('[data-component="game-box"]');
        const width = parseInt(gameBox?.style.width || '0');
        const height = parseInt(gameBox?.style.height || '0');

        expect(width).toBeGreaterThan(0);
        expect(height).toBeGreaterThan(0);
        expect(width / height).toBeCloseTo(9 / 16, 0.1);
      }, { timeout: 2000 });
    });

    it('should calculate dimensions based on aspect ratio for landscape', async () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 667 });
      Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 375 });

      const { container } = render(GameBoxWrapper, {
        props: {
          aspectOnLandscape: 16 / 9,
          clamping: defaultClamping
        }
      });

      await vi.waitFor(() => {
        const gameBox = container.querySelector('[data-component="game-box"]');
        const width = parseInt(gameBox?.style.width || '0');
        const height = parseInt(gameBox?.style.height || '0');

        expect(width).toBeGreaterThan(0);
        expect(height).toBeGreaterThan(0);
        expect(width / height).toBeCloseTo(16 / 9, 0.1);
      }, { timeout: 2000 });
    });

    it('should pass correct parameters to snippets', async () => {
      const { container } = render(GameBoxWrapper, {
        props: {
          aspectOnPortrait: 9 / 16,
          clamping: defaultClamping
        }
      });

      await vi.waitFor(() => {
        const isPortrait = container.querySelector('[data-testid="portrait-content"] [data-testid="is-portrait"]');
        const isLandscape = container.querySelector('[data-testid="portrait-content"] [data-testid="is-landscape"]');
        const gameWidth = container.querySelector('[data-testid="portrait-content"] [data-testid="game-width"]');
        const gameHeight = container.querySelector('[data-testid="portrait-content"] [data-testid="game-height"]');

        expect(isPortrait?.textContent).toBe('true');
        expect(isLandscape?.textContent).toBe('false');
        expect(parseFloat(gameWidth?.textContent || '0')).toBeGreaterThan(0);
        expect(parseFloat(gameHeight?.textContent || '0')).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });
  });

  describe('Different Screen Sizes', () => {
    const testSizes = [
      { name: 'iPhone SE', width: 375, height: 667, orientation: 'portrait' },
      { name: 'iPhone 12', width: 390, height: 844, orientation: 'portrait' },
      { name: 'iPad', width: 768, height: 1024, orientation: 'portrait' },
      { name: 'iPad Landscape', width: 1024, height: 768, orientation: 'landscape' },
      { name: 'Desktop', width: 1920, height: 1080, orientation: 'landscape' }
    ];

    testSizes.forEach(({ name, width, height, orientation }) => {
      it(`should render correctly on ${name} (${width}x${height})`, async () => {
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
        Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: height });

        const { container } = render(GameBoxWrapper, {
          props: {
            aspectOnPortrait: 9 / 16,
            aspectOnLandscape: 16 / 9,
            clamping: defaultClamping
          }
        });

        await vi.waitFor(() => {
          const gameBox = container.querySelector('[data-component="game-box"]');
          const boxWidth = parseInt(gameBox?.style.width || '0');
          const boxHeight = parseInt(gameBox?.style.height || '0');

          expect(gameBox?.getAttribute('data-orientation')).toBe(orientation);
          expect(boxWidth).toBeGreaterThan(0);
          expect(boxHeight).toBeGreaterThan(0);
          expect(boxWidth).toBeLessThanOrEqual(width);
          expect(boxHeight).toBeLessThanOrEqual(height);
        }, { timeout: 2000 });
      });
    });
  });

  describe('Margins', () => {
    it('should respect margin props', async () => {
      const { container } = render(GameBoxWrapper, {
        props: {
          aspectOnPortrait: 9 / 16,
          marginLeft: 10,
          marginRight: 15,
          marginTop: 20,
          marginBottom: 25,
          clamping: defaultClamping
        }
      });

      await vi.waitFor(() => {
        const gameBox = container.querySelector('[data-component="game-box"]');
        expect(gameBox).not.toBeNull();

        // Browser consolidates individual margin-* into shorthand "margin: top right bottom left"
        const computedStyle = window.getComputedStyle(gameBox);
        expect(computedStyle.marginTop).toBe('20px');
        expect(computedStyle.marginRight).toBe('15px');
        expect(computedStyle.marginBottom).toBe('25px');
        expect(computedStyle.marginLeft).toBe('10px');
      }, { timeout: 2000 });
    });

    it('should adjust game dimensions based on margins', async () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 400 });
      Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 });

      const { container } = render(GameBoxWrapper, {
        props: {
          aspectOnPortrait: 9 / 16,
          marginLeft: 10,
          marginRight: 10,
          marginTop: 20,
          marginBottom: 20,
          clamping: defaultClamping
        }
      });

      await vi.waitFor(() => {
        const gameBox = container.querySelector('[data-component="game-box"]');
        const width = parseInt(gameBox?.style.width || '0');

        // Width should be less than window width minus margins
        expect(width).toBeLessThanOrEqual(380); // 400 - 10 - 10
        expect(width).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });
  });

  describe('Center prop', () => {
    it('should apply center class when center prop is true', async () => {
      const { container } = render(GameBoxWrapper, {
        props: {
          center: true,
          aspectOnPortrait: 9 / 16,
          clamping: defaultClamping
        }
      });

      await vi.waitFor(() => {
        const centerDiv = container.querySelector('.center');
        expect(centerDiv).not.toBeNull();
      }, { timeout: 2000 });
    });

    it('should not have center class when center prop is false', async () => {
      const { container } = render(GameBoxWrapper, {
        props: {
          center: false,
          aspectOnPortrait: 9 / 16,
          clamping: defaultClamping
        }
      });

      await vi.waitFor(() => {
        const gameBox = container.querySelector('[data-component="game-box"]');
        expect(gameBox).not.toBeNull();
        // Center class should not be present
        const centerDiv = container.querySelector('.center');
        expect(centerDiv).toBeNull();
      }, { timeout: 2000 });
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should apply custom base classes', async () => {
      const { container } = render(GameBoxWrapper, {
        props: {
          base: 'custom-base',
          bg: 'custom-bg',
          classes: 'custom-class',
          aspectOnPortrait: 9 / 16,
          clamping: defaultClamping
        }
      });

      await vi.waitFor(() => {
        const gameBox = container.querySelector('[data-component="game-box"]');
        expect(gameBox?.classList.contains('custom-base')).toBe(true);
        expect(gameBox?.classList.contains('custom-bg')).toBe(true);
        expect(gameBox?.classList.contains('custom-class')).toBe(true);
      }, { timeout: 2000 });
    });

    it('should apply mobile class when on mobile', async () => {
      // Mock mobile user agent and platform
      Object.defineProperty(window.navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      });
      Object.defineProperty(window.navigator, 'platform', {
        writable: true,
        configurable: true,
        value: 'iPhone'
      });

      const { container } = render(GameBoxWrapper, {
        props: {
          aspectOnPortrait: 9 / 16,
          clamping: defaultClamping
        }
      });

      await vi.waitFor(() => {
        const gameBox = container.querySelector('[data-component="game-box"]');
        expect(gameBox?.classList.contains('isMobile')).toBe(true);
      }, { timeout: 2000 });
    });
  });

  describe('CSS Variables', () => {
    it('should set CSS variables for game width and height', async () => {
      const { container } = render(GameBoxWrapper, {
        props: {
          aspectOnPortrait: 9 / 16,
          clamping: defaultClamping
        }
      });

      await vi.waitFor(() => {
        const gameBox = container.querySelector('[data-component="game-box"]');
        const gameWidth = gameBox?.style.getPropertyValue('--game-width');
        const gameHeight = gameBox?.style.getPropertyValue('--game-height');

        expect(gameWidth).toBeTruthy();
        expect(gameHeight).toBeTruthy();
        expect(parseFloat(gameWidth)).toBeGreaterThan(0);
        expect(parseFloat(gameHeight)).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });
  });

  describe('Fullscreen and Home Screen Features', () => {
    it('should not show fullscreen prompt in dev mode (localhost)', async () => {
      // Note: Tests run on localhost, so isDevMode will be true
      // This means fullscreen/install prompts won't show
      Object.defineProperty(document, 'fullscreenElement', {
        writable: true,
        configurable: true,
        value: null
      });

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: false, // Not fullscreen
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }))
      });

      const { container } = render(GameBoxWrapper, {
        props: {
          aspectOnPortrait: 9 / 16,
          requireFullscreen: true,
          clamping: defaultClamping
        }
      });

      await vi.waitFor(() => {
        // In dev mode, game content shows instead of fullscreen prompt
        const portraitContent = container.querySelector('[data-testid="portrait-content"]');
        const fullscreenPrompt = container.querySelector('[data-testid="require-fullscreen"]');

        expect(portraitContent).not.toBeNull();
        expect(fullscreenPrompt).toBeNull();
      }, { timeout: 2000 });
    });

    it('should not show install prompt in dev mode (localhost)', async () => {
      // Note: Tests run on localhost, so isDevMode will be true
      Object.defineProperty(window.navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      });
      Object.defineProperty(window.navigator, 'platform', {
        writable: true,
        configurable: true,
        value: 'iPhone'
      });

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: false, // Not PWA
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }))
      });

      const { container } = render(GameBoxWrapper, {
        props: {
          aspectOnPortrait: 9 / 16,
          requireInstallOnHomeScreen: true,
          clamping: defaultClamping
        }
      });

      await vi.waitFor(() => {
        // In dev mode, game content shows instead of install prompt
        const portraitContent = container.querySelector('[data-testid="portrait-content"]');
        const installPrompt = container.querySelector('[data-testid="install-home-screen"]');

        expect(portraitContent).not.toBeNull();
        expect(installPrompt).toBeNull();
      }, { timeout: 2000 });
    });

    it('should detect iOS user agent', async () => {
      // Mock iOS user agent and platform
      Object.defineProperty(window.navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      });
      Object.defineProperty(window.navigator, 'platform', {
        writable: true,
        configurable: true,
        value: 'iPhone'
      });

      const { container } = render(GameBoxWrapper, {
        props: {
          aspectOnPortrait: 9 / 16,
          clamping: defaultClamping
        }
      });

      await vi.waitFor(() => {
        const gameBox = container.querySelector('[data-component="game-box"]');
        // Should detect iOS and set isMobile
        expect(gameBox?.classList.contains('isMobile')).toBe(true);
      }, { timeout: 2000 });
    });

    it('should detect Android user agent', async () => {
      // Mock Android user agent
      Object.defineProperty(window.navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36'
      });

      const { container } = render(GameBoxWrapper, {
        props: {
          aspectOnPortrait: 9 / 16,
          clamping: defaultClamping
        }
      });

      await vi.waitFor(() => {
        const gameBox = container.querySelector('[data-component="game-box"]');
        // Should detect Android and set isMobile
        expect(gameBox?.classList.contains('isMobile')).toBe(true);
      }, { timeout: 2000 });
    });

    it('should show game content when fullscreen requirement is met', async () => {
      // Mock being in fullscreen
      Object.defineProperty(document, 'fullscreenElement', {
        writable: true,
        configurable: true,
        value: document.documentElement
      });

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: true, // Fullscreen mode active
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }))
      });

      const { container } = render(GameBoxWrapper, {
        props: {
          aspectOnPortrait: 9 / 16,
          requireFullscreen: true,
          clamping: defaultClamping
        }
      });

      await vi.waitFor(() => {
        const portraitContent = container.querySelector('[data-testid="portrait-content"]');
        const fullscreenPrompt = container.querySelector('[data-testid="require-fullscreen"]');

        expect(portraitContent).not.toBeNull();
        expect(fullscreenPrompt).toBeNull();
      }, { timeout: 2000 });
    });

    it('should show game content when PWA requirement is met', async () => {
      // Mock mobile user agent
      Object.defineProperty(window.navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      });
      Object.defineProperty(window.navigator, 'platform', {
        writable: true,
        configurable: true,
        value: 'iPhone'
      });

      // Mock being in standalone mode (PWA)
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query.includes('standalone'), // Standalone mode active
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }))
      });

      const { container } = render(GameBoxWrapper, {
        props: {
          aspectOnPortrait: 9 / 16,
          requireInstallOnHomeScreen: true,
          clamping: defaultClamping
        }
      });

      await vi.waitFor(() => {
        const portraitContent = container.querySelector('[data-testid="portrait-content"]');
        const installPrompt = container.querySelector('[data-testid="install-home-screen"]');

        expect(portraitContent).not.toBeNull();
        expect(installPrompt).toBeNull();
      }, { timeout: 2000 });
    });

    it('should not show fullscreen prompt when requireFullscreen is false', async () => {
      Object.defineProperty(document, 'fullscreenElement', {
        writable: true,
        configurable: true,
        value: null
      });

      const { container } = render(GameBoxWrapper, {
        props: {
          aspectOnPortrait: 9 / 16,
          requireFullscreen: false,
          clamping: defaultClamping
        }
      });

      await vi.waitFor(() => {
        const portraitContent = container.querySelector('[data-testid="portrait-content"]');
        const fullscreenPrompt = container.querySelector('[data-testid="require-fullscreen"]');

        expect(portraitContent).not.toBeNull();
        expect(fullscreenPrompt).toBeNull();
      }, { timeout: 2000 });
    });

    it('should not show install prompt when requireInstallOnHomeScreen is false', async () => {
      // Mock mobile user agent
      Object.defineProperty(window.navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      });
      Object.defineProperty(window.navigator, 'platform', {
        writable: true,
        configurable: true,
        value: 'iPhone'
      });

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }))
      });

      const { container } = render(GameBoxWrapper, {
        props: {
          aspectOnPortrait: 9 / 16,
          requireInstallOnHomeScreen: false,
          clamping: defaultClamping
        }
      });

      await vi.waitFor(() => {
        const portraitContent = container.querySelector('[data-testid="portrait-content"]');
        const installPrompt = container.querySelector('[data-testid="install-home-screen"]');

        expect(portraitContent).not.toBeNull();
        expect(installPrompt).toBeNull();
      }, { timeout: 2000 });
    });
  });

  describe('Sticky Dimensions on Orientation Change', () => {
    it('should maintain dimensions when switching orientations', async () => {
      // Start in portrait
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667
      });

      const { container } = render(GameBoxWrapper, {
        props: {
          aspectOnPortrait: 9 / 16,
          aspectOnLandscape: 16 / 9,
          clamping: defaultClamping
        }
      });

      let portraitDimensions;
      let landscapeDimensions;

      // Wait for initial portrait render
      await vi.waitFor(() => {
        const gameBox = container.querySelector('[data-component="game-box"]');
        expect(gameBox?.getAttribute('data-orientation')).toBe('portrait');

        const portraitContainer = container.querySelector(
          '[data-component="scaled-container"]:not([style*="visibility: hidden"])'
        );
        const portraitWidth = parseInt(
          portraitContainer?.style.width || '0'
        );

        expect(portraitWidth).toBeGreaterThan(0);
        portraitDimensions = { width: portraitWidth };
      }, { timeout: 2000 });

      // Switch to landscape
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 667
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 375
      });

      window.dispatchEvent(new Event('resize'));

      // Wait for landscape render
      await vi.waitFor(() => {
        const gameBox = container.querySelector('[data-component="game-box"]');
        expect(gameBox?.getAttribute('data-orientation')).toBe('landscape');

        const containers = container.querySelectorAll(
          '[data-component="scaled-container"]'
        );
        expect(containers.length).toBe(2);

        const landscapeContainer = Array.from(containers).find(
          c => !c.style.visibility.includes('hidden')
        );
        const portraitContainer = Array.from(containers).find(
          c => c.style.visibility.includes('hidden')
        );

        const landscapeWidth = parseInt(
          landscapeContainer?.style.width || '0'
        );
        const portraitWidth = parseInt(portraitContainer?.style.width || '0');

        expect(landscapeWidth).toBeGreaterThan(0);
        expect(portraitWidth).toBeGreaterThan(0);
        landscapeDimensions = { width: landscapeWidth };
      }, { timeout: 2000 });

      // Switch back to portrait
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667
      });

      window.dispatchEvent(new Event('resize'));

      // Verify both orientations maintain dimensions
      await vi.waitFor(() => {
        const gameBox = container.querySelector('[data-component="game-box"]');
        expect(gameBox?.getAttribute('data-orientation')).toBe('portrait');

        const containers = container.querySelectorAll(
          '[data-component="scaled-container"]'
        );
        expect(containers.length).toBe(2);

        const portraitContainer = Array.from(containers).find(
          c => !c.style.visibility.includes('hidden')
        );
        const landscapeContainer = Array.from(containers).find(
          c => c.style.visibility.includes('hidden')
        );

        const portraitWidth = parseInt(
          portraitContainer?.style.width || '0'
        );
        const landscapeWidth = parseInt(
          landscapeContainer?.style.width || '0'
        );

        expect(portraitWidth).toBeGreaterThan(0);
        expect(landscapeWidth).toBeGreaterThan(0);
        expect(landscapeWidth).toBe(landscapeDimensions.width);
      }, { timeout: 2000 });
    });
  });
});
