chrome.runtime.onMessage.addListener((message) => {
  console.log(message);
  chrome.downloads.download({url: message});
});
