// service worker

muteTabEvent = "mute-tab";
unmuteTabEvent = "unmute-tab";

chrome.runtime.onMessage.addListener(async (message, sender) => {
  if (message.action === muteTabEvent && sender.tab) {
    let tab = sender.tab;
    await chrome.tabs.update(tab.id, { muted: true });
    console.log("Tab muted");
  }
});

chrome.runtime.onMessage.addListener(async (message, sender) => {
  if (message.action === unmuteTabEvent && sender.tab) {
    let tab = sender.tab;
    await chrome.tabs.update(tab.id, { muted: false });
    console.log("Tab unmuted");
  }
});
