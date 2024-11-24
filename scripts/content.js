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
    adIsRunning = true;
    sendMessageToMuteTab();
  } else if (!adElement && adIsRunning) {
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

function attachMutationObserverToVideoPlayer(observerQuery, config) {
  let attached = false;
  let element = document.querySelector(observerQuery);
  let observer = null;

  if (element) {
    // since loading channel can start with ads, mute if already loaded
    checkForPresenceOfAd(adElementQuery);

    observer = new MutationObserver(() => {
      checkForPresenceOfAd(adElementQuery);
    });
    observer.observe(element, config);
    attached = true;
  }
  return [observer, attached];
}

function main() {
  const intervalTimeout = 2000;
  const config = { attributes: true, childList: true, subtree: true };
  let attached = false;
  let observerQuery = ".video-player";
  // main channel (twitch.tv) already has a video-player element so observer may be attached to wrong element?
  // IF NEEDED, maybe use chrome.tabs.onUpdated event to reset the observer

  // initial call
  [observer, attached] = attachMutationObserverToVideoPlayer(
    observerQuery,
    config
  );

  // in cases where video player is not initially found, we want to continously try to attach the MutationObserver to element
  // eg. accessing twitch channel from main page will not initially load the video-player element.
  if (!attached) {
    let intervalId = setInterval(() => {
      [observer, attached] = attachMutationObserverToVideoPlayer(
        observerQuery,
        config
      );
      if (attached) {
        clearInterval(intervalId);
      }
    }, intervalTimeout);
  }

  // if url changes, disconnect existing observer and set a new one on the page
  chrome.runtime.onMessage.addListener(async (message, sender) => {
    if (message.action === "url-changed") {
      if (observer) {
        observer.disconnect();
      }
      [observer, attached] = attachMutationObserverToVideoPlayer(
        observerQuery,
        config
      );
    }
  });
}

main();
