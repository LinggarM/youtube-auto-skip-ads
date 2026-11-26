(() => {
  const skipButtonSelector = [
    ".ytp-ad-skip-button",
    ".ytp-ad-skip-button-modern",
    ".ytp-skip-ad-button"
  ].join(", ");

  let clickPending = false;
  let lastClickAt = 0;

  function requestMouseClick() {
    if (clickPending || Date.now() - lastClickAt < 2000) {
      return;
    }

    for (const button of document.querySelectorAll(skipButtonSelector)) {
      if (!button.isConnected || button.disabled || button.getAttribute("aria-disabled") === "true") {
        continue;
      }

      const bounds = button.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) {
        continue;
      }

      clickPending = true;
      lastClickAt = Date.now();
      chrome.runtime.sendMessage({
        type: "skip-ad-mouse-click",
        x: bounds.left + bounds.width / 2,
        y: bounds.top + bounds.height / 2
      }, (response) => {
        clickPending = false;
        const runtimeError = chrome.runtime.lastError;
        if (runtimeError) {
          console.error("[YouTube Auto Skip Ads]", runtimeError.message);
        } else if (!response || !response.ok) {
          console.error("[YouTube Auto Skip Ads]", response && response.error
            ? response.error
            : "Could not click the Skip Ad button.");
        }
      });
      break;
    }
  }

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) {
      return;
    }

    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      requestMouseClick();
    });
  });

  requestMouseClick();
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["aria-disabled", "class", "disabled", "style"],
    childList: true,
    subtree: true
  });

  window.setInterval(requestMouseClick, 500);
})();
