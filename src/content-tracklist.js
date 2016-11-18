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
  var Utils = {
    setIdIfNotExists: function (element, id) {
      if (!element.id) {
        element.id = id;
      }
      return element.id;
    },
    createButton: function (properties) {
      var button = document.createElement('button');
      button.setAttribute('class', properties.class);
      button.onclick = properties.click;
      button.title = properties.title;
      button.innerHTML = properties.text;
      return button;
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
        CONSTANTS.SELECTORS.TRACK_LIST + ' ' + CONSTANTS.SELECTORS.TRACK_ITEM);
      var injectedButtons = document.querySelectorAll(
        CONSTANTS.SELECTORS.TRACK_LIST + ' ' + CONSTANTS.SELECTORS.ZC_BUTTON);
      if (injectedButtons.length >= trackItems.length) {
        return;
      }
      trackItems.forEach(function (trackItem, index) {
        var trackItemSelector = '#' + Utils.setIdIfNotExists(trackItem, CONSTANTS.ID_PREFIXES.TRACK_ITEM + index);
        var buttonGroup = document.querySelector(trackItemSelector + ' ' + CONSTANTS.SELECTORS.BUTTON_GROUP);
        if (!buttonGroup) {
          return;
        }
        var buttonGroupSelector = '#' + Utils.setIdIfNotExists(buttonGroup, CONSTANTS.ID_PREFIXES.BUTTON_GROUP + index);
        if (document.querySelector(buttonGroupSelector + ' ' + CONSTANTS.SELECTORS.ZC_BUTTON)) {
          return;
        }
        var buttons = document.querySelectorAll(buttonGroupSelector + ' button');
        var lastButton = buttons[buttons.length - 1];
        var titleLink = document.querySelector(trackItemSelector + ' ' + CONSTANTS.SELECTORS.TRACK_TITLE);
        if (lastButton && titleLink) {
          var trackUrl = CONSTANTS.SC_URL + titleLink.getAttribute('href');
          var downloadButton = Utils.createButton({
            class: CONSTANTS.CLASSES.SC_BUTTON.concat(CONSTANTS.CLASSES.ZC_BUTTON).join(' '),
            click: onDownloadButtonClick(trackUrl),
            title: 'Download this track',
            text: 'Download this track'
          });
          lastButton.parentNode.insertBefore(downloadButton, lastButton);
        }
      });
    };
    var removeDownloadButtons = function () {
      document.querySelectorAll(CONSTANTS.SELECTORS.ZC_BUTTON).forEach(function (button) {
        button.parentNode.removeChild(button);
      });
      clearTimeout(timeoutId);
    };
    var injectDownloadButtons = function () {
      if (document.location.href !== CONSTANTS.TAB_URL) {
        removeDownloadButtons();
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