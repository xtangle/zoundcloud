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
  if (document.location.href.match(CONSTANTS.URL_PATTERN)) {
    const DOMUtils = require('./common/dom-helper');
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