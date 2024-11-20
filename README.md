Custom chrome extension to mute chrome tab when a twitch ad is playing

NOTES:

- content.js => catches when twitch ad is running, then sends message to service worker
- background.js => service worker that handles muting of chrome tab
