importScripts("axios.min.js");

const REPHRASE_API_URL = "http://localhost:3000/api/rephrase";
const REPLY_API_URL = "http://localhost:3000/api/reply";
const EXPLAIN_API_URL = "http://localhost:3000/api/explain";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "rephrase",
      title: "Rephrase (Ctrl+K)",
      contexts: ["editable", "selection"],
    });
    chrome.contextMenus.create({
      id: "fix-grammar",
      title: "Fix Grammar (Ctrl+G)",
      contexts: ["editable", "selection"],
    });
    chrome.contextMenus.create({
      id: "generate-reply",
      title: "Generate Reply (Ctrl+M)",
      contexts: ["editable", "selection"],
    });
    chrome.contextMenus.create({
      id: "casual-chat",
      title: "Casual Chat (Ctrl+L)",
      contexts: ["editable", "selection"],
    });
    chrome.contextMenus.create({
      id: "explain-text",
      title: "Explain Text (Ctrl+B)",
      contexts: ["editable", "selection"],
    });
  });
});

async function tell(tabId, frameId, message) {
  try {
    return await chrome.tabs.sendMessage(tabId, message, { frameId });
  } catch {
    return null;
  }
}

// Call backend AI API using Axios
async function callAIAPI(text, mode = "rephrase") {
  let url = REPHRASE_API_URL;
  if (mode === "reply" || mode === "casual") url = REPLY_API_URL;
  if (mode === "explain") url = EXPLAIN_API_URL;

  const payload = { text, mode };

  try {
    const response = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 30000,
    });
    return response.data.rephrased;
  } catch (err) {
    const errorMsg = err.response?.data?.error || err.message || "Something went wrong.";
    throw new Error(errorMsg);
  }
}

// Handle context menu right click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const allowedItems = ["rephrase", "fix-grammar", "generate-reply", "casual-chat", "explain-text"];
  if (!allowedItems.includes(info.menuItemId) || !tab?.id) return;
  const tabId = tab.id;
  const frameId = info.frameId;

  let mode = "rephrase";
  if (info.menuItemId === "fix-grammar") mode = "grammar";
  if (info.menuItemId === "generate-reply") mode = "reply";
  if (info.menuItemId === "casual-chat") mode = "casual";
  if (info.menuItemId === "explain-text") mode = "explain";

  // 1. Ask the page for the selected text
  const picked = await tell(tabId, frameId, { type: "GET_TEXT", mode });
  if (!picked) {
    return; // content script not available
  }
  if (!picked.ok) {
    if (!picked.handled) {
      await tell(tabId, frameId, { type: "ERROR", message: picked.error });
    }
    return;
  }

  // 2. Call backend API
  try {
    const rephrased = await callAIAPI(picked.text, mode);
    // 3. Tell the page to display or replace the text
    await tell(tabId, frameId, { type: "REPLACE", text: rephrased, mode });
  } catch (err) {
    await tell(tabId, frameId, {
      type: "ERROR",
      message: err.message || "Could not reach the server.",
    });
  }
});

// Handle direct message requests (e.g. Ctrl+K, Ctrl+G, Ctrl+M, Ctrl+L, Ctrl+B shortcuts)
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  const validTypes = [
    "REQUEST_REPHRASE",
    "REQUEST_FIX_GRAMMAR",
    "REQUEST_GENERATE_REPLY",
    "REQUEST_CASUAL_CHAT",
    "REQUEST_EXPLAIN"
  ];
  if (validTypes.includes(msg.type)) {
    let mode = msg.mode || "rephrase";
    if (msg.type === "REQUEST_FIX_GRAMMAR") mode = "grammar";
    if (msg.type === "REQUEST_GENERATE_REPLY") mode = "reply";
    if (msg.type === "REQUEST_CASUAL_CHAT") mode = "casual";
    if (msg.type === "REQUEST_EXPLAIN") mode = "explain";

    callAIAPI(msg.text, mode)
      .then((rephrased) => sendResponse({ ok: true, rephrased }))
      .catch((err) => sendResponse({ ok: false, error: err.message || "Processing failed." }));
    return true; // Keep message channel open for async response
  }
});





