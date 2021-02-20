/**
 * @typedef {import('./wStore').WStore} WStore
 */

export default class TasyHandler {
  /** @type {WStore} */
  store;

  constructor(store) {
    this.store = store;
  }

  expose(properties = null) {
    const handler = {};

    if (properties != null) {
      for (const property of properties) {
        handler[property] = this[property].bind(this);
      }
    }

    return handler;
  }
}
