export class WEventDOMPlugin {
  constructor(handler, element, eventName, scopeParent) {
    this.element = element;
    this.handler = handler;
    this.eventName = eventName;
    this.scopeParent = scopeParent;
    this.hasListeners = this.hasListeners.bind(this);
    this.getEventName = this.getEventName.bind(this);
    this.fireEvent = this.fireEvent.bind(this);

    this.parsedExp = undefined;
  }

  hasListeners() {
    return !!this.element.attr(this.eventName);
  }

  getEventName() {
    return this.eventName;
  }

  fireEvent($event) {
    let expression = this.element.getAttribute(this.eventName);

    if (!expression) {
      expression = this.element.getAttribute('w-' + this.eventName);
    }

    if (expression) {
      //tem que melhorar deveria somente fazer apply sem se importar com o nome dos parametros
      const func = new Function(
        'event',
        '$event',
        '$handler',
        'scopeParent',
        `scopeParent.${expression}`
      );
      func.apply(null, [this, $event, this.handler, this.scopeParent]);
    }
  }
}
