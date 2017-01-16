(function () {
  var CONSTANTS = {
    TAB_URL: document.location.href,
    URL_PATTERN: /^[^\/]+:\/\/soundcloud\.com\/[^\/]+\/sets\/[^\/]+$/,
    SC_URL: 'https://soundcloud.com',
    INJECT_INTERVAL: 2500,
    CLASSES: {
      SC_BUTTON: ['sc-button', 'sc-button-small', 'sc-button-responsive', 'sc-button-icon'],
      ZC_BUTTON: 'zc-button-download-small'
    },
    SELECTORS: {
      BUTTON_GROUP: '.soundActions > .sc-button-group',
      TRACK_LIST: '.trackList',
      TRACK_ITEM: '.trackItem',
      TRACK_TITLE: '.trackItem__trackTitle',
      ZC_BUTTON: '.zc-button-download-small'
    }
  };
  /*
   import dom-utils.js
   */
  var DOMUtils = {
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
  if (document.location.href.match(CONSTANTS.URL_PATTERN)) {
    var timeoutId;
    var onDownloadButtonClick = function (url) {
      return function () {
        // TODO: move all sendMessage calls to a Messenger object
        chrome.runtime.sendMessage({
          message: 'startTrackDownload',
          tabUrl: url
        });
      }
    };
    var addDownloadButtons = function () {
      var trackItems = document.querySelectorAll(
        [CONSTANTS.SELECTORS.TRACK_LIST, CONSTANTS.SELECTORS.TRACK_ITEM].join(' '));
      var injectedButtons = document.querySelectorAll(
        [CONSTANTS.SELECTORS.TRACK_LIST, CONSTANTS.SELECTORS.ZC_BUTTON].join(' '));
      if (injectedButtons.length >= trackItems.length) {
        return;
      }
      trackItems.forEach(function (trackItem) {
        var buttonGroup = DOMUtils.selectDescendant(trackItem, CONSTANTS.SELECTORS.BUTTON_GROUP);
        if (!buttonGroup) {
          return;
        }
        if (DOMUtils.selectDescendant(buttonGroup, CONSTANTS.SELECTORS.ZC_BUTTON)) {
          return;
        }
        var buttons = DOMUtils.selectDescendant(buttonGroup, 'button', {selectAll: true});
        var lastButton = buttons[buttons.length - 1];
        var titleLink = DOMUtils.selectDescendant(trackItem, CONSTANTS.SELECTORS.TRACK_TITLE);
        if (lastButton && titleLink) {
          var trackUrl = CONSTANTS.SC_URL + titleLink.getAttribute('href');
          var downloadButton = DOMUtils.createElement(
            'button', {
              class: CONSTANTS.CLASSES.SC_BUTTON.concat(CONSTANTS.CLASSES.ZC_BUTTON).join(' ')
            }, {
              onclick: onDownloadButtonClick(trackUrl),
              title: 'Download this track',
              text: 'Download this track'
            });
          lastButton.parentNode.insertBefore(downloadButton, lastButton);
        }
      });
    };
    var injectDownloadButtons = function () {
      if (document.location.href !== CONSTANTS.TAB_URL) {
        DOMUtils.removeAll(CONSTANTS.SELECTORS.ZC_BUTTON);
        clearTimeout(timeoutId);
        return;
      }
      timeoutId = setTimeout(function () {
        addDownloadButtons();
        injectDownloadButtons();
      }, CONSTANTS.INJECT_INTERVAL);
    };
    injectDownloadButtons();
  }
})();