import { DetailedError } from '$lib/generic/errors.js';

export class ResponseError extends DetailedError {}

export class AuthenticationError extends DetailedError {}

export class BadRequestError extends DetailedError {}

export class AbortError extends DetailedError {}

// @note import TimeoutError from '$lib/generic/errors.js';
