/**
 * Create a response value that can be used by a mocked fetch function
 *
 * @template T
 *
 * @param {T} data
 *
 * @returns {{ json: () => Promise<T>}}
 */
export function createJsonFetchResponse(data /* , options */) {
	return { json: () => new Promise((resolve) => resolve(data)) };
}
