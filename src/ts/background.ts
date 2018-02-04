chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  console.log('On tab updated: ', tabId, changeInfo);
});
