module.exports = {
  createElement: function (type, attributes, properties) {
    var element = document.createElement(type);
    Object.keys(attributes).forEach(function (key) {
      element.setAttribute(key, attributes[key]);
    });
    Object.keys(properties).forEach(function (key) {
      element[key] = properties[key];
    });
    return element;
  },
  selectDescendant: (function () {
    var hash = 'zc' + (Math.random().toString(36) + '000000000000000000').slice(2, 18) + '-';
    var counter = 0;
    return function (element, descendantSelector, options) {
      if (!element) {
        return;
      }
      if (!element.id) {
        element.id = hash + counter;
        counter++;
      }
      var select = document.querySelector;
      var concat = ' ';
      if (options) {
        if (options['selectAll']) {
          select = document.querySelectorAll;
        }
        if (options ['selectChildren']) {
          concat = ' > ';
        }
      }
      return select.call(document, ['#' + element.id, descendantSelector].join(concat));
    }
  })(),
  removeAll: function (selector) {
    document.querySelectorAll(selector).forEach(function (element) {
      element.parentNode.removeChild(element);
    });
  }
};
