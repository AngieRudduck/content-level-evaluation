const learningOptions = {
  foundation: {
    ai: {
      label: "AI fundamentals",
      match: /\bai\b|artificial intelligence|machine learning/i,
      title: "Explore artificial intelligence fundamentals",
      description: "Learn how AI systems use data, models, and prompts to produce useful results.",
      next: "Apply the concepts in a guided AI scenario.",
    },
    copilot: {
      label: "What Microsoft 365 Copilot is",
      match: /microsoft 365|m365|copilot/i,
      title: "Understand Microsoft 365 Copilot",
      description: "Learn how Copilot works across Microsoft 365 apps and uses your work context.",
      next: "Practice writing prompts for common workplace tasks.",
    },
    cloud: {
      label: "Cloud concepts",
      match: /cloud|azure/i,
      title: "Understand cloud computing concepts",
      description: "Learn the core ideas behind cloud services, shared responsibility, and consumption models.",
      next: "Explore how common Azure services support a cloud solution.",
    },
  },
  task: {
    powerBi: {
      label: "Build a Power BI report",
      match: /power bi|report|dashboard|visual/i,
      title: "Build your first Power BI report",
      description: "Connect to data, shape a model, and create visuals that answer a business question.",
      next: "Publish the report and improve it with audience feedback.",
    },
    agent: {
      label: "Build an agent",
      match: /agent|copilot studio/i,
      title: "Build your first AI agent",
      description: "Define instructions, add knowledge and tools, then test the agent against realistic requests.",
      next: "Evaluate the agent and prepare it for production use.",
    },
    fineTune: {
      label: "Fine-tune a language model",
      match: /fine.?tun|language model|llm|model/i,
      title: "Fine-tune a language model",
      description: "Prepare training data, run a fine-tuning job, and evaluate whether the result improved.",
      next: "Compare the fine-tuned model with prompting and retrieval approaches.",
    },
  },
};

const intentLabels = {
  foundation: "Build foundational knowledge",
  task: "Learn a task-based skill",
  credential: "Work toward a credential",
};

const formatLabels = {
  interactive: "Text-based learning",
  video: "Video",
  handsOn: "Hands-on exercise",
};

const timeLabels = {
  quick: "15 minutes or less",
  focused: "30–60 minutes",
  deep: "More than an hour",
};

const thread = document.querySelector("#thread");
const composer = document.querySelector("#composer");
const messageInput = document.querySelector("#message-input");
const sendButton = document.querySelector(".send-button");
const guidedSuggestions = document.querySelector("#guided-suggestions");
const composerShell = document.querySelector(".composer-shell");
const userMessageTemplate = document.querySelector("#user-message-template");
const assistantMessageTemplate = document.querySelector("#assistant-message-template");

let stage = "intent";
let selectedIntent = "";
let selectedLearning = null;
let selectedFormat = "";

function updateComposerHeight() {
  document.documentElement.style.setProperty(
    "--composer-height",
    `${Math.ceil(composerShell.getBoundingClientRect().height)}px`,
  );
}

new ResizeObserver(updateComposerHeight).observe(composerShell);
updateComposerHeight();

function scrollMessageAboveComposer(message) {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      const messageBottom = message.getBoundingClientRect().bottom;
      const visibleBottom = composerShell.getBoundingClientRect().top - 24;

      if (messageBottom > visibleBottom) {
        window.scrollBy({
          top: messageBottom - visibleBottom,
          behavior: "smooth",
        });
      }
    });
  });
}

function formatTime(date = new Date()) {
  return new Intl.DateTimeFormat([], {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function appendUserMessage(text) {
  const message = userMessageTemplate.content.cloneNode(true);
  message.querySelector(".message-time").textContent = formatTime();
  message.querySelector(".user-message").textContent = text;
  thread.append(message);
}

function createAssistantMessage() {
  const fragment = assistantMessageTemplate.content.cloneNode(true);
  const article = fragment.querySelector("article");
  const body = fragment.querySelector(".message-body");
  fragment.querySelector("time").textContent = formatTime();
  thread.append(fragment);
  return { article, body };
}

function createBubble(text) {
  const bubble = document.createElement("div");
  const paragraph = document.createElement("p");
  bubble.className = "bubble";
  paragraph.textContent = text;
  bubble.append(paragraph);
  return bubble;
}

function createPromptGroup(label, prompts, groupName) {
  const promptLabel = document.createElement("p");
  const list = document.createElement("div");
  promptLabel.className = "prompt-label";
  promptLabel.textContent = label;
  list.className = "prompt-list";
  list.dataset.promptGroup = groupName;

  prompts.forEach(({ label: promptText, value }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.value = value;
    button.textContent = promptText;
    list.append(button);
  });

  guidedSuggestions.replaceChildren(promptLabel, list);
  guidedSuggestions.hidden = false;
}

function disablePromptGroup(group) {
  group.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
  });
  guidedSuggestions.hidden = true;
}

function findLearningOption(intent, text) {
  return Object.values(learningOptions[intent]).find((option) => option.match.test(text)) || {
    label: text,
    title: intent === "foundation" ? `Build a foundation in ${text}` : `Learn how to ${text}`,
    description: intent === "foundation"
      ? `Develop the core concepts and vocabulary you need to understand ${text}.`
      : `Follow a practical learning path that helps you complete this task with confidence.`,
    next: "Use what you learned in a realistic scenario.",
  };
}

function askLearningInterest() {
  const isFoundation = selectedIntent === "foundation";
  const { body, article } = createAssistantMessage();
  body.append(
    createBubble(
      isFoundation
        ? "What would you like to understand better?"
        : "What skill or task would you like to learn?",
    ),
  );
  createPromptGroup(
    isFoundation ? "Choose a topic" : "Choose a skill",
    Object.entries(learningOptions[selectedIntent]).map(([value, option]) => ({
      label: option.label,
      value,
    })),
    "learning",
  );
  stage = "learning";
  scrollMessageAboveComposer(article);
}

function askFormat() {
  const { body, article } = createAssistantMessage();
  body.append(createBubble(`How would you prefer to learn about ${selectedLearning.label}?`));
  createPromptGroup(
    "Choose a format",
    Object.entries(formatLabels).map(([value, label]) => ({ label, value })),
    "format",
  );
  stage = "format";
  scrollMessageAboveComposer(article);
}

function askAvailableTime() {
  const { body, article } = createAssistantMessage();
  body.append(createBubble("How much time do you have available right now?"));
  createPromptGroup(
    "Choose a time",
    Object.entries(timeLabels).map(([value, label]) => ({ label, value })),
    "time",
  );
  stage = "time";
  scrollMessageAboveComposer(article);
}

function buildLearningCard(kind, label, content) {
  const card = document.createElement("article");
  const kicker = document.createElement("p");
  const title = document.createElement("h2");
  const description = document.createElement("p");
  const meta = document.createElement("div");
  card.className = `learning-card ${kind}`;
  kicker.className = "card-kicker";
  kicker.textContent = label;
  title.textContent = content.title;
  description.textContent = content.description;
  meta.className = "card-meta";
  content.meta.forEach((item) => {
    const detail = document.createElement("span");
    detail.textContent = item;
    meta.append(detail);
  });
  card.append(kicker, title, description, meta);
  return card;
}

function showRecommendation(availableTime) {
  const { body, article } = createAssistantMessage();
  const map = document.createElement("div");
  const recommendation = {
    title: selectedLearning.title,
    description: selectedLearning.description,
    meta: [selectedFormat, availableTime],
  };
  const nextStep = {
    title: "Continue when you’re ready",
    description: selectedLearning.next,
    meta: [selectedIntent === "foundation" ? "Build on the fundamentals" : "Apply the skill"],
  };
  map.className = "learning-map";
  map.append(
    buildLearningCard("recommended", "Recommended for you", recommendation),
    buildLearningCard("next", "Next step", nextStep),
  );
  body.append(
    createBubble(
      `Here’s a learning route for ${selectedLearning.label} in your preferred format and available time.`,
    ),
    map,
  );
  createPromptGroup(
    "Keep exploring",
    [{ label: "Start over", value: "restart" }],
    "complete",
  );
  stage = "complete";
  scrollMessageAboveComposer(article);
}

function showCredentialOverview() {
  const { body, article } = createAssistantMessage();
  const panel = document.createElement("section");
  const title = document.createElement("h2");
  const description = document.createElement("p");
  const link = document.createElement("a");
  panel.className = "detail-panel credential-panel";
  title.textContent = "Explore Microsoft Credentials";
  description.textContent = "Compare certifications, Applied Skills, and credential paths by role and technology.";
  link.className = "credential-link";
  link.href = "https://learn.microsoft.com/credentials/";
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = "View the credentials overview";
  panel.append(title, description, link);
  body.append(
    createBubble("The credentials overview is the best place to compare the available paths and choose one that matches your goal."),
    panel,
  );
  createPromptGroup(
    "Keep exploring",
    [{ label: "Choose a different learning goal", value: "restart" }],
    "complete",
  );
  stage = "complete";
  scrollMessageAboveComposer(article);
}

function restartConversation() {
  const { body, article } = createAssistantMessage();
  body.append(createBubble("What kind of learning are you looking for?"));
  createPromptGroup(
    "Choose a learning goal",
    Object.entries(intentLabels).map(([value, label]) => ({ label, value })),
    "intent",
  );
  stage = "intent";
  selectedIntent = "";
  selectedLearning = null;
  selectedFormat = "";
  scrollMessageAboveComposer(article);
}

function handleIntent(value, displayedValue = intentLabels[value]) {
  selectedIntent = value;
  appendUserMessage(displayedValue);

  if (selectedIntent === "credential") {
    showCredentialOverview();
  } else {
    askLearningInterest();
  }
}

function handleResponse(value, group) {
  disablePromptGroup(group);
  const groupName = group.dataset.promptGroup;

  if (groupName === "intent") {
    handleIntent(value);
    return;
  }

  if (groupName === "learning") {
    selectedLearning = learningOptions[selectedIntent][value];
    appendUserMessage(selectedLearning.label);
    askFormat();
    return;
  }

  if (groupName === "format") {
    selectedFormat = formatLabels[value];
    appendUserMessage(selectedFormat);
    askAvailableTime();
    return;
  }

  if (groupName === "time") {
    appendUserMessage(timeLabels[value]);
    showRecommendation(timeLabels[value]);
    return;
  }

  appendUserMessage("Start over");
  restartConversation();
}

function inferIntent(text) {
  if (/credential|certification|exam|applied skill/i.test(text)) return "credential";
  if (/task|build|create|make|fine.?tun|report|agent/i.test(text)) return "task";
  return "foundation";
}

guidedSuggestions.addEventListener("click", (event) => {
  const button = event.target.closest(".prompt-list button");
  if (!button || button.disabled) return;
  handleResponse(button.dataset.value, button.closest(".prompt-list"));
});

messageInput.addEventListener("input", () => {
  sendButton.disabled = !messageInput.value.trim();
  messageInput.style.height = "auto";
  messageInput.style.height = `${Math.min(messageInput.scrollHeight, 130)}px`;
});

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    composer.requestSubmit();
  }
});

composer.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = messageInput.value.trim();
  if (!value) return;

  const activeGroup = guidedSuggestions.querySelector(".prompt-list");
  if (activeGroup) disablePromptGroup(activeGroup);

  if (stage === "intent") {
    handleIntent(inferIntent(value), value);
  } else if (stage === "learning") {
    appendUserMessage(value);
    selectedLearning = findLearningOption(selectedIntent, value);
    askFormat();
  } else if (stage === "format") {
    appendUserMessage(value);
    selectedFormat = value;
    askAvailableTime();
  } else if (stage === "time") {
    appendUserMessage(value);
    showRecommendation(value);
  } else {
    appendUserMessage(value);
    restartConversation();
  }

  messageInput.value = "";
  messageInput.style.height = "auto";
  sendButton.disabled = true;
});
