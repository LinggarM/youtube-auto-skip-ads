# YouTube Auto Skip Ads

A lightweight Chrome extension that clicks YouTube's Skip Ad button once it is visible and enabled. It does not attempt to skip ads that do not provide a skip button.

The extension uses Chrome's `debugger` permission to send a mouse click because YouTube may ignore script-generated clicks. Chrome displays an elevated-permission warning for this API. The service worker only accepts click requests from the top-level `www.youtube.com` page and detaches the debugger after each click attempt.

## Install in Chrome

1. Download or clone this project.
2. Open `chrome://extensions`.
3. Turn on **Developer mode**.
4. Choose **Load unpacked** and select this project folder.
5. Approve Chrome's `debugger` permission warning.
6. Reload any open YouTube tabs.

The content script only runs on `https://www.youtube.com/`. The `debugger` permission is broader than that host restriction; the service worker validates the sender and only attaches to a YouTube tab for the click attempt. Close DevTools for the YouTube tab if Chrome refuses to attach the debugger.
