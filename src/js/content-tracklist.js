import DOMUtils from './common/dom-helper';

{
  const CONSTANTS = {
    CLASSES: {
      SC_BUTTON: [
        'sc-button', 'sc-button-small',
        'sc-button-responsive', 'sc-button-icon',
      ],
      ZC_BUTTON: 'zc-button-download-small',
    },
    INJECT_INTERVAL: 2500,
    SC_URL: 'https://soundcloud.com',
    SELECTORS: {
      BUTTON_GROUP: '.soundActions > .sc-button-group',
      TRACK_ITEM: '.trackItem',
      TRACK_LIST: '.trackList',
      TRACK_TITLE: '.trackItem__trackTitle',
      ZC_BUTTON: '.zc-button-download-small',
    },
    TAB_URL: document.location.href,
    URL_PATTERN: /^[^\/]+:\/\/soundcloud\.com\/[^\/]+\/sets\/[^\/]+$/,
  };

  if (document.location.href.match(CONSTANTS.URL_PATTERN)) {
    let timeoutId;

    let onDownloadButtonClick = (url) => {
      return () => {
        // TODO: move all sendMessage calls to a Messenger object
        chrome.runtime.sendMessage({
          message: 'startTrackDownload',
          tabUrl: url,
        });
      };
    };

    let addDownloadButtons = () => {
      let trackItems = document.querySelectorAll(
        [CONSTANTS.SELECTORS.TRACK_LIST, CONSTANTS.SELECTORS.TRACK_ITEM]
          .join(' '));
      let injectedButtons = document.querySelectorAll(
        [CONSTANTS.SELECTORS.TRACK_LIST, CONSTANTS.SELECTORS.ZC_BUTTON]
          .join(' '));
      if (injectedButtons.length >= trackItems.length) {
        return;
      }

      trackItems.forEach((trackItem) => {
        let buttonGroup = DOMUtils.selectDescendant(trackItem,
          CONSTANTS.SELECTORS.BUTTON_GROUP);
        if (!buttonGroup
          || DOMUtils.selectDescendant(buttonGroup,
            CONSTANTS.SELECTORS.ZC_BUTTON)) {
          return;
        }

        let buttons = DOMUtils.selectDescendant(buttonGroup,
          'button', {selectAll: true});
        let lastButton = buttons[buttons.length - 1];
        let titleLink = DOMUtils.selectDescendant(trackItem,
          CONSTANTS.SELECTORS.TRACK_TITLE);

        if (lastButton && titleLink) {
          let trackUrl = CONSTANTS.SC_URL + titleLink.getAttribute('href');
          let downloadButton = DOMUtils.createElement(
            'button', {
              class: CONSTANTS.CLASSES.SC_BUTTON
                .concat(CONSTANTS.CLASSES.ZC_BUTTON).join(' '),
            }, {
              onclick: onDownloadButtonClick(trackUrl),
              text: 'Download this track',
              title: 'Download this track',
            });
          lastButton.parentNode.insertBefore(downloadButton, lastButton);
        }
      });
    };

    let injectDownloadButtons = () => {
      if (document.location.href !== CONSTANTS.TAB_URL) {
        DOMUtils.removeAll(CONSTANTS.SELECTORS.ZC_BUTTON);
        clearTimeout(timeoutId);
        return;
      }
      timeoutId = setTimeout(() => {
        addDownloadButtons();
        injectDownloadButtons();
      }, CONSTANTS.INJECT_INTERVAL);
    };

    injectDownloadButtons();
  }
}
