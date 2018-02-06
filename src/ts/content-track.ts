import {bootstrapContentScript} from './bootstrap';

bootstrapContentScript('zc-content-track', loadScriptPredicate, onScriptLoad);

// window.addEventListener('popstate', () => console.log('On popstate'));
/*window.addEventListener('message', (event) => {
  // We only accept messages from ourselves
  if (event.source !== window) {
    return;
  }

  if (event.data.type && (event.data.type === 'CLOSE_SCRIPT')) {
    console.log('Closing content script...');
  }
}, false);*/

/*  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'CLOSE_CONTENT_TRACK') {
      console.log('Closing content script...');
    }
  });*/

function onScriptLoad() {
  console.log('(ZC): Loaded track content script');
}

function loadScriptPredicate(): boolean {
  const TRACK_URL_PATTERN = /^[^:]*:\/\/soundcloud\.com\/([^\/]+)\/([^\/]+)(?:\?in=.+)?$/;
  const TRACK_URL_BLACKLIST_1 = ['you', 'charts', 'pages', 'settings', 'jobs', 'tags', 'stations'];
  const TRACK_URL_BLACKLIST_2 = ['stats'];
  const matchResults = TRACK_URL_PATTERN.exec(document.location.href);
  return matchResults &&
    (TRACK_URL_BLACKLIST_1.indexOf(matchResults[1]) < 0) &&
    (TRACK_URL_BLACKLIST_2.indexOf(matchResults[2]) < 0);
}
