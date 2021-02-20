export class WEventDef {
  constructor(handler) {
    this.handler = handler;
    this.listeners = [];
    this.addListener = this.addListener.bind(this);
    this.removeListener = this.removeListener.bind(this);
    this.cleanListeners = this.cleanListeners.bind(this);
    this.getListeners = this.getListeners.bind(this);
    this.hasListeners = this.hasListeners.bind(this);
    this.setPlugin = this.setPlugin.bind(this);
    this.setHandler = this.setHandler.bind(this);
    this.getHandler = this.getHandler.bind(this);
    this.getPlugin = this.getPlugin.bind(this);
    this.fireEvent = this.fireEvent.bind(this);
    this.fireEventAsync = this.fireEventAsync.bind(this);
    this.fireDeferredEvent = this.fireDeferredEvent.bind(this);
    this.plugin = null;
    this.eventName = undefined;
  }

  addListener(fn) {
    this.listeners.push(fn);
    return () => this.removeListener(fn);
  }

  removeListener(fn) {
    let index = this.listeners.indexOf(fn);
    return -1 < index && !!this.listeners.splice(index, 1);
  }

  cleanListeners() {
    this.listeners = [];
  }

  getListeners() {
    return this.listeners;
  }

  hasListeners() {
    return (
      !this.plugin || this.plugin.hasListeners() || this.listeners.length > 0
    );
  }

  setPlugin(_plugin) {
    this.plugin = _plugin;
    this.eventName = this.plugin && this.plugin.getEventName();
  }

  getPlugin() {
    return this.plugin;
  }

  setHandler(_handler) {
    this.handler = _handler;
  }

  getHandler() {
    return this.handler;
  }

  fireEvent(event) {
    try {
      this.plugin && this.plugin.fireEvent(event);
    } catch (error) {
      //console.error(error);
    }

    let listenersCopy = [...this.getListeners()];
    for (let listener of listenersCopy) {
      try {
        listener(event, this.handler);
      } catch (error) {
        // console.error(error);
      }
    }
  }

  async fireEventAsync(event) {
    this.fireEvent(event);
  }

  fireDeferredEvent(event) {
    let promises = [];

    let plugResult = this.plugin && this.plugin.fireEvent(event);
    if (plugResult) {
      promises.push(plugResult);
    }

    for (let listener of this.getListeners()) {
      promises.push(listener(event, this.handler));
    }

    if (promises.length > 0) {
      return Promise.all(promises);
    }

    return Promise.resolve();
  }
}
