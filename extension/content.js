// Global variable to remember active target selection
let saved = null;

// Dynamically inject stylesheet for animations and floating badges
function injectStyles() {
  if (document.getElementById("ai-rephrase-styles")) return;
  const style = document.createElement("style");
  style.id = "ai-rephrase-styles";
  style.textContent = `
    @keyframes aiShimmer {
      0% { opacity: 0.65; }
      50% { opacity: 1; }
      100% { opacity: 0.65; }
    }
    @keyframes aiPulseGlow {
      0% { box-shadow: 0 0 0 2px rgba(161, 161, 170, 0.4); }
      50% { box-shadow: 0 0 0 3px rgba(212, 212, 216, 0.6); }
      100% { box-shadow: 0 0 0 2px rgba(161, 161, 170, 0.4); }
    }
    @keyframes aiSuccessGlow {
      0% { box-shadow: 0 0 0 2px rgba(161, 161, 170, 0.5); }
      100% { box-shadow: 0 0 0 0px transparent; }
    }
    @keyframes aiBadgePop {
      0% { opacity: 0; transform: translateY(4px) scale(0.96); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }

    .ai-field-glowing {
      animation: aiPulseGlow 1.8s infinite ease-in-out !important;
      transition: box-shadow 0.2s ease !important;
    }
    .ai-field-success {
      animation: aiSuccessGlow 1s ease-out forwards !important;
    }

    .ai-floating-badge {
      position: fixed;
      z-index: 2147483647;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 20px;
      background: rgba(24, 24, 27, 0.94);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
      color: #f4f4f5;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.1px;
      pointer-events: none;
      animation: aiBadgePop 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      user-select: none;
    }

    @keyframes aiSpinnerRotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .ai-spinner {
      display: inline-block;
      width: 13px;
      height: 13px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-top-color: #f4f4f5;
      border-radius: 50%;
      animation: aiSpinnerRotate 0.8s linear infinite;
      box-sizing: border-box;
      flex-shrink: 0;
    }

    .ai-shimmer-text {
      color: #e4e4e7;
      animation: aiShimmer 1.8s ease-in-out infinite;
    }

    .ai-badge-success {
      border-color: rgba(255, 255, 255, 0.2) !important;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25) !important;
    }

    .ai-highlight-span {
      background: rgba(161, 161, 170, 0.2) !important;
      border-bottom: 2px solid #a1a1aa !important;
      border-radius: 2px !important;
      transition: all 0.2s ease !important;
    }
    .ai-highlight-span-success {
      background: rgba(161, 161, 170, 0.15) !important;
      border-bottom: 2px solid #71717a !important;
      border-radius: 2px !important;
      transition: all 0.4s ease !important;
    }

    @keyframes aiCardSlideIn {
      0% { opacity: 0; transform: translateX(20px) scale(0.96); }
      100% { opacity: 1; transform: translateX(0) scale(1); }
    }
    .ai-explain-card {
      position: fixed;
      top: 24px;
      right: 24px;
      width: 360px;
      max-width: calc(100vw - 48px);
      max-height: 80vh;
      z-index: 2147483647;
      background: rgba(24, 24, 27, 0.96);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
      color: #f4f4f5;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13.5px;
      line-height: 1.5;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: aiCardSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .ai-explain-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(39, 39, 42, 0.6);
    }
    .ai-explain-title {
      font-weight: 600;
      font-size: 13px;
      color: #f4f4f5;
      letter-spacing: 0.1px;
    }
    .ai-explain-close-btn {
      background: transparent;
      border: none;
      color: #a1a1aa;
      font-size: 16px;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 4px;
      transition: all 0.2s ease;
      line-height: 1;
    }
    .ai-explain-close-btn:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.15);
    }
    .ai-explain-body {
      padding: 14px 16px;
      overflow-y: auto;
      max-height: 60vh;
    }
    .ai-explain-quote {
      font-size: 12px;
      color: #a1a1aa;
      border-left: 2px solid #a1a1aa;
      padding-left: 8px;
      margin-bottom: 12px;
      font-style: italic;
      word-break: break-word;
      max-height: 60px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .ai-explain-content {
      color: #e4e4e7;
      white-space: pre-wrap;
      font-size: 13px;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
}

// Helper to check if an element is editable
function isEditableElement(el) {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "TEXTAREA") return true;
  if (tag === "INPUT") {
    const type = (el.type || "").toLowerCase();
    return ["text", "search", "url", "email", ""].includes(type);
  }
  return (
    el.isContentEditable ||
    el.getAttribute("contenteditable") === "true" ||
    el.getAttribute("role") === "textbox"
  );
}

// Find an active or available editable element on the page, prioritized by proximity to contextNode
function findEditableElement(contextNode = null) {
  const activeEl = document.activeElement;

  if (activeEl && isEditableElement(activeEl)) {
    return activeEl;
  }

  if (activeEl) {
    const parentEditable = activeEl.closest("[contenteditable='true'], [role='textbox']");
    if (parentEditable) return parentEditable;
  }

  // Determine source node / selection container
  let startContainer = contextNode;
  if (!startContainer) {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      startContainer = sel.anchorNode;
    }
  }

  if (startContainer && startContainer.nodeType === Node.TEXT_NODE) {
    startContainer = startContainer.parentElement;
  }

  // 1. Check within closest parent comment or reply container of the selected text
  if (startContainer) {
    const commentContainer = startContainer.closest(
      "[role='article'], .comment, .reply, .message, .thread, .comment-box, [data-testid*='comment'], [class*='comment'], [class*='reply'], [class*='message']"
    ) || startContainer.parentElement;

    if (commentContainer) {
      // Look for an editable element INSIDE or right next to this parent comment container
      const localEditable = commentContainer.querySelector(
        "div[contenteditable='true'], textarea:not([readonly]), input[type='text']:not([readonly])"
      );
      if (localEditable && localEditable.offsetWidth > 0 && localEditable.offsetHeight > 0) {
        return localEditable;
      }

      // Check next/previous sibling elements for reply input box
      let sibling = commentContainer.nextElementSibling || commentContainer.parentElement?.nextElementSibling;
      if (sibling) {
        const sibEditable = sibling.querySelector(
          "div[contenteditable='true'], textarea:not([readonly]), input[type='text']:not([readonly])"
        );
        if (sibEditable && sibEditable.offsetWidth > 0 && sibEditable.offsetHeight > 0) {
          return sibEditable;
        }
      }
    }
  }

  // 2. Gather all visible editable elements on page
  const selectors = [
    "div[contenteditable='true'][role='textbox']",
    "div[contenteditable='true'][data-tab]",
    "div[contenteditable='true'][aria-label*='Type a message']",
    "div[contenteditable='true'][aria-label*='Message']",
    "div[contenteditable='true'][aria-label*='Reply']",
    "div[contenteditable='true'][aria-label*='comment']",
    "div[contenteditable='true']",
    "textarea:not([readonly])",
    "input[type='text']:not([readonly])"
  ];

  const candidates = [];
  for (const selector of selectors) {
    const els = document.querySelectorAll(selector);
    for (const el of els) {
      if (el.offsetWidth > 0 && el.offsetHeight > 0 && !candidates.includes(el)) {
        candidates.push(el);
      }
    }
  }

  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  // 3. If multiple candidates exist, find the one with closest vertical distance to selected text
  let sourceRect = null;
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    sourceRect = sel.getRangeAt(0).getBoundingClientRect();
  } else if (startContainer && startContainer.getBoundingClientRect) {
    sourceRect = startContainer.getBoundingClientRect();
  }

  if (sourceRect && (sourceRect.width > 0 || sourceRect.height > 0)) {
    const sourceCenterY = sourceRect.top + sourceRect.height / 2 + window.scrollY;
    let closestEl = candidates[0];
    let minDistance = Infinity;

    for (const candidate of candidates) {
      const candRect = candidate.getBoundingClientRect();
      const candCenterY = candRect.top + candRect.height / 2 + window.scrollY;
      const distance = Math.abs(candCenterY - sourceCenterY);

      if (distance < minDistance) {
        minDistance = distance;
        closestEl = candidate;
      }
    }

    return closestEl;
  }

  return candidates[0];
}

function getOrMakeRange(el) {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && el.contains(sel.anchorNode)) {
    return sel.getRangeAt(0).cloneRange();
  }
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  return range;
}

// Captures target text & destination element according to mode
function captureTarget(mode = "rephrase") {
  const sel = window.getSelection();
  const activeEl = document.activeElement;
  const domSelectedText = sel ? sel.toString().trim() : "";

  // MODE: EXPLAIN (Ctrl+B) - Accepts selected text anywhere on page
  if (mode === "explain") {
    let sourceText = domSelectedText;
    if (!sourceText && activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")) {
      const start = activeEl.selectionStart;
      const end = activeEl.selectionEnd;
      if (start !== null && end !== null && start !== end) {
        sourceText = activeEl.value.slice(start, end).trim();
      }
    }
    if (!sourceText) {
      return { error: "Please highlight or select text first to explain." };
    }
    return { kind: "explain", text: sourceText, mode: "explain" };
  }

  // MODE: REPLY (Ctrl+M) & CASUAL (Ctrl+L) - Can select ANY text on page
  if (mode === "reply" || mode === "casual") {
    let sourceText = domSelectedText;
    let sourceNode = sel && sel.anchorNode ? sel.anchorNode : activeEl;

    if (!sourceText && activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")) {
      const start = activeEl.selectionStart;
      const end = activeEl.selectionEnd;
      if (start !== null && end !== null && start !== end) {
        sourceText = activeEl.value.slice(start, end).trim();
      } else if (activeEl.value.trim()) {
        sourceText = activeEl.value.trim();
      }
    }

    if (!sourceText) {
      return { error: "Please highlight or select the text/message first." };
    }

    const targetEl = findEditableElement(sourceNode);
    if (!targetEl) {
      return { error: "Could not find a text input box to write into. Please click your chat box." };
    }

    if (targetEl.tagName === "INPUT" || targetEl.tagName === "TEXTAREA") {
      const start = targetEl.selectionStart || 0;
      const end = targetEl.selectionEnd || targetEl.value.length;
      return { kind: "input", el: targetEl, start, end, text: sourceText, mode };
    } else {
      return { kind: "editable", el: targetEl, range: getOrMakeRange(targetEl), text: sourceText, mode };
    }
  }

  // MODE: REPHRASE (Ctrl+K) or GRAMMAR (Ctrl+G)
  if (activeEl && (activeEl.tagName === "TEXTAREA" || activeEl.tagName === "INPUT")) {
    if (activeEl.type === "password") {
      return { error: "Password fields are not supported." };
    }
    const start = activeEl.selectionStart;
    const end = activeEl.selectionEnd;

    if (start === null || end === null || start === end) {
      return { error: "Please select text first." };
    }

    const text = activeEl.value.slice(start, end);
    if (!text.trim()) {
      return { error: "Please select non-empty text." };
    }

    return { kind: "input", el: activeEl, start, end, text, mode };
  }

  if (domSelectedText) {
    const range = sel.getRangeAt(0).cloneRange();
    let container = sel.anchorNode;
    if (container && container.nodeType === Node.TEXT_NODE) {
      container = container.parentElement;
    }

    const editableContainer = container
      ? container.closest("[contenteditable='true'], [role='textbox']") || (container.isContentEditable ? container : null)
      : null;
    const targetEl = editableContainer || (activeEl && isEditableElement(activeEl) ? activeEl : null);

    if (!targetEl && (!container || !container.isContentEditable)) {
      return { error: "Please select text inside an editable text area." };
    }

    return {
      kind: "editable",
      el: targetEl || activeEl,
      range: range,
      text: domSelectedText,
      mode
    };
  }

  return { error: "Please select text first." };
}


// Save position on right click
document.addEventListener(
  "contextmenu",
  () => {
    saved = captureTarget();
  },
  true
);

let activeExplainCard = null;

function closeExplainCard() {
  if (activeExplainCard) {
    activeExplainCard.remove();
    activeExplainCard = null;
  }
}

async function showExplainCard(textToExplain) {
  injectStyles();
  closeExplainCard();

  const card = document.createElement("div");
  card.className = "ai-explain-card";

  const truncatedQuote = textToExplain.length > 120 ? textToExplain.slice(0, 120) + "..." : textToExplain;

  card.innerHTML = `
    <div class="ai-explain-header">
      <span class="ai-explain-title">Explanation</span>
      <button class="ai-explain-close-btn" title="Close (Esc)">✕</button>
    </div>
    <div class="ai-explain-body">
      <div class="ai-explain-quote">"${truncatedQuote}"</div>
      <div class="ai-explain-content">
        <span class="ai-spinner"></span>
        <span class="ai-shimmer-text" style="margin-left: 8px;">Explaining text...</span>
      </div>
    </div>
  `;

  document.body.appendChild(card);
  activeExplainCard = card;

  const closeBtn = card.querySelector(".ai-explain-close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeExplainCard);
  }

  try {
    const res = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: "REQUEST_EXPLAIN", text: textToExplain, mode: "explain" }, (response) => {
        if (chrome.runtime.lastError) {
          resolve({ ok: false, error: chrome.runtime.lastError.message });
        } else {
          resolve(response || { ok: false, error: "No response from backend." });
        }
      });
    });

    if (!activeExplainCard || activeExplainCard !== card) return;

    const contentEl = card.querySelector(".ai-explain-content");
    if (!res || !res.ok) {
      if (contentEl) contentEl.textContent = res?.error || "Failed to explain text.";
      return;
    }

    if (contentEl) {
      contentEl.textContent = res.rephrased;
    }
  } catch (err) {
    if (!activeExplainCard || activeExplainCard !== card) return;
    const contentEl = card.querySelector(".ai-explain-content");
    if (contentEl) contentEl.textContent = err.message || "An error occurred.";
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && activeExplainCard) {
    closeExplainCard();
  }
});

// Global Keydown Listener for Shortcuts:
// Ctrl+K (Rephrase), Ctrl+G (Fix Grammar), Ctrl+M (Generate Reply), Ctrl+L (Casual Chat), Ctrl+B (Explain Text)
document.addEventListener(
  "keydown",
  async (e) => {
    const key = e.key && e.key.toLowerCase();
    const isK = key === "k";
    const isG = key === "g";
    const isM = key === "m";
    const isL = key === "l";
    const isB = key === "b";
    const isCmdOrCtrl = e.ctrlKey || e.metaKey;

    if (isCmdOrCtrl && (isK || isG || isM || isL || isB)) {
      const mode = isG ? "grammar" : isM ? "reply" : isL ? "casual" : isB ? "explain" : "rephrase";
      const actionLabel = isG ? "fix grammar" : isM ? "generate reply" : isL ? "casual chat" : isB ? "explain text" : "rephrase";

      e.preventDefault();
      e.stopPropagation();

      const target = captureTarget(mode);
      if (!target || target.error) {
        toast(target?.error || `Please select text first to ${actionLabel}.`, { error: true });
        return;
      }

      saved = target;
      if (mode === "explain") {
        showExplainCard(saved.text);
      } else {
        triggerAction(saved, mode);
      }
    }
  },
  true
);


async function triggerAction(target, mode = "rephrase") {
  if (!target || target.error || !target.text.trim()) {
    const actionLabel = mode === "grammar" ? "fix grammar" : mode === "reply" ? "generate reply" : mode === "casual" ? "casual chat" : "rephrase";
    toast(target?.error || `Please select text first to ${actionLabel}.`, { error: true });
    return;
  }

  const loadingText = mode === "grammar" ? "Fixing grammar..." : mode === "reply" ? "Generating reply..." : mode === "casual" ? "Human chatting..." : "Rephrasing...";
  const successText = mode === "grammar" ? "Grammar Fixed!" : mode === "reply" ? "Reply Generated!" : mode === "casual" ? "Casual Message!" : "Rephrased!";
  const requestType = mode === "grammar" ? "REQUEST_FIX_GRAMMAR" : mode === "reply" ? "REQUEST_GENERATE_REPLY" : mode === "casual" ? "REQUEST_CASUAL_CHAT" : "REQUEST_REPHRASE";

  startLoadingAnimation(target, loadingText);

  try {
    const res = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: requestType, text: target.text, mode }, (response) => {
        if (chrome.runtime.lastError) {
          resolve({ ok: false, error: chrome.runtime.lastError.message });
        } else {
          resolve(response || { ok: false, error: "No response from backend." });
        }
      });
    });

    if (!res || !res.ok) {
      stopLoadingAnimation(target);
      toast(res?.error || "Failed to process text.", { error: true });
      return;
    }

    if (res.rephrased === "Language not supported or text not meaningful English.") {
      stopLoadingAnimation(target);
      toast(res.rephrased, { error: true });
      return;
    }

    await animateTextReplacement(target, res.rephrased, successText);
  } catch (err) {
    stopLoadingAnimation(target);
    toast(err.message || "An error occurred.", { error: true });
  }
}

function getTargetBoundingRect(target) {
  if (target?.kind === "editable" && target.range) {
    const rect = target.range.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) return rect;
  }
  if (target?.el) {
    return target.el.getBoundingClientRect();
  }
  return null;
}

function startLoadingAnimation(target, label = "Rephrasing...") {
  injectStyles();
  stopLoadingAnimation();

  if (target?.el) {
    target.el.classList.add("ai-field-glowing");
  }

  const rect = getTargetBoundingRect(target);
  const badge = document.createElement("div");
  badge.id = "ai-rephrase-badge";
  badge.className = "ai-floating-badge";

  const top = rect ? Math.max(10, rect.top - 42) : 20;
  const left = rect ? Math.max(10, rect.left) : 20;

  badge.style.top = `${top}px`;
  badge.style.left = `${left}px`;

  badge.innerHTML = `
    <span class="ai-spinner"></span>
    <span class="ai-shimmer-text">${label}</span>
  `;

  document.body.appendChild(badge);
}

function stopLoadingAnimation(target) {
  const badge = document.getElementById("ai-rephrase-badge");
  if (badge) badge.remove();

  if (target?.el) {
    target.el.classList.remove("ai-field-glowing", "ai-field-success");
  }
  document.querySelectorAll(".ai-field-glowing, .ai-field-success").forEach((el) => {
    el.classList.remove("ai-field-glowing", "ai-field-success");
  });
}

function focusAndEnsureRange(el, mode = "rephrase", targetRange = null) {
  if (!el) return;
  el.focus();
  const sel = window.getSelection();
  if (!sel) return;

  if (mode === "reply") {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  } else if (targetRange) {
    try {
      sel.removeAllRanges();
      sel.addRange(targetRange);
    } catch (e) {
      const range = document.createRange();
      range.selectNodeContents(el);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
}

function dispatchInputEvents(el, data = "") {
  if (!el) return;
  try {
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  } catch (e) {}
}

function smoothFrameDelay(targetMs) {
  return new Promise((resolve) => {
    const start = performance.now();
    function tick(now) {
      if (now - start >= targetMs) {
        resolve();
      } else {
        requestAnimationFrame(tick);
      }
    }
    requestAnimationFrame(tick);
  });
}

function getTypingChunks(text) {
  const len = text.length;
  let chunkSize = 1;
  let baseDelay = 18;

  if (len > 150) {
    chunkSize = 4;
    baseDelay = 10;
  } else if (len > 80) {
    chunkSize = 3;
    baseDelay = 12;
  } else if (len > 35) {
    chunkSize = 2;
    baseDelay = 15;
  }

  const chunks = [];
  for (let i = 0; i < len; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return { chunks, baseDelay };
}

// In-place animated text replacement compatible with WhatsApp Web, Lexical, Gmail, Slate, etc.
async function animateTextReplacement(target, newText, successLabel = "Rephrased!") {
  if (!target || target.error) return;
  const { el, kind, mode } = target;

  const badge = document.getElementById("ai-rephrase-badge");
  if (badge) {
    badge.className = "ai-floating-badge ai-badge-success";
    badge.innerHTML = `
      <span style="color: #e4e4e7; font-size: 14px;">✓</span>
      <span style="color: #e4e4e7;">${successLabel}</span>
    `;
  }

  if (el) {
    el.classList.remove("ai-field-glowing");
    el.classList.add("ai-field-success");
  }

  const { chunks, baseDelay } = getTypingChunks(newText);

  if (kind === "input") {
    el.focus();
    let startIdx = mode === "reply" ? (el.selectionStart || el.value.length) : target.start;
    let endIdx = mode === "reply" ? startIdx : target.end;

    if (mode !== "reply" && startIdx !== endIdx) {
      el.setSelectionRange(startIdx, endIdx);
      document.execCommand("insertText", false, "");
      endIdx = startIdx;
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      el.setSelectionRange(startIdx, startIdx);
      const ok = document.execCommand("insertText", false, chunk);
      if (!ok) {
        el.setRangeText(chunk, startIdx, startIdx, "end");
      }

      startIdx += chunk.length;
      dispatchInputEvents(el, chunk);

      const isPunct = /[.,?!;\n]/.test(chunk);
      const delay = isPunct ? baseDelay * 2.2 : baseDelay;
      await smoothFrameDelay(delay);
    }

    el.setSelectionRange(startIdx, startIdx);
  } else if (kind === "editable") {
    focusAndEnsureRange(el, mode, target.range);

    if (mode !== "reply" && target.range) {
      try {
        target.range.deleteContents();
      } catch (e) {}
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const inserted = document.execCommand("insertText", false, chunk);

      if (!inserted) {
        try {
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const textNode = document.createTextNode(chunk);
            range.insertNode(textNode);
            if (textNode && textNode.parentNode) {
              range.setStartAfter(textNode);
              range.collapse(true);
              sel.removeAllRanges();
              sel.addRange(range);
            }
          }
        } catch (e) {
          try {
            el.innerText += chunk;
          } catch (err) {}
        }
      }

      dispatchInputEvents(el, chunk);

      const isPunct = /[.,?!;\n]/.test(chunk);
      const delay = isPunct ? baseDelay * 2.2 : baseDelay;
      await smoothFrameDelay(delay);
    }
  }

  cleanupAfterSuccess(target);
}

function cleanupAfterSuccess(target) {
  setTimeout(() => {
    stopLoadingAnimation(target);
  }, 1200);
}

let toastEl = null;
let toastTimer = null;

function toast(message, { error = false, sticky = false } = {}) {
  injectStyles();
  if (!toastEl) {
    toastEl = document.createElement("div");
    Object.assign(toastEl.style, {
      position: "fixed",
      right: "16px",
      bottom: "16px",
      zIndex: "2147483647",
      padding: "10px 16px",
      borderRadius: "10px",
      font: "600 13px system-ui, sans-serif",
      color: "#fff",
      boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
      backdropFilter: "blur(8px)",
      transition: "all 0.3s ease",
    });
    document.documentElement.appendChild(toastEl);
  }
  toastEl.textContent = message;
  toastEl.style.background = error ? "rgba(39, 39, 42, 0.96)" : "rgba(24, 24, 27, 0.96)";
  toastEl.style.border = error ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid rgba(255, 255, 255, 0.15)";
  toastEl.style.display = "block";
  clearTimeout(toastTimer);
  if (!sticky) {
    toastTimer = setTimeout(() => (toastEl.style.display = "none"), 3000);
  }
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "GET_TEXT") {
    const mode = msg.mode || "rephrase";
    saved = captureTarget(mode);
    if (!saved || saved.error) {
      const actionLabel = mode === "grammar" ? "fix grammar" : mode === "reply" ? "generate reply" : mode === "casual" ? "casual chat" : mode === "explain" ? "explain text" : "rephrase";
      sendResponse({ ok: false, error: saved?.error || `Please select text first to ${actionLabel}.` });
    } else if (!saved.text.trim()) {
      sendResponse({ ok: false, error: "Please select non-empty text." });
    } else if (mode === "explain") {
      showExplainCard(saved.text);
      sendResponse({ ok: false, handled: true });
    } else {
      const loadingLabel = mode === "grammar" ? "Fixing grammar..." : mode === "reply" ? "Generating reply..." : mode === "casual" ? "Human chatting..." : "Rephrasing...";
      startLoadingAnimation(saved, loadingLabel);
      sendResponse({ ok: true, text: saved.text });
    }
  } else if (msg.type === "LOADING") {
    const loadingLabel = msg.mode === "grammar" ? "Fixing grammar..." : msg.mode === "reply" ? "Generating reply..." : msg.mode === "casual" ? "Human chatting..." : "Rephrasing...";
    startLoadingAnimation(saved, loadingLabel);
  } else if (msg.type === "REPLACE") {
    if (msg.mode === "explain") {
      showExplainCard(msg.text);
    } else {
      const successLabel = msg.mode === "grammar" ? "Grammar Fixed!" : msg.mode === "reply" ? "Reply Generated!" : msg.mode === "casual" ? "Casual Message!" : "Rephrased!";
      animateTextReplacement(saved, msg.text, successLabel);
    }
  } else if (msg.type === "ERROR") {
    stopLoadingAnimation(saved);
    toast(msg.message, { error: true });
  }
});




