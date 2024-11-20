/*

Automaticaly mute chrome tab when twitch ads are playing

ref:
https://developer.chrome.com/docs/extensions/reference/api/tabs#mute
https://developer.chrome.com/docs/extensions/reference/api/runtime#event-onMessage
https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver

*/

console.log("initializing 'mute-twitch-ads'");

// store ad running state to global scope
const adElementQuery = '[data-a-target="video-ad-label"]';
let adIsRunning = getInitialAdState(adElementQuery);

function checkForPresenceOfAd(query) {
  let adElement = document.querySelector(query);

  if (adElement && !adIsRunning) {
    console.log("MUTING TAB");
    adIsRunning = true;
    sendMessageToMuteTab();
  } else if (!adElement && adIsRunning) {
    console.log("UNMUTING TAB");
    adIsRunning = false;
    sendMessageToUnmuteTab();
  }
}

function sendMessageToMuteTab() {
  chrome.runtime.sendMessage({
    action: "mute-tab",
  });
}

function sendMessageToUnmuteTab() {
  chrome.runtime.sendMessage({
    action: "unmute-tab",
  });
}

function getInitialAdState(query) {
  let adElement = document.querySelector(query);
  if (adElement) {
    return true;
  } else {
    return false;
  }
}

function main() {
  const observerElement = document.querySelector(".video-player");
  const config = { attributes: true, childList: true, subtree: true };

  if (observerElement) {
    // since loading channel can start with ads, mute if already loaded
    checkForPresenceOfAd(adElementQuery);

    const observer = new MutationObserver(() => {
      checkForPresenceOfAd(adElementQuery);
    });
    observer.observe(observerElement, config);
  }
}

main();
