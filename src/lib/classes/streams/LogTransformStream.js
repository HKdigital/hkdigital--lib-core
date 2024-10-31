export default class LogTransformStream extends TransformStream {
	constructor() {
		const transformer = {
			/**
			 * Log the chunk and enqueue the unchanged chunk
			 *
			 * @param {*} chunk
			 * @param {*} controller
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
