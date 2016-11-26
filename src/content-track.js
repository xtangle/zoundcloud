(function () {
  var CONSTANTS = {
    TAB_URL: document.location.href,
    URL_PATTERN: /^[^\/]+:\/\/soundcloud\.com\/[^\/]+\/(?:[^\/]+$)|(?:[^\/]+(?=(?:\?in=)).+$)/,
    INJECT_INTERVAL: 1000,
    MAX_FAILED_INJECTS: 10,
    IDS: {
      ZC_BUTTON: 'zcTrackDlButton',
      ZC_BUTTON_GROUP: 'zcTrackDlButtonGroup'
    },
    CLASSES: {
      BUTTON_ICON: 'sc-button-icon',
      BUTTON_RESPONSIVE: 'sc-button-responsive',
      SC_BUTTON: ['sc-button', 'sc-button-medium'],
      ZC_BUTTON: 'zc-button-download',
      ZC_BUTTON_GROUP: 'zc-button-group'
    },
    SELECTORS: {
      BUTTON_RESPONSIVE: '.sc-button-responsive',
      SOUND_ACTIONS: '.listenEngagement .soundActions',
      SOUND_ACTIONS_2: '.soundActions.soundActions__medium',
      ZC_BUTTON: '#zcTrackDlButton',
      ZC_BUTTON_GROUP: '#zcTrackDlButtonGroup'
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
    var failedInjects = 0;
    var onDownloadButtonClick = function () {
      // TODO: move all sendMessage calls to a Messenger object
      chrome.runtime.sendMessage({
        message: 'startTrackDownload',
        tabUrl: CONSTANTS.TAB_URL
      });
    };
    var addDownloadButton = function () {
      var soundActionsToolbar = document.querySelector(CONSTANTS.SELECTORS.SOUND_ACTIONS);
      if (!soundActionsToolbar) {
        soundActionsToolbar = document.querySelector(CONSTANTS.SELECTORS.SOUND_ACTIONS_2);
      }
      if (!soundActionsToolbar) {
        failedInjects++;
        return;
      }
      var downloadButton = DOMUtils.createElement(
        'button', {
          id: CONSTANTS.IDS.ZC_BUTTON,
          class: CONSTANTS.CLASSES.SC_BUTTON.concat(CONSTANTS.CLASSES.ZC_BUTTON).join(' ')
        }, {
          onclick: onDownloadButtonClick,
          title: 'Download this track'
        }
      );
      if (DOMUtils.selectDescendant(soundActionsToolbar, CONSTANTS.SELECTORS.BUTTON_RESPONSIVE)) {
        downloadButton.classList.add(CONSTANTS.CLASSES.BUTTON_RESPONSIVE);
        downloadButton.innerHTML = 'Download';
      } else {
        downloadButton.classList.add(CONSTANTS.CLASSES.BUTTON_ICON);
      }
      var soundActionChildren = DOMUtils.selectDescendant(soundActionsToolbar, 'div',
        {selectAll: true, selectChildren: true});
      var lastChild = soundActionChildren[soundActionChildren.length - 1];
      if (soundActionChildren.length > 1 && DOMUtils.selectDescendant(lastChild, 'button')) {
        var downloadButtonContainer = DOMUtils.createElement('div', {
          id: CONSTANTS.IDS.ZC_BUTTON_GROUP,
          class: CONSTANTS.CLASSES.ZC_BUTTON_GROUP
        });
        downloadButtonContainer.appendChild(downloadButton);
        soundActionsToolbar.appendChild(downloadButtonContainer);
      } else {
        var buttonGroup = soundActionChildren[0];
        var buttonsInGroup = DOMUtils.selectDescendant(buttonGroup, 'button', {selectAll: true, selectChildren: true});
        var lastButtonInGroup = buttonsInGroup[buttonsInGroup.length - 1];
        if (lastButtonInGroup.classList.contains('sc-button-more')) {
          lastButtonInGroup.parentNode.insertBefore(downloadButton, lastButtonInGroup);
        } else {
          buttonGroup.appendChild(downloadButton);
        }
      }
    };
    var injectTrackDownloadButton = function () {
      if (document.location.href !== CONSTANTS.TAB_URL || failedInjects >= CONSTANTS.MAX_FAILED_INJECTS) {
        DOMUtils.removeAll(CONSTANTS.SELECTORS.ZC_BUTTON);
        DOMUtils.removeAll(CONSTANTS.SELECTORS.ZC_BUTTON_GROUP);
        clearTimeout(timeoutId);
        return;
      }
      timeoutId = setTimeout(function () {
        if (!document.querySelector(CONSTANTS.SELECTORS.ZC_BUTTON)) {
          addDownloadButton();
        }
        injectTrackDownloadButton();
      }, CONSTANTS.INJECT_INTERVAL);
    };
    injectTrackDownloadButton();
  }
})();
