export default class TimestampSource {
  /** @type {number|NodeJS.Timeout|undefined} */
  #interval;

  constructor() {}

  /**
   * Stream start function
   *
   * @param {ReadableStreamDefaultController} ctr
   */
  start(ctr) {
    ctr.enqueue(JSON.stringify({ now: Date.now() }));

    this.#interval = setInterval(() => {
      return ctr.enqueue(JSON.stringify({ now: Date.now() }));
    }, 1000);
  }

  /**
   * Stop generation of new stream output
   */
  cancel() {
    clearInterval(this.#interval);
  }
}
