// Service event names (what services emit)
export const STATE_CHANGED = 'stateChanged';
export const HEALTH_CHANGED = 'healthChanged';
export const ERROR = 'error';
export const LOG = 'log';

// Manager event names (what ServiceManager emits)
export const SERVICE_STATE_CHANGED = 'service:stateChanged';
export const SERVICE_HEALTH_CHANGED = 'service:healthChanged';
export const SERVICE_ERROR = 'service:error';
export const SERVICE_LOG = 'service:log';


export const ANY_LOG_LEVEL = '*';
export const ANY_SERVICE_NAME = '*';
