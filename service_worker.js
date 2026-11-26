function attachDebugger(target) {
  return new Promise((resolve, reject) => {
    chrome.debugger.attach(target, "1.3", () => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(error.message));
      } else {
        resolve();
      }
    });
  });
}

function sendCommand(target, method, params) {
  return new Promise((resolve, reject) => {
    chrome.debugger.sendCommand(target, method, params, () => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(error.message));
      } else {
        resolve();
      }
    });
  });
}

function detachDebugger(target) {
  return new Promise((resolve, reject) => {
    chrome.debugger.detach(target, () => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(error.message));
      } else {
        resolve();
      }
    });
  });
}

async function clickWithMouse(target, x, y) {
  let attached = false;
  let failure;

  try {
    await attachDebugger(target);
    attached = true;
    await sendCommand(target, "Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x,
      y,
      pointerType: "mouse"
    });
    await sendCommand(target, "Input.dispatchMouseEvent", {
      type: "mousePressed",
      x,
      y,
      button: "left",
      buttons: 1,
      clickCount: 1,
      pointerType: "mouse"
    });
    await sendCommand(target, "Input.dispatchMouseEvent", {
      type: "mouseReleased",
      x,
      y,
      button: "left",
      buttons: 0,
      clickCount: 1,
      pointerType: "mouse"
    });
  } catch (error) {
    failure = error;
  }

  if (attached) {
    try {
      await detachDebugger(target);
    } catch (error) {
      if (failure) {
        console.error("[YouTube Auto Skip Ads] Could not detach debugger:", error);
      } else {
        failure = error;
      }
    }
  }

  if (failure) {
    throw failure;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.type !== "skip-ad-mouse-click") {
    return false;
  }

  const senderUrl = sender.url || "";
  const tabId = sender.tab && sender.tab.id;
  if (sender.frameId !== 0
    || !/^https:\/\/www\.youtube\.com\//.test(senderUrl)
    || typeof tabId !== "number"
    || !Number.isFinite(message.x)
    || !Number.isFinite(message.y)) {
    sendResponse({ ok: false, error: "Refusing to click outside a YouTube page." });
    return false;
  }

  clickWithMouse({ tabId }, message.x, message.y).then(() => {
    sendResponse({ ok: true });
  }, (error) => {
    sendResponse({ ok: false, error: error.message });
  });
  return true;
});
