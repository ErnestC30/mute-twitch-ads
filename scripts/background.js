// service worker

muteTabEvent = "mute-tab";
unmuteTabEvent = "unmute-tab";
twitchDomain = "https://www.twitch.tv/";

chrome.runtime.onMessage.addListener(async (message, sender) => {
  if (message.action === muteTabEvent && sender.tab) {
    let tab = sender.tab;
    await chrome.tabs.update(tab.id, { muted: true });
  }
});

chrome.runtime.onMessage.addListener(async (message, sender) => {
  if (message.action === unmuteTabEvent && sender.tab) {
    let tab = sender.tab;
    await chrome.tabs.update(tab.id, { muted: false });
  }
});

// on url change, want to submit event to reset mutationobserver
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url?.startsWith(twitchDomain)) {
    chrome.tabs.sendMessage(tabId, { action: "url-changed" });
  }
});
