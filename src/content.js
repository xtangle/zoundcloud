var urlPattern = /^[^\/]+:\/\/soundcloud\.com\/[^\/]+\/sets\/[^\/]+$/;
var tabUrl = document.location.href;

if (tabUrl.match(urlPattern)) {

  var isDownloading;
  var timeoutId;
  var timeoutInterval = 1000;

  function injectDownloadButton() {

    if (document.location.href !== tabUrl) {
      $('#zcDownloadBtn').remove();
      clearTimeout(timeoutId);
      return;
    }

    timeoutId = setTimeout(function () {
      if ($('#zcDownloadBtn').length === 0) {

        function stopDownload() {
          chrome.runtime.sendMessage({message: "stopDownload"});
        }

        function downloadPlaylist() {
          chrome.runtime.sendMessage({
            message: "startDownload",
            tabUrl: tabUrl
          });
        }

        function setDownloadStartedState() {
          isDownloading = true;
          $('#zcDownloadBtn').text('Stop Download');
        }

        function setDownloadStoppedState() {
          isDownloading = false;
          $('#zcDownloadBtn').text('Download Playlist');
        }

        function onDownloadButtonClick() {
          if (isDownloading) {
            stopDownload();
          } else {
            downloadPlaylist();
            $('#zcDownloadBtn').text('Stop Download');
          }
        }

        function getInitialDownloadState() {
          chrome.runtime.sendMessage({message: "getDownloadState"}, function (response) {
            if (response.isDownloading) {
              setDownloadStartedState();
            } else {
              setDownloadStoppedState();
            }
          });
        }

        function addDownloadButton() {
          var soundActionsToolbar = $("div[class~='listenEngagement'] div[class~='soundActions']").first();
          var downloadButton = $('<button>', {
            id: 'zcDownloadBtn',
            class: 'sc-button-medium sc-button',
            click: onDownloadButtonClick
          });

          if (soundActionsToolbar.children('div').length === 1) {
            var buttonGroup = soundActionsToolbar.children().first();
            buttonGroup.append(downloadButton);
          } else {
            var downloadButtonContainer = $("<div>", {
              id: 'zcDownloadBtnContainer',
              class: 'sc-button-group'
            });
            downloadButtonContainer.append(downloadButton);
            soundActionsToolbar.append(downloadButtonContainer);
          }
        }

        chrome.runtime.onMessage.addListener(function (request) {
          switch (request.message) {
            case 'downloadStarted':
              setDownloadStartedState();
              break;
            case 'downloadStopped':
              setDownloadStoppedState();
              break;
          }
        });

        addDownloadButton();
        getInitialDownloadState();
      }

      injectDownloadButton();

    }, timeoutInterval);
  }

  injectDownloadButton();

}
