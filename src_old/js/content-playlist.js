import DOMUtils from './common/dom-helper';

{
  const CONSTANTS = {
    INJECT_INTERVAL: 1000,
    TAB_URL: document.location.href,
    URL_PATTERN: /^[^\/]+:\/\/soundcloud\.com\/[^\/]+\/sets\/[^\/]+$/,
  };

  if (document.location.href.match(CONSTANTS.URL_PATTERN)) {
    let isDownloadingPlaylist;
    let timeoutId;
    let showLabelOnPlaylistDownloadButton;

    let setPlaylistDownloadStartedState = () => {
      isDownloadingPlaylist = true;
      let downloadButton = document.querySelector('#zcPlaylistDownloadBtn');
      downloadButton.classList.remove('zc-button-download');
      downloadButton.classList.add('zc-button-stop', 'sc-button-active');
      downloadButton.setAttribute('title', 'Stop downloading playlist');
      if (showLabelOnPlaylistDownloadButton) {
        downloadButton.innerHTML = 'Stop Download';
      }
    };

    let setPlaylistDownloadStoppedState = () => {
      isDownloadingPlaylist = false;
      let downloadButton = document.querySelector('#zcPlaylistDownloadBtn');
      downloadButton.classList.remove('sc-button-active', 'zc-button-stop');
      downloadButton.classList.add('zc-button-download');
      downloadButton.setAttribute('title', 'Download this playlist');
      if (showLabelOnPlaylistDownloadButton) {
        downloadButton.innerHTML = 'Download';
      }
    };

    chrome.runtime.onMessage.addListener((request) => {
      switch (request.message) {
        case 'playlistDownloadStarted':
          setPlaylistDownloadStartedState();
          break;
        case 'playlistDownloadStopped':
          setPlaylistDownloadStoppedState();
          break;
      }
    });

    let startPlaylistDownload = () => {
      chrome.runtime.sendMessage({
        message: 'startPlaylistDownload',
        tabUrl: CONSTANTS.TAB_URL,
      });
      setPlaylistDownloadStartedState();
    };

    let stopPlaylistDownload = () => {
      chrome.runtime.sendMessage({message: 'stopPlaylistDownload'});
    };

    let onPlaylistDownloadButtonClick = () => {
      isDownloadingPlaylist ? stopPlaylistDownload()
        : startPlaylistDownload();
    };

    let getPlaylistDownloadState = () => {
      chrome.runtime.sendMessage({message: 'getPlaylistDownloadState'},
        (response) =>
          response.isDownloadingPlaylist ? setPlaylistDownloadStartedState()
          : setPlaylistDownloadStoppedState()
      );
    };

    let addPlaylistDownloadButton = () => {
      let soundActionsToolbar = document.querySelector(
        'div[class~="listenEngagement"] div[class~="soundActions"]');
      let downloadButton = DOMUtils.createElement(
        'button', {
          class: 'sc-button sc-button-medium',
          id: 'zcPlaylistDownloadBtn',
        }, {
          onclick: onPlaylistDownloadButtonClick,
        });

      showLabelOnPlaylistDownloadButton = DOMUtils.selectDescendant(
        soundActionsToolbar, '.sc-button-responsive');
      if (showLabelOnPlaylistDownloadButton) {
        downloadButton.classList.add('sc-button-responsive');
      } else {
        downloadButton.classList.add('sc-button-icon');
      }

      let soundActionChildren = DOMUtils.selectDescendant(
        soundActionsToolbar, 'div', {selectAll: true, selectChildren: true});
      let lastChild = soundActionChildren[soundActionChildren.length - 1];

      if (soundActionChildren.length > 1
        && DOMUtils.selectDescendant(lastChild, 'button')) {
        let downloadButtonContainer = DOMUtils.createElement('div', {
          class: 'sc-button-group',
          id: 'zcPlaylistDownloadBtnContainer',
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

    let removePlaylistDownloadButton = () => {
      DOMUtils.removeAll('#zcPlaylistDownloadBtn');
      DOMUtils.removeAll('#zcPlaylistDownloadBtnContainer');
    };

    let injectPlaylistDownloadButton = () => {
      if (document.location.href !== CONSTANTS.TAB_URL) {
        removePlaylistDownloadButton();
        clearTimeout(timeoutId);
        return;
      }

      timeoutId = setTimeout(() => {
        if (!document.querySelector('#zcPlaylistDownloadBtn')) {
          addPlaylistDownloadButton();
          getPlaylistDownloadState();
        }
        injectPlaylistDownloadButton();
      }, CONSTANTS.INJECT_INTERVAL);
    };

    injectPlaylistDownloadButton();
  }
}
