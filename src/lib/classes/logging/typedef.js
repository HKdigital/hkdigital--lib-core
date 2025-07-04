/**
 * @typedef {Object} LogEventData
 * @property {Date} timestamp - When the log event was created
 * @property {string} source - Name of the source where the event came from
 * @property {string} level - Log level (DEBUG, INFO, WARN, ERROR)
 * @property {string} message - The log message
 * @property {Object|null} context
 *   Default context data from the logger (null if no context)
 * @property {*} [details] - Additional details provided with the log (optional)
 */

/**
 * @typedef {LogEventData & { eventName?: string }} LogEvent
 * eventName - Original event name if log came from an event (optional)
 */

export default {};
