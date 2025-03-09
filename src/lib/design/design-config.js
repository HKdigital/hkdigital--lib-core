/* == Design dimensions == */

export const DESIGN = {
  width: 1024,
  height: 768
};

/* == Scaling-clamping behaviour == */

export const CLAMPING = {
  ui: { min: 0.3, max: 2 },
  textBase: { min: 0.75, max: 1.5 },
  textHeading: { min: 0.75, max: 2.25 },
  textUi: { min: 0.5, max: 1.25 }
};

/* == Text == */

export const TEXT_POINT_SIZES = [
  1, 2, 4, 6, 8, 10, 11, 12, 16, 20, 24, 28, 32, 36, 50
];

export const VIEWPORT_POINT_SIZES = [
  1, 2, 4, 5, 6, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180,
  200
];

export const TEXT_BASE_SIZES = {
  sm: { size: 14, lineHeight: 1.25 },
  md: { size: 16, lineHeight: 1.25 },
  lg: { size: 18, lineHeight: 1.25 }
};

export const TEXT_HEADING_SIZES = {
  h1: { size: 32, lineHeight: 1.25 },
  h2: { size: 28, lineHeight: 1.25 },
  h3: { size: 24, lineHeight: 1.25 },
  h4: { size: 20, lineHeight: 1.25 },
  h5: { size: 16, lineHeight: 1.25 }
};

export const TEXT_UI_SIZES = {
  sm: { size: 14, lineHeight: 1 },
  md: { size: 16, lineHeight: 1 },
  lg: { size: 18, lineHeight: 1 }
};

/* == Border radius == */

export const RADIUS_SIZES = {
  none: '0px',
  xs: { size: 5 },
  sm: { size: 10 },
  md: { size: 25 },
  lg: { size: 35 },
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
