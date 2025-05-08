
export const isTestMode =
  import.meta.env.MODE === 'test' ||
  process.env.NODE_ENV === 'test' ||
  process.env.VITEST !== undefined;
