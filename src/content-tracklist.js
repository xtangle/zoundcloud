(function () {
  var CONSTANTS = {
    TAB_URL: document.location.href,
    URL_PATTERN: /^[^\/]+:\/\/soundcloud\.com\/[^\/]+\/sets\/[^\/]+$/,
    SC_URL: 'https://soundcloud.com',
    INJECT_INTERVAL: 2500,
    ID_PREFIXES: {
      BUTTON_GROUP: 'zcButtonGroup-',
      TRACK_ITEM: 'zcTrackItem-'
    },
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
  var DOMUtils = {
    setIdIfNotExists: function (element, id) {
      if (!element.id) {
        element.id = id;
      }
      return element.id;
    },
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
      trackItems.forEach(function (trackItem, index) {
        var trackItemSelector = '#' + DOMUtils.setIdIfNotExists(trackItem, CONSTANTS.ID_PREFIXES.TRACK_ITEM + index);
        var buttonGroup = document.querySelector([trackItemSelector, CONSTANTS.SELECTORS.BUTTON_GROUP].join(' '));
        if (!buttonGroup) {
          return;
        }
        var buttonGroupSelector = '#' +
          DOMUtils.setIdIfNotExists(buttonGroup, CONSTANTS.ID_PREFIXES.BUTTON_GROUP + index);
        if (document.querySelector([buttonGroupSelector, CONSTANTS.SELECTORS.ZC_BUTTON].join(' '))) {
          return;
        }
        var buttons = document.querySelectorAll([buttonGroupSelector, 'button'].join(' '));
        var lastButton = buttons[buttons.length - 1];
        var titleLink = document.querySelector([trackItemSelector, CONSTANTS.SELECTORS.TRACK_TITLE].join(' '));
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