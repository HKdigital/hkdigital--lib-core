
/**
 * @typedef {Object} LogEvent
 * @property {Date} timestamp - When the log event was created
 * @property {string} service - Name of the service/component that logged this event
 * @property {string} level - Log level (DEBUG, INFO, WARN, ERROR)
 * @property {string} message - The log message
 * @property {Object|null} context - Default context data from the logger (null if no context)
 * @property {*} [details] - Additional details provided with the log (optional)
 */

export default {};
