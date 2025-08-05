
// Log level and log event names
export const DEBUG = 'debug';
export const INFO = 'info';
export const WARN = 'warn';
export const ERROR = 'error';

// Use NONE to set log level to disable all logging
export const NONE = 'none';

// Level values for filtering (higher = more important)
export const LEVELS = {
  [DEBUG]: 1,
  [INFO]: 2,
  [WARN]: 3,
  [ERROR]: 4,
  [NONE]: 5
};

// Event name for generic events
export const LOG = 'log';

