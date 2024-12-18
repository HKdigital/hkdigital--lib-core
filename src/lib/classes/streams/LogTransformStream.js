export default class LogTransformStream extends TransformStream {
	constructor() {
		const transformer = {
			/**
			 * Log the chunk and enqueue the unchanged chunk
			 *
			 * @param {any} chunk
			 * @param {any} controller
			 */
			transform: (chunk, controller) => {
				console.log('log', chunk);
				controller.enqueue(chunk);
			}
		};

		super(transformer);
	}
	start() {}
}
