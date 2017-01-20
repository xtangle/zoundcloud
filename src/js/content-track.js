import DOMUtils from './common/dom-helper';

{
  const CONSTANTS = {
    CLASSES: {
      BUTTON_ICON: 'sc-button-icon',
      BUTTON_RESPONSIVE: 'sc-button-responsive',
      SC_BUTTON: ['sc-button', 'sc-button-medium'],
      ZC_BUTTON: 'zc-button-download',
      ZC_BUTTON_GROUP: 'zc-button-group',
    },
    IDS: {
      ZC_BUTTON: 'zcTrackDlButton',
      ZC_BUTTON_GROUP: 'zcTrackDlButtonGroup',
    },
    INJECT_INTERVAL: 1000,
    MAX_FAILED_INJECTS: 10,
    SELECTORS: {
      BUTTON_RESPONSIVE: '.sc-button-responsive',
      SOUND_ACTIONS: '.listenEngagement .soundActions',
      SOUND_ACTIONS_2: '.soundActions.soundActions__medium',
      ZC_BUTTON: '#zcTrackDlButton',
      ZC_BUTTON_GROUP: '#zcTrackDlButtonGroup',
    },
    TAB_URL: document.location.href,
    URL_PATTERN: new RegExp(''
      + /^[^\/]+:\/\/soundcloud\.com\//.source
      + /[^\/]+\/(?:[^\/]+$)|(?:[^\/]+(?=(?:\?in=)).+$)/.source
    ),
  };

  if (document.location.href.match(CONSTANTS.URL_PATTERN)) {
    let timeoutId;
    let failedInjects = 0;

    let onDownloadButtonClick = () => {
      // TODO: move all sendMessage calls to a Messenger object
      chrome.runtime.sendMessage({
        message: 'startTrackDownload',
        tabUrl: CONSTANTS.TAB_URL,
      });
    };

    let addDownloadButton = () => {
      let soundActionsToolbar = document.querySelector(
        CONSTANTS.SELECTORS.SOUND_ACTIONS);
      if (!soundActionsToolbar) {
        soundActionsToolbar = document.querySelector(
          CONSTANTS.SELECTORS.SOUND_ACTIONS_2);
      }
      if (!soundActionsToolbar) {
        failedInjects++;
        return;
      }

      let downloadButton = DOMUtils.createElement(
        'button', {
          class: CONSTANTS.CLASSES.SC_BUTTON
            .concat(CONSTANTS.CLASSES.ZC_BUTTON).join(' '),
          id: CONSTANTS.IDS.ZC_BUTTON,
        }, {
          onclick: onDownloadButtonClick,
          title: 'Download this track',
        }
      );

      if (DOMUtils.selectDescendant(soundActionsToolbar,
          CONSTANTS.SELECTORS.BUTTON_RESPONSIVE)) {
        downloadButton.classList.add(CONSTANTS.CLASSES.BUTTON_RESPONSIVE);
        downloadButton.innerHTML = 'Download';
      } else {
        downloadButton.classList.add(CONSTANTS.CLASSES.BUTTON_ICON);
      }

      let soundActionChildren = DOMUtils.selectDescendant(
        soundActionsToolbar, 'div', {selectAll: true, selectChildren: true});
      let lastChild = soundActionChildren[soundActionChildren.length - 1];

      if (soundActionChildren.length > 1
        && DOMUtils.selectDescendant(lastChild, 'button')) {
        let downloadButtonContainer = DOMUtils.createElement('div', {
          class: CONSTANTS.CLASSES.ZC_BUTTON_GROUP,
          id: CONSTANTS.IDS.ZC_BUTTON_GROUP,
        });
        downloadButtonContainer.appendChild(downloadButton);
        soundActionsToolbar.appendChild(downloadButtonContainer);
      } else {
        let buttonGroup = soundActionChildren[0];
        let buttonsInGroup = DOMUtils.selectDescendant(
          buttonGroup, 'button', {selectAll: true, selectChildren: true});
        let lastButtonInGroup = buttonsInGroup[buttonsInGroup.length - 1];
        if (lastButtonInGroup.classList.contains('sc-button-more')) {
          lastButtonInGroup.parentNode
            .insertBefore(downloadButton, lastButtonInGroup);
        } else {
          buttonGroup.appendChild(downloadButton);
        }
      }
    };

    let injectTrackDownloadButton = () => {
      if (document.location.href !== CONSTANTS.TAB_URL
        || failedInjects >= CONSTANTS.MAX_FAILED_INJECTS) {
        DOMUtils.removeAll(CONSTANTS.SELECTORS.ZC_BUTTON);
        DOMUtils.removeAll(CONSTANTS.SELECTORS.ZC_BUTTON_GROUP);
        clearTimeout(timeoutId);
        return;
      }

      timeoutId = setTimeout(() => {
        if (!document.querySelector(CONSTANTS.SELECTORS.ZC_BUTTON)) {
          addDownloadButton();
        }
        injectTrackDownloadButton();
      }, CONSTANTS.INJECT_INTERVAL);
    };

    injectTrackDownloadButton();
  }
}
