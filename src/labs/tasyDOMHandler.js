/**
 * @typedef {import('./wStore').WStore} WStore
 */

export default class TasyDOMHandler {
  /**
   * @param {HTMLElement} element
   * @param handler
   * @param {WStore} store
   * @param scope
   * @param compile
   * @param injector
   */
  constructor(element, handler, store, scope, compile, injector) {
    this.element = element;
    this.handler = handler;
    this.store = store;
    this.compile = compile;
    this.injector = injector;

    this.compileTemplate = template => {
      this.compileTemplateScope(template, scope);
    };

    this.createComponentChild = (template, container, selector) => {
      this.createComponent(template, container, selector, scope);
    };
  }

  animate(element, properties, duration, easing, complete) {
    $(element).animate(properties, duration, easing, complete);
  }

  compileTemplateScope(template, scope) {
    this.compile(template)(scope);
  }

  /**
   * @param {string|HTMLElement} template The template or element to be compiled.
   * @param {string|HTMLElement} container The container selector or element to append the compiled component.
   * @param {string} selector The component selector to check if it already exists before appending.
   * @param scope The angular scope to which the component will be linked.
   */
  createComponent(template, container, selector, scope) {
    const containerElement =
      typeof container === 'string'
        ? this.element.querySelector(container)
        : container;

    if (!selector || containerElement.querySelector(selector) == null) {
      const component = this.compile(template)(scope);
      component.appendTo(containerElement);
    }
  }

  destroy() {
    this.element = null;
    this.handler = null;
    this.store = null;
  }
}
