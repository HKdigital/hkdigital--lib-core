/* == Text == */

/* == Design dimensions == */
export const DESIGN = {
  width: 1920,
  height: 1080
};

export const SCALING = {
  ui: { min: 0.3, max: 2 },
  textContent: { min: 0.75, max: 1.5 },
  textHeading: { min: 0.75, max: 2.25 },
  textUi: { min: 0.5, max: 1.25 }
};

export const TEXT_POINT_SIZES = [
  1, 2, 4, 6, 8, 10, 11, 12, 16, 20, 24, 32, 36, 50
];

export const VIEWPORT_POINT_SIZES = [
  1, 2, 4, 5, 6, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180,
  200
];

export const TEXT_CONTENT_SIZES = {
  sm: { size: 14, lineHeight: 1.5 },
  base: { size: 16, lineHeight: 1.5 },
  lg: { size: 20, lineHeight: 1.4 }
};

export const TEXT_HEADING_SIZES = {
  h1: { size: 50, lineHeight: 1.1 },
  h2: { size: 36, lineHeight: 1.1 },
  h3: { size: 28, lineHeight: 1.2 },
  h4: { size: 24, lineHeight: 1.2 },
  h5: { size: 20, lineHeight: 1.3 }
};

export const TEXT_UI_SIZES = {
  sm: { size: 16, lineHeight: 1 },
  base: { size: 20, lineHeight: 1 },
  lg: { size: 24, lineHeight: 1 }
};

/* == Border radius == */

export const RADIUS_SIZES = {
  none: '0px',
  xs: { size: 2 },
  sm: { size: 2 },
  md: { size: 4 },
  lg: { size: 4 },
  full: '9999px'
};

/* == Border width == */

export const BORDER_WIDTH_SIZES = {
  thin: { size: 1 },
  normal: { size: 2 },
  thick: { size: 4 }
};

/* == Stroke width == */

export const STROKE_WIDTH_SIZES = {
  thin: { size: 1 },
  normal: { size: 2 },
  thick: { size: 4 }
};
