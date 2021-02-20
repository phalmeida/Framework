import Component from './component';

function createBaseComponent(template, definition) {
  return {
    restrict: 'E',
    replace: false,
    template: template,
    scope: {},
    ...definition
  };
}

export default function createComponent(
  template,
  handler,
  domHandler,
  definition = null
) {
  return function($compile, $injector) {
    'ngInject';

    return {
      link: function($scope, $element) {
        const component = new Component($scope, handler);
        component.link($element[0], domHandler, $compile, $injector);
        component.fireOnLoad();
      },
      ...createBaseComponent(template, definition)
    };
  };
}
