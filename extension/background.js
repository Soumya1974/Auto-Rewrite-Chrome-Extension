// Change this to your https:// backend URL when you deploy
const API_URL = "http://localhost:3000/api/rephrase";

// Create the right-click menu (shows on selection and editable fields)
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "ai-rephrase",
      title: "✨ AI Rephrase (Ctrl+K)",
      contexts: ["editable", "selection"],
    });
  });
});

// Send a message to the page, ignore errors (e.g. page not ready)
async function tell(tabId, frameId, message) {
  try {
    return await chrome.tabs.sendMessage(tabId, message, { frameId });
  } catch {
    return null;
  }
}

// Call backend AI API
async function callRephraseAPI(text) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Something went wrong.");
  }
  return data.rephrased;
}

// Handle context menu right click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "ai-rephrase" || !tab?.id) return;
  const tabId = tab.id;
  const frameId = info.frameId;

  // 1. Ask the page for the selected text
  const picked = await tell(tabId, frameId, { type: "GET_TEXT" });
  if (!picked) {
    return; // content script not available (reload the page after installing)
  }
  if (!picked.ok) {
    await tell(tabId, frameId, { type: "ERROR", message: picked.error });
    return;
  }

  // 2. Call backend API
  try {
    const rephrased = await callRephraseAPI(picked.text);
    // 3. Tell the page to replace the text with animation
    await tell(tabId, frameId, { type: "REPLACE", text: rephrased });
  } catch (err) {
    await tell(tabId, frameId, {
      type: "ERROR",
      message: err.message || "Could not reach the server.",
    });
  }
});

// Handle direct message requests (e.g. Ctrl+K shortcut)
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "REQUEST_REPHRASE") {
    callRephraseAPI(msg.text)
      .then((rephrased) => sendResponse({ ok: true, rephrased }))
      .catch((err) => sendResponse({ ok: false, error: err.message || "Rephrase failed." }));
    return true; // Keep message channel open for async response
  }
});

