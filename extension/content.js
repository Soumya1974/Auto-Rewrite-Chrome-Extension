// Global variable to remember active target selection
let saved = null;

// Dynamically inject stylesheet for animations and floating badges
function injectStyles() {
  if (document.getElementById("ai-rephrase-styles")) return;
  const style = document.createElement("style");
  style.id = "ai-rephrase-styles";
  style.textContent = `
    @keyframes aiShimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes aiSpin {
      0% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(180deg) scale(1.2); }
      100% { transform: rotate(360deg) scale(1); }
    }
    @keyframes aiPulseGlow {
      0% { box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.6), 0 0 14px rgba(168, 85, 247, 0.4); }
      50% { box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.8), 0 0 22px rgba(236, 72, 153, 0.6); }
      100% { box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.6), 0 0 14px rgba(168, 85, 247, 0.4); }
    }
    @keyframes aiSuccessGlow {
      0% { box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.8), 0 0 18px rgba(16, 185, 129, 0.6); }
      100% { box-shadow: 0 0 0 0px transparent, 0 0 0px transparent; }
    }
    @keyframes aiBadgePop {
      0% { opacity: 0; transform: translateY(6px) scale(0.92); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }

    .ai-field-glowing {
      animation: aiPulseGlow 1.6s infinite ease-in-out !important;
      transition: box-shadow 0.3s ease !important;
    }
    .ai-field-success {
      animation: aiSuccessGlow 1.2s ease-out forwards !important;
    }

    .ai-floating-badge {
      position: fixed;
      z-index: 2147483647;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 20px;
      background: rgba(15, 23, 42, 0.92);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(168, 85, 247, 0.5);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35), 0 0 14px rgba(168, 85, 247, 0.35);
      color: #ffffff;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.2px;
      pointer-events: none;
      animation: aiBadgePop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      user-select: none;
    }

    .ai-sparkle {
      display: inline-block;
      animation: aiSpin 2s infinite linear;
      font-size: 14px;
    }

    .ai-shimmer-text {
      background: linear-gradient(90deg, #c084fc, #f472b6, #60a5fa, #c084fc);
      background-size: 200% auto;
      color: transparent;
      -webkit-background-clip: text;
      background-clip: text;
      animation: aiShimmer 2.5s linear infinite;
    }

    .ai-badge-success {
      border-color: rgba(16, 185, 129, 0.6) !important;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35), 0 0 14px rgba(16, 185, 129, 0.4) !important;
    }

    .ai-highlight-span {
      background: rgba(168, 85, 247, 0.3) !important;
      border-bottom: 2px solid #a855f7 !important;
      border-radius: 2px !important;
      transition: all 0.3s ease !important;
    }
    .ai-highlight-span-success {
      background: rgba(16, 185, 129, 0.3) !important;
      border-bottom: 2px solid #10b981 !important;
      border-radius: 2px !important;
      transition: all 0.5s ease !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
}

// Captures selection strictly from active element or DOM selection
function captureTarget() {
  const el = document.activeElement;
  const sel = window.getSelection();

  // Case 1: <input> and <textarea>
  if (el && (el.tagName === "TEXTAREA" || el.tagName === "INPUT")) {
    if (el.type === "password") {
      return { error: "Password fields are not supported." };
    }
    if (el.selectionStart === null || el.selectionStart === undefined) {
      return { error: "This field type is not supported." };
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;

    // Strict requirement: MUST have text selected
    if (start === end || Math.abs(end - start) === 0) {
      return { error: "Please select text first to rephrase." };
    }

    const text = el.value.slice(start, end);
    if (!text.trim()) {
      return { error: "Please select non-empty text to rephrase." };
    }

    return { kind: "input", el, start, end, text };
  }

  // Case 2: contenteditable or text selection anywhere in DOM
  if (sel && sel.rangeCount > 0 && sel.toString().trim()) {
    const range = sel.getRangeAt(0).cloneRange();
    let container = sel.anchorNode;
    if (container && container.nodeType === Node.TEXT_NODE) {
      container = container.parentElement;
    }

    const editableContainer = container
      ? container.closest("[contenteditable='true']") || (container.isContentEditable ? container : null)
      : null;
    const targetEl = editableContainer || (el && el.isContentEditable ? el : null);

    if (!targetEl && (!container || !container.isContentEditable)) {
      return { error: "Rephrase only works inside editable text fields." };
    }

    return {
      kind: "editable",
      el: targetEl || el,
      range: range,
      text: sel.toString(),
    };
  }

  return { error: "Please select text first to rephrase." };
}

// Save position on right click
document.addEventListener(
  "contextmenu",
  () => {
    saved = captureTarget();
  },
  true
);

// Global Keydown Listener for Ctrl+K / Cmd+K
document.addEventListener(
  "keydown",
  async (e) => {
    const isK = e.key && e.key.toLowerCase() === "k";
    const isCmdOrCtrl = e.ctrlKey || e.metaKey;

    if (isCmdOrCtrl && isK) {
      const activeEl = document.activeElement;
      const sel = window.getSelection();

      const isInput =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.isContentEditable ||
          activeEl.closest("[contenteditable='true']"));
      const hasDomSel = sel && sel.toString().trim().length > 0;

      if (isInput || hasDomSel) {
        e.preventDefault();
        e.stopPropagation();

        const target = captureTarget();
        if (!target || target.error) {
          toast(target?.error || "Please select text first to rephrase.", { error: true });
          return;
        }

        saved = target;
        triggerRephrase(saved);
      }
    }
  },
  true
);

async function triggerRephrase(target) {
  if (!target || target.error || !target.text.trim()) {
    toast(target?.error || "Please select text first to rephrase.", { error: true });
    return;
  }

  startLoadingAnimation(target);

  try {
    const res = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: "REQUEST_REPHRASE", text: target.text }, (response) => {
        if (chrome.runtime.lastError) {
          resolve({ ok: false, error: chrome.runtime.lastError.message });
        } else {
          resolve(response || { ok: false, error: "No response from backend." });
        }
      });
    });

    if (!res || !res.ok) {
      stopLoadingAnimation(target);
      toast(res?.error || "Failed to rephrase text.", { error: true });
      return;
    }

    await animateTextReplacement(target, res.rephrased);
  } catch (err) {
    stopLoadingAnimation(target);
    toast(err.message || "An error occurred during rephrase.", { error: true });
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

function startLoadingAnimation(target) {
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
    <span class="ai-sparkle">✨</span>
    <span class="ai-shimmer-text">AI is rephrasing...</span>
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

// In-place animated text replacement with typewriter & highlight effect
async function animateTextReplacement(target, newText) {
  if (!target || target.error) return;
  const { el } = target;

  const badge = document.getElementById("ai-rephrase-badge");
  if (badge) {
    badge.className = "ai-floating-badge ai-badge-success";
    badge.innerHTML = `
      <span style="color: #10b981; font-size: 15px;">✓</span>
      <span style="color: #10b981;">Rephrased!</span>
    `;
  }

  if (el) {
    el.classList.remove("ai-field-glowing");
    el.classList.add("ai-field-success");
  }

  const words = newText.split(/(\s+)/);
  let currentAccumulated = "";

  if (target.kind === "input") {
    el.focus();
    const delayPerChunk = Math.max(15, Math.min(45, Math.floor(350 / Math.max(1, words.length))));
    let startIdx = target.start;

    for (let i = 0; i < words.length; i++) {
      currentAccumulated += words[i];

      el.setSelectionRange(startIdx, target.end);
      const ok = document.execCommand("insertText", false, words[i]);
      if (!ok) {
        el.setRangeText(words[i], el.selectionStart, el.selectionEnd, "end");
      }

      startIdx += words[i].length;
      target.end = startIdx;

      el.setSelectionRange(target.start, startIdx);
      el.dispatchEvent(new Event("input", { bubbles: true }));

      if (i < words.length - 1) {
        await new Promise((r) => setTimeout(r, delayPerChunk));
      }
    }

    el.setSelectionRange(startIdx, startIdx);
  } else if (target.kind === "editable") {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(target.range);

    const span = document.createElement("span");
    span.className = "ai-highlight-span";

    try {
      target.range.deleteContents();
      target.range.insertNode(span);
    } catch (e) {
      document.execCommand("insertText", false, newText);
      cleanupAfterSuccess(target);
      return;
    }

    const delayPerChunk = Math.max(15, Math.min(45, Math.floor(350 / Math.max(1, words.length))));

    for (let i = 0; i < words.length; i++) {
      currentAccumulated += words[i];
      span.textContent = currentAccumulated;

      if (i < words.length - 1) {
        await new Promise((r) => setTimeout(r, delayPerChunk));
      }
    }

    span.className = "ai-highlight-span-success";
    await new Promise((r) => setTimeout(r, 400));

    const textNode = document.createTextNode(currentAccumulated);
    if (span.parentNode) {
      span.parentNode.replaceChild(textNode, span);
    }

    const newRange = document.createRange();
    newRange.setStartAfter(textNode);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);

    if (el) {
      el.dispatchEvent(new Event("input", { bubbles: true }));
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
  toastEl.style.background = error ? "rgba(225, 29, 72, 0.95)" : "rgba(30, 41, 59, 0.95)";
  toastEl.style.border = error ? "1px solid rgba(244, 63, 94, 0.5)" : "1px solid rgba(148, 163, 184, 0.3)";
  toastEl.style.display = "block";
  clearTimeout(toastTimer);
  if (!sticky) {
    toastTimer = setTimeout(() => (toastEl.style.display = "none"), 3000);
  }
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "GET_TEXT") {
    if (!saved || saved.error) {
      sendResponse({ ok: false, error: saved?.error || "Please select text first to rephrase." });
    } else if (!saved.text.trim()) {
      sendResponse({ ok: false, error: "Please select non-empty text to rephrase." });
    } else {
      startLoadingAnimation(saved);
      sendResponse({ ok: true, text: saved.text });
    }
  } else if (msg.type === "LOADING") {
    startLoadingAnimation(saved);
  } else if (msg.type === "REPLACE") {
    animateTextReplacement(saved, msg.text);
  } else if (msg.type === "ERROR") {
    stopLoadingAnimation(saved);
    toast(msg.message, { error: true });
  }
});

