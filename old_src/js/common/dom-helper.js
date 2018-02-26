const HASH_PREFIX = 'zc'
  + (Math.random().toString(36) + '000000000000000000').slice(2, 18) + '-';
let idCounter = 0;

export default {

  createElement: (type, attributes, properties) => {
    let element = document.createElement(type);
    Object.keys(attributes).forEach((key) => {
      element.setAttribute(key, attributes[key]);
    });
    Object.keys(properties).forEach((key) => {
      element[key] = properties[key];
    });
    return element;
  },

  removeAll: (selector) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.parentNode.removeChild(element);
    });
  },

  selectDescendant: (element, descendantSelector, options) => {
    if (!element) {
      return;
    }
    if (!element.id) {
      element.id = HASH_PREFIX + idCounter;
      idCounter++;
    }
    let select = document.querySelector;
    let concat = ' ';
    if (options) {
      if (options['selectAll']) {
        select = document.querySelectorAll;
      }
      if (options ['selectChildren']) {
        concat = ' > ';
      }
    }
    return select.call(document,
      ['#' + element.id, descendantSelector].join(concat));
  },

};
