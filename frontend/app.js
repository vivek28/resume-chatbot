// ---- Config -----------------------------------------------------------
const API_BASE = "https://ax1fy328f9.execute-api.ap-south-1.amazonaws.com";

// Self-disabling local mock — active only while API_BASE is still the
// placeholder above, so there's a way to exercise the UI (markdown
// rendering, diagram display, FAQ cards) before the backend exists. Once
// API_BASE is a real URL this block is simply never used.
const MOCK_MODE = API_BASE.includes("REPLACE_WITH_API_GATEWAY_URL");

function mockChatResponse(question) {
  if (/job.?fit|job description|paste a job/i.test(question)) {
    return {
      answer:
        "Paste the job description text, or share a link to the posting, and I'll compare it " +
        "against Vivek's actual background:\n\n" +
        "- Pasted text is handled like any other question — retrieved against the knowledge base\n" +
        "- A shared link is fetched securely (HTTPS-only, private-network addresses blocked) and " +
        "its content is used as context\n\n" +
        "Go ahead and try it!",
      diagramUrl: null,
    };
  }
  if (/chatbot|architecture|built/i.test(question)) {
    return {
      answer:
        "This chatbot is a **Retrieval-Augmented Generation** system on AWS Bedrock:\n\n" +
        "- Knowledge base content lives in S3, embedded via Titan and indexed in S3 Vectors\n" +
        "- Generation runs on Claude Sonnet via Bedrock\n" +
        "- Lambda + API Gateway handle requests, DynamoDB logs Q&A and tracks session cost\n\n" +
        "See the [full write-up](https://example.com) for more detail.",
      diagramUrl: "architecture-diagram.svg",
    };
  }
  return {
    answer:
      "**Mock response** — the real backend isn't deployed yet. Vivek has 10+ years of BI/analytics experience, most recently at Amazon.",
    diagramUrl: null,
  };
}

function mockFaqResponse() {
  return {
    faqs: [
      { question: "What's Vivek's AWS experience?", answer: "Redshift, S3, Athena, Glue, Lambda, IAM.", count: 5 },
      { question: "Why should we hire Vivek?", answer: "10+ years turning data into decisions, most recently at Amazon.", count: 3 },
    ],
  };
}

// Set true right after the "Check Job Fit" workflow button is clicked, sent
// with the NEXT message as `isJdFit`, then reset — lets the backend exclude
// this specific message from the FAQ counter without guessing from text
// content alone (which misses free-form fit questions with no URL/length
// signal — see CLAUDE.md).
let jdFitModeActive = false;

const STARTER_QUESTIONS = [
  "What's Vivek's experience with AWS?",
  "What's his experience with SQL and Redshift?",
  "What technologies has Vivek worked on?",
  "How was this chatbot itself built?",
  "How does the job-fit matching work?",
];

// ---- Session id (drives the $2/session cost cap server-side) ----------
function getSessionId() {
  let id = localStorage.getItem("chatSessionId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("chatSessionId", id);
  }
  return id;
}

const sessionId = getSessionId();

// ---- Elements -----------------------------------------------------------
const messagesEl = document.getElementById("messages");
const typingEl = document.getElementById("typing-indicator");
const formEl = document.getElementById("chat-form");
const inputEl = document.getElementById("chat-input");
const sendButtonEl = document.getElementById("send-button");
const errorEl = document.getElementById("chat-error");
const suggestionsEl = document.getElementById("suggestions");
const faqListEl = document.getElementById("faq-list");
const chatWindowEl = document.getElementById("chat-window");
const jdFitButtonEl = document.getElementById("jd-fit-button");
const chatSectionEl = document.getElementById("chat-section");
const jdFitModalEl = document.getElementById("jd-fit-modal");
const jdFitModalContentEl = document.getElementById("jd-fit-modal-content");
const jdFitModalCloseEl = document.getElementById("jd-fit-modal-close");
const jdFitModalOkEl = document.getElementById("jd-fit-modal-ok");

// ---- Message rendering ---------------------------------------------------
// Everything below builds DOM nodes directly (createElement/textContent) —
// never innerHTML with user-controlled or model-generated text, so even a
// deliberately adversarial answer can't inject markup. The tiny markdown
// parser below only recognizes **bold** and [text](url) (http/https/mailto
// only) — matched text becomes a real DOM node via textContent, never a raw
// HTML string.

// Only our own known static asset may ever be shown as a diagram — the
// Lambda decides *whether* to include one (from Bedrock's citations, not
// from anything the model free-generates), but the frontend independently
// re-validates against this allowlist before rendering, as defense in depth.
const ALLOWED_DIAGRAMS = new Set(["architecture-diagram.svg"]);

function renderInlineMarkdown(text, container) {
  const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g;
  let lastIndex = 0;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      container.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
    }
    if (match[1] !== undefined) {
      const strong = document.createElement("strong");
      strong.textContent = match[1];
      container.appendChild(strong);
    } else {
      const a = document.createElement("a");
      a.href = match[3];
      a.textContent = match[2];
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      container.appendChild(a);
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) {
    container.appendChild(document.createTextNode(text.slice(lastIndex)));
  }
}

// GFM-style pipe tables: a header row, a separator row (|---|---|), then
// data rows. Fit-level cells (Strong Fit / Fit / Gap) get a colored badge
// so the table reads at a glance, not just as plain text in a grid.
const TABLE_SEPARATOR_PATTERN = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;
const FIT_LEVEL_CLASS = {
  "strong fit": "fit-strong",
  fit: "fit-mid",
  gap: "fit-gap",
};

function isTableRow(line) {
  return line.includes("|") && line.trim() !== "";
}

function parseTableCells(line) {
  let trimmed = line.trim();
  if (trimmed.startsWith("|")) trimmed = trimmed.slice(1);
  if (trimmed.endsWith("|")) trimmed = trimmed.slice(0, -1);
  return trimmed.split("|").map((c) => c.trim());
}

function renderTableCell(text, cellEl) {
  const key = text.trim().toLowerCase();
  const fitClass = FIT_LEVEL_CLASS[key];
  if (fitClass) {
    const badge = document.createElement("span");
    badge.className = `fit-badge ${fitClass}`;
    badge.textContent = text.trim();
    cellEl.appendChild(badge);
  } else {
    renderInlineMarkdown(text, cellEl);
  }
}

function renderMarkdownBlock(text, container) {
  const lines = text.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (
      isTableRow(line) &&
      i + 1 < lines.length &&
      TABLE_SEPARATOR_PATTERN.test(lines[i + 1]) &&
      lines[i + 1].includes("-")
    ) {
      const table = document.createElement("table");
      const thead = document.createElement("thead");
      const headRow = document.createElement("tr");
      parseTableCells(line).forEach((cellText) => {
        const th = document.createElement("th");
        renderTableCell(cellText, th);
        headRow.appendChild(th);
      });
      thead.appendChild(headRow);
      table.appendChild(thead);
      i += 2; // skip header + separator

      const tbody = document.createElement("tbody");
      while (i < lines.length && isTableRow(lines[i])) {
        const row = document.createElement("tr");
        parseTableCells(lines[i]).forEach((cellText) => {
          const td = document.createElement("td");
          renderTableCell(cellText, td);
          row.appendChild(td);
        });
        tbody.appendChild(row);
        i++;
      }
      table.appendChild(tbody);
      container.appendChild(table);
    } else if (/^\s*-\s+/.test(line)) {
      const ul = document.createElement("ul");
      while (i < lines.length && /^\s*-\s+/.test(lines[i])) {
        const li = document.createElement("li");
        renderInlineMarkdown(lines[i].replace(/^\s*-\s+/, ""), li);
        ul.appendChild(li);
        i++;
      }
      container.appendChild(ul);
    } else if (line.trim() === "") {
      i++;
    } else {
      const p = document.createElement("p");
      renderInlineMarkdown(line, p);
      container.appendChild(p);
      i++;
    }
  }
}

function appendUserMessage(text, isJdFitRequest) {
  const bubble = document.createElement("div");
  bubble.className = isJdFitRequest ? "msg user jd-fit-request" : "msg user";

  if (isJdFitRequest) {
    const label = document.createElement("div");
    label.className = "jd-fit-label jd-fit-label-on-dark";
    label.textContent = "Job Fit Request";
    bubble.appendChild(label);
  }

  const textEl = document.createElement("div");
  textEl.textContent = text;
  bubble.appendChild(textEl);

  messagesEl.appendChild(bubble);
  chatWindowEl.scrollTop = chatWindowEl.scrollHeight;
}

function appendBotMessage(text, diagramUrl, isJdFitResult) {
  const bubble = document.createElement("div");
  bubble.className = isJdFitResult ? "msg bot jd-fit-result" : "msg bot";

  if (isJdFitResult) {
    const label = document.createElement("div");
    label.className = "jd-fit-label";
    label.textContent = "Job Fit Result";
    bubble.appendChild(label);
  }

  renderMarkdownBlock(text, bubble);

  if (diagramUrl && ALLOWED_DIAGRAMS.has(diagramUrl)) {
    const img = document.createElement("img");
    img.src = diagramUrl;
    img.alt = "Resume chatbot architecture diagram";
    img.className = "msg-diagram";
    bubble.appendChild(img);
  }

  messagesEl.appendChild(bubble);
  // Scroll so the TOP of the new message is visible, not just the container
  // bottom — for a long answer, jumping straight to the bottom would show
  // its tail end first instead of the actual content.
  bubble.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setTyping(isTyping) {
  typingEl.hidden = !isTyping;
  if (isTyping) {
    chatWindowEl.scrollTop = chatWindowEl.scrollHeight;
  }
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function clearError() {
  errorEl.hidden = true;
  errorEl.textContent = "";
}

// ---- Suggested starter questions ---------------------------------------
function renderSuggestions() {
  suggestionsEl.innerHTML = "";
  STARTER_QUESTIONS.forEach((q) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "suggestion-chip";
    chip.textContent = q;
    chip.addEventListener("click", () => sendMessage(q));
    suggestionsEl.appendChild(chip);
  });
}

// ---- Chat send ------------------------------------------------------------
async function sendMessage(question) {
  const trimmed = question.trim();
  if (!trimmed) return;

  clearError();
  const isJdFit = jdFitModeActive;
  jdFitModeActive = false;
  appendUserMessage(trimmed, isJdFit);
  inputEl.value = "";
  sendButtonEl.disabled = true;
  setTyping(true);

  try {
    let data;
    if (MOCK_MODE) {
      await new Promise((r) => setTimeout(r, 500));
      data = mockChatResponse(trimmed);
    } else {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, sessionId, isJdFit }),
      });
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      data = await response.json();
    }
    setTyping(false);
    appendBotMessage(data.answer || "Sorry, something went wrong on my end.", data.diagramUrl, isJdFit);
  } catch (err) {
    setTyping(false);
    showError(
      "Couldn't reach the server just now — please try again in a moment, or email anandhan.vivek91@gmail.com directly."
    );
  } finally {
    sendButtonEl.disabled = false;
  }
}

formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage(inputEl.value);
});

// ---- FAQ section (sidebar shows top 3 only) --------------------------------
const FAQ_SIDEBAR_LIMIT = 3;

function renderFaq(faqs) {
  faqListEl.innerHTML = "";

  if (!faqs || faqs.length === 0) {
    const empty = document.createElement("p");
    empty.className = "faq-empty";
    empty.textContent = "No questions asked yet — be the first!";
    faqListEl.appendChild(empty);
    return;
  }

  // Same behavior as a suggested-question chip: clicking asks the question
  // in chat, rather than expanding an inline answer preview.
  faqs.slice(0, FAQ_SIDEBAR_LIMIT).forEach((faq) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "faq-card";

    const questionText = document.createElement("span");
    questionText.textContent = faq.question;

    const badge = document.createElement("span");
    badge.className = "faq-badge";
    badge.textContent = `Asked ${faq.count}x`;

    card.appendChild(questionText);
    card.appendChild(badge);
    card.addEventListener("click", () => sendMessage(faq.question));

    faqListEl.appendChild(card);
  });
}

async function loadFaq() {
  try {
    let data;
    if (MOCK_MODE) {
      data = mockFaqResponse();
    } else {
      const response = await fetch(`${API_BASE}/faq`);
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      data = await response.json();
    }
    renderFaq(data.faqs);
  } catch (err) {
    faqListEl.innerHTML = "";
    const msg = document.createElement("p");
    msg.className = "faq-empty";
    msg.textContent = "Frequently asked questions will appear here once available.";
    faqListEl.appendChild(msg);
  }
}

// ---- Dedicated JD-fit entry point -----------------------------------------
// A canned, frontend-only invite — no API call, so it doesn't touch the
// $2/session cap. Shown as a popup (not a chat message); the question the
// user then submits and the resulting answer both stay purely in-chat
// (highlighted — see .jd-fit-request/.jd-fit-result), no popup for those.
jdFitButtonEl.addEventListener("click", () => {
  chatSectionEl.scrollIntoView({ behavior: "smooth", block: "start" });
  showJdFitModal(
    "Paste a job description, or share a link to the posting, and I'll compare it against Vivek's background."
  );
  inputEl.placeholder = "Paste a job description or link here...";
  jdFitModeActive = true;
});

// ---- Job Fit result modal ---------------------------------------------------
// Additive on top of the chat, not a replacement — the answer is already in
// the chat thread (highlighted) regardless of this modal. No auto-close
// timeout: this is real content someone needs time to read.
function showJdFitModal(text) {
  jdFitModalContentEl.innerHTML = "";
  renderMarkdownBlock(text, jdFitModalContentEl);
  jdFitModalEl.hidden = false;
  jdFitModalOkEl.focus();
  document.addEventListener("keydown", handleJdFitModalKeydown);
}

function hideJdFitModal() {
  jdFitModalEl.hidden = true;
  document.removeEventListener("keydown", handleJdFitModalKeydown);
  inputEl.focus();
}

function handleJdFitModalKeydown(e) {
  if (e.key === "Escape") hideJdFitModal();
}

jdFitModalCloseEl.addEventListener("click", hideJdFitModal);
jdFitModalOkEl.addEventListener("click", hideJdFitModal);
jdFitModalEl.addEventListener("click", (e) => {
  if (e.target === jdFitModalEl) hideJdFitModal();
});

// ---- Init -----------------------------------------------------------------
renderSuggestions();
loadFaq();
