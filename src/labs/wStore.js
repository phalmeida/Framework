const _cancelTimeout = Symbol("cancelTimeout");

export function WStoreFactory() {
  return WStore;
}

// Store states and allow subscription to it's value changes
export class WStore {
  constructor(state, parent) {
    this.state = Object.assign({}, state || {});
    this.parent = parent;
    this.subscribers = {};
    this[_cancelTimeout] = {};
  }

  set(attr, val, notify = true) {
    const oldValue = this.state[attr];
    this.state[attr] = val;
    notify && this.notify(attr, val, oldValue);
  }

  get(attr) {
    if (Array.isArray(attr)) {
      const reduced = attr.reduce((previous, current) => {
        const prop = {};
        prop[current] = this.state[current];
        const merged = Object.assign(previous, prop);
        return merged;
      }, {});

      return reduced;
    }

    return this.state[attr];
  }

  getter(attr) {
    return () => this.get(attr);
  }

  setter(attr) {
    return val => this.set(attr, val);
  }

  subscribe(attr, cb) {
    this.subscribers[attr] = this.subscribers[attr] || [];
    this.subscribers[attr].push(cb);
    return () => {
      this.subscribers[attr] = this.subscribers[attr].filter(
        test => test !== cb
      );
    };
  }

  notify(attr, newValue, oldValue) {
    (this.subscribers[attr] || []).forEach(cb => {
      cb(newValue, oldValue);
    });
  }

  notifyAll(recursive) {
    for (let attr in this.state) {
      let val = this.state[attr];
      this.notify(attr, val);
      if (recursive && val && val["notifyAll"]) {
        val.notifyAll();
      }
    }
  }

  notifyOnce(attr, newValue, oldValue) {
    if (this[_cancelTimeout][attr]) {
      clearTimeout(this[_cancelTimeout][attr]);
    }
    this[_cancelTimeout][attr] = setTimeout(() => {
      //eslint-disable-line
      delete this[_cancelTimeout][attr];
      newValue = !newValue ? this.get(attr) : newValue;
      this.notify(attr, newValue, oldValue);
    });
  }

  /**
   * This method notifies all without the states on the list parameter
   *
   * @param {list of exceptions} excpetion
   */
  notifyAllByExcpetions(excpetion = []) {
    for (var attr in this.state) {
      var val = this.state[attr];
      if (!excpetion.includes(attr)) this.notify(attr, val);
    }
  }

  createStore(attr, state) {
    let store = new WStore(state, this);
    this.set(attr, store);
    return store;
  }

  setState(state = {}) {
    this.state = state;
    this.notifyAll();
  }

  getState() {
    return this.state;
  }

  equals(attr1, attr2) {
    return this.get(attr1) === this.get(attr2);
  }

  equalsValue(attr, value) {
    return this.get(attr) === value;
  }

  mergeState(newState, forceNew = false) {
    let names = Object.getOwnPropertyNames(newState);
    names.forEach(name => {
      if (!Object.prototype.hasOwnProperty.call(this.state, name) || forceNew) {
        this.state[name] = newState[name];
      }
    });
  }

  unsubscribable() {
    const _super = this;
    const Unsubscribable = {
      unsubscribers: [],

      subscribe: function() {
        const unsubFn = _super.subscribe.apply(_super, arguments);
        this.unsubscribers.push(unsubFn);

        return () => {
          unsubFn();
          this.unsubscribers.splice(this.unsubscribers.indexOf(unsubFn), 1);
        };
      },

      unsubscribe: function() {
        this.unsubscribers.forEach(unsubFn => unsubFn());
        delete this.unsubscribers;
        return _super;
      }
    };

    return Object.assign(Object.create(this), Unsubscribable);
  }
}
