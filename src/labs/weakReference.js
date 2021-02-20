
//https://github.com/tvcutsem/harmony-reflect/blob/master/doc/traps.md

const noop = () => { };
const WeakContentTag = noop;
const WeakReferenceTag = noop;

class GhostMethodProxy {
    constructor(methodName, realMethod) {
        this.methodName = methodName;
        this.realMethod = realMethod;
        this.proxyObj = {};
        this.proxyObj[methodName] = noop();

        const that = this;
        this.revocable = Proxy.revocable(this.proxyObj, {
            get(target, property) {
                if (property === that.methodName) {
                    return that.realMethod;
                }
                throw 'Impossible situation.'
            }
        });

    }

    setRealObj(realObj) {
        this.realMethod = realObj[this.methodName];
    }

    get() {
        return this.revocable.proxy;
    }

    revoke() {
        this.revocable.revoke();
    }
}

class CollectableHandler {

    constructor(realObj, ghostObj, fullProxy = true) {
        this.ghostObj = ghostObj;
        this.fullProxy = fullProxy;
        this.internalRevocables = {};

        this.setRealObj(realObj);
    }

    setRealObj(realObj) {
        this.realObj = realObj;
        Object.keys(realObj).forEach(key => this.createGhost(key, realObj[key]));
        Object.keys(this.internalRevocables).forEach(i => {
            i = this.internalRevocables[i];
            i.methodProxy.setRealObj(realObj);
        });
    }

    get(target, property) {
        if (this.fullProxy && typeof property !== 'symbol') {
            if (angular.isFunction(this.realObj[property]) && !Object.prototype.hasOwnProperty.call(Object.prototype, property)) {
                let internals = this.internalRevocables;
                if (!Object.prototype.hasOwnProperty.call(internals, property)) {
                    const methodProxy = new GhostMethodProxy(property, this.realObj[property]);

                    const that = this;
                    const fn = function () {
                        return methodProxy.get()[property].apply(that.realObj, arguments);
                    };
                    internals[property] = { methodProxy, fn }
                }
                return internals[property].fn;
            }
        }
        return this.realObj[property];
    }

    set(target, property, value) {
        this.realObj[property] = value;
        this.createGhost(property, value);
        return true;
    }

    apply(target, thisArg, argumentsList) {
        this.realObj[target].apply(thisArg, argumentsList);
    }

    createGhost(key, value) {
        this.ghostObj[key] = angular.isFunction(value) ? noop : null;
    }

    revokeInternals() {
        Object.keys(this.internalRevocables).forEach(i => {
            i = this.internalRevocables[i];
            i.methodProxy.revoke();
            i.methodProxy = null;
            i.fn = null;
        });
    }

}

class WeakReference {

    constructor(content, fullProxy = true) {
        this.realObj = content;
        content.tag = new WeakContentTag()

        this.ghostObj = { tag: new WeakReferenceTag() };

        this.handler = new CollectableHandler(this.realObj, this.ghostObj, fullProxy);
        this.revocable = Proxy.revocable(this.ghostObj, this.handler);
    }

    get() {
        return this.revocable.proxy;
    }

    set(referent) {
        this.realObj = referent;
        this.handler.setRealObj(referent);
    }

    revoke() {
        this.handler.revokeInternals();
        this.revocable.revoke();
        this.handler = null;
        this.realObj = null;
        this.ghostObj = null;
    }
}

export default WeakReference;
export { CollectableHandler };
