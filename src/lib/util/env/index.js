
export const isTestEnv = (
  // For Vite environments
  (typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'test') ||
  // For Node environments, safely check process
  (typeof process !== 'undefined' && process?.env?.NODE_ENV === 'test') ||
  // For Vitest specific check
  (typeof process !== 'undefined' && process?.env?.VITEST !== undefined)
);
