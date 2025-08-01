/**
 * time.js
 *
 * @description
 * This file contains time related functionality
 *
 * @example
 *
 *   import { delay, now } from './time.js';
 *
 *   async function test()
 *   {
 *     console.log( `Current timestamp [${now()}]` );
 *
 *     await delay( 1000 );
 *
 *     console.log( `Current timestamp [${now()}]` );
 *   }
 */

/**
 * FIXME: use Intl.DateTimeFormat instead of custom conversions
 *
 *  e.g.
 *   return new Intl.DateTimeFormat('nl-NL', {
 *     month: "long",
 *    timeZone: 'Europe/Amsterdam'
 *   }).format(d);
 */

import {
	SECOND_MS,
	MINUTE_MS,
	HOUR_MS,
	DAY_MS,
	TIME_2025_01_01
} from '$lib/constants/time/index.js';

import * as expect from '$lib/util/expect';
import { HkPromise } from '$lib/classes/promise/index.js';

/**
 * Returns a promise that resolves after a specified timeout
 * - If the returned promise is rejected, the timeout is cancelled
 *
 * @param  {number} delayOrMinDelayMs
 *   Number of milliseconds to wait before promise resolves
 *
 * @param  {number} [maxDelayMs=delayOrMinDelayMs]
 *   Maximum number of milliseconds to wait before the returned promise
 *   resolves. If this parameter is set, the delay will be chosen randomly
 *   between the values [delayOrMinDelayMs, maxDelayMs]
 *
 * @returns {HkPromise} promise that resolves after a specified timeout
 */
export function delay(delayOrMinDelayMs, maxDelayMs) {
	expect.number(delayOrMinDelayMs);

	if (maxDelayMs) {
		//
		// maxDelayMs was set -> generate random delay
		//
		if (maxDelayMs > delayOrMinDelayMs) {
			delayOrMinDelayMs = Math.floor(
				delayOrMinDelayMs + Math.random() * (maxDelayMs - delayOrMinDelayMs)
			);
		}
	}

	const promise = new HkPromise();

	let timer = setTimeout(() => {
		timer = null;
		promise.resolve();
	}, delayOrMinDelayMs);

	// Register catch method to cancel timer when promise is rejected
	promise.catch(() => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	});

	return promise;
}

/**
 * Get the number of milliseconds since the specified time stamp of the default
 * reference time stamp TIME_2025_01_01
 *
 * @param {number} [sinceMs=TIME_2025_01_01]
 *
 * @returns {number} number of milliseconds since the specified time
 */
export function sinceMs(sinceMs = TIME_2025_01_01) {
	return Date.now() - sinceMs;
}

/**
 * Get a string that represents the time in a readable
 * string format: [DD:][HH:]MM:SS.mmm
 *
 * @param {number} timeMs [description]
 *
 * @returns {string} time in human readable format
 */
export function timeToString(timeMs) {
	const days = Math.floor(timeMs / DAY_MS);

	let restMs = timeMs - days * DAY_MS;

	const hours = Math.floor(restMs / HOUR_MS);

	restMs = restMs - hours * HOUR_MS;

	const minutes = Math.floor(restMs / MINUTE_MS);

	restMs = restMs - minutes * MINUTE_MS;

	const seconds = Math.floor(restMs / SECOND_MS);

	restMs = restMs - seconds * SECOND_MS;

	let str = '';

	if (days) {
		str += `${days.toString().padStart(2, '0')}:`;
		str += `${hours.toString().padStart(2, '0')}:`;
	} else if (hours) {
		str += `${hours.toString().padStart(2, '0')}:`;
	}

	str += `${minutes.toString().padStart(2, '0')}:`;
	str += `${seconds.toString().padStart(2, '0')}.`;
	str += `${restMs.toString().padStart(3, '0')}`;

	return str;
}

/**
 * Returns a Date object
 * - The input can be a Date object or a numeric timestamp
 *
 * @param {Date|number} dateOrTimestamp
 *
 * @returns {Date} date object
 */
export function toDate(dateOrTimestamp) {
	if (dateOrTimestamp instanceof Date) {
		return dateOrTimestamp;
	}

	if (typeof dateOrTimestamp === 'number') {
		return new Date(dateOrTimestamp);
	}

	throw new Error('Missing or invalid parameter [dateOrTimestamp]');
}

/**
 * Get the ISO 8601 week number of the specified date
 *
 * @see https://stackoverflow.com
 *      /questions/6117814/get-week-of-year-in-javascript-like-in-php
 *
 * @param {Date|number} dateOrTimestamp
 *
 * @returns {number} week number
 */
export function getWeekNumber(dateOrTimestamp) {
	const date = toDate(dateOrTimestamp);

	//
	// Create a copy of this date object
	//
	const target = new Date(date.valueOf());

	//
	// ISO week date weeks start on Monday, so correct the day number
	//
	const dayNumber = (date.getDay() + 6) % 7;

	//
	// ISO 8601 states that week 1 is the week with the first Thursday
	// of that year.
	//
	// Set the target date to the Thursday in the target week
	//
	target.setDate(target.getDate() - dayNumber + 3);

	//
	// Store the millisecond value of the target date
	//
	const firstThursday = target.valueOf();

	// Set the target to the first Thursday of the year
	// First, set the target to January 1st
	target.setMonth(0, 1);

	//
	// Not a Thursday? Correct the date to the next Thursday
	//
	if (target.getDay() !== 4) {
		target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
	}

	//
	// The week number is the number of weeks between the first Thursday
	// of the year and the Thursday in the target week
	// (604800000 = 7 * 24 * 3600 * 1000)
	//
	return 1 + Math.ceil((firstThursday - target.getTime()) / 604800000);
}

/**
 * Get the name of the month
 * - Returns the month name using Intl.DateTimeFormat
 * - By default uses English locale, but locale can be specified
 *
 * @param {Date|number} dateOrTimestamp - Date object or timestamp
 * @param {string} [locale='nl-NL'] - The locale to use for the month name
 *
 * @param {Object} [options]
 * @param {'numeric'|'2-digit'|'narrow'|'short'|'long'} [options.month='long']
 * @param {string} [options.timeZone] - Optional timezone
 *
 * @returns {string} name of the month in the specified locale
 */
export function getMonthName(
	dateOrTimestamp,
	locale = 'nl-NL',
	options = { month: 'long' }
) {
	const date = toDate(dateOrTimestamp);

	// Create formatter with provided locale and options
	// @ts-ignore - TypeScript kan hier strikter zijn dan nodig met de options
	const formatter = new Intl.DateTimeFormat(locale, {
		month: options?.month || 'long',
		...(options?.timeZone ? { timeZone: options.timeZone } : {})
	});

	return formatter.format(date);
}

/**
 * Get the name of the day of the week
 * - Returns the day name using Intl.DateTimeFormat
 * - By default uses English locale, but locale can be specified
 *
 * @param {Date|number} dateOrTimestamp - Date object or timestamp
 * @param {string} [locale='nl-NL'] - The locale to use for the day name
 *
 * @param {Object} [options]
 * @param {'narrow'|'short'|'long'} [options.weekday='long']
 * @param {string} [options.timeZone] - Optional timezone
 *
 * @returns {string} name of the day in the specified locale
 */
export function getDayName(
	dateOrTimestamp,
	locale = 'nl-NL',
	options = { weekday: 'long' }
) {
	const date = toDate(dateOrTimestamp);

	// Create formatter with provided locale and options
	// @ts-ignore - TypeScript kan hier strikter zijn dan nodig met de options
	const formatter = new Intl.DateTimeFormat(locale, {
		weekday: options?.weekday || 'long',
		...(options?.timeZone ? { timeZone: options.timeZone } : {})
	});

	return formatter.format(date);
}

/**
 * Return the timestamp of the start of the day
 * - Midnight
 *
 * @param {Date|number} [dateOrTimestamp]
 *
 * @returns {number} timestamp of start of the day (00:00:00:0000)
 */
export function getTimeAtStartOfDay(dateOrTimestamp) {
	let d;

	if (dateOrTimestamp) {
		d = toDate(dateOrTimestamp);
	} else {
		// today, now
		d = new Date();
	}

	d.setHours(0);
	d.setMinutes(0);
	d.setSeconds(0);
	d.setMilliseconds(0);

	return d.getTime();
}

/**
 * Return the timestamp of the end of the day
 * - Midnight - 1 millisecond
 *
 * @param {Date|number} [dateOrTimestamp]
 *
 * @returns {number} timestamp of start of the day
 */
export function getTimeAtEndOfDay(dateOrTimestamp) {
	let d;

	if (dateOrTimestamp) {
		d = toDate(dateOrTimestamp);
	} else {
		// today, now
		d = new Date();
	}

	d.setHours(23);
	d.setMinutes(59);
	d.setSeconds(59);
	d.setMilliseconds(999);

	return d.getTime();
}
