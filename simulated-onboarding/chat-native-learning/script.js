const topicCatalog = {
  multiAgent: {
    match: /multi.?agent|orchestrat|agent solution/i,
    topic: "multi-agent solutions",
    question: "How familiar are you with designing AI agents today?",
    prerequisite: {
      title: "Build your first AI agent",
      description: "Learn agent instructions, tools, grounding, and the basic request lifecycle.",
      meta: ["Beginner", "42 min"],
    },
    recommended: {
      title: "Design multi-agent orchestration",
      description: "Choose coordination patterns, define agent roles, and design reliable handoffs.",
      meta: ["Intermediate", "58 min"],
    },
    next: {
      title: "Evaluate multi-agent systems",
      description: "Trace complete trajectories and assess routing, tool use, recovery, and quality.",
      meta: ["Advanced", "1 hr 12 min"],
    },
  },
  evaluation: {
    match: /evaluat|quality|monitor|observ/i,
    topic: "agent evaluation",
    question: "How much experience do you have evaluating generative AI outputs?",
    prerequisite: {
      title: "Understand generative AI quality",
      description: "Learn the fundamentals of groundedness, relevance, safety, and test datasets.",
      meta: ["Beginner", "35 min"],
    },
    recommended: {
      title: "Evaluate AI apps and agents",
      description: "Select evaluators, run test suites, and diagnose quality and safety failures.",
      meta: ["Intermediate", "1 hr 5 min"],
    },
    next: {
      title: "Operationalize evaluation pipelines",
      description: "Calibrate automated judges and add evaluation gates to delivery workflows.",
      meta: ["Advanced", "1 hr 20 min"],
    },
  },
  security: {
    match: /secur|protect|guardrail|govern/i,
    topic: "AI application security",
    question: "How familiar are you with securing cloud applications?",
    prerequisite: {
      title: "Understand AI workload risks",
      description: "Identify prompt, data, identity, model, and tool-use risks in AI systems.",
      meta: ["Beginner", "38 min"],
    },
    recommended: {
      title: "Secure Microsoft Foundry solutions",
      description: "Apply identity, network, data protection, content safety, and access controls.",
      meta: ["Intermediate", "1 hr 8 min"],
    },
    next: {
      title: "Design enterprise AI security",
      description: "Define trust boundaries, policy, threat response, and governance at scale.",
      meta: ["Advanced", "1 hr 25 min"],
    },
  },
};

const confidenceLabels = {
  new: "I’m new to this",
  familiar: "I know the basics",
  experienced: "I’ve built something similar",
};

const thread = document.querySelector("#thread");
const composer = document.querySelector("#composer");
const messageInput = document.querySelector("#message-input");
const sendButton = document.querySelector(".send-button");
const guidedSuggestions = document.querySelector("#guided-suggestions");
const userMessageTemplate = document.querySelector("#user-message-template");
const assistantMessageTemplate = document.querySelector("#assistant-message-template");

let stage = "topic";
let selectedTopic = topicCatalog.multiAgent;

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

function findTopic(text) {
  return Object.values(topicCatalog).find((topic) => topic.match.test(text)) || topicCatalog.multiAgent;
}

function disablePromptGroup(group) {
  group.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
  });
  guidedSuggestions.hidden = true;
}

function askConfidence() {
  const { body, article } = createAssistantMessage();
  body.append(
    createBubble(
      `Great. I can map a route into ${selectedTopic.topic}, including a gentler starting point and where to go afterward. ${selectedTopic.question}`,
    ),
  );
  createPromptGroup(
    "Choose the closest match",
    Object.entries(confidenceLabels).map(([value, label]) => ({ label, value })),
    "confidence",
  );
  stage = "confidence";
  article.scrollIntoView({ behavior: "smooth", block: "center" });
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

function showLearningMap(confidence) {
  const { body, article } = createAssistantMessage();
  const intro = confidence === "new"
    ? `Since this is new territory, I’d start with the foundation below. Your main ${selectedTopic.topic} topic will be ready when those concepts feel comfortable.`
    : confidence === "experienced"
      ? `You already have useful context, so you can begin with the main recommendation. I’ve kept the foundation nearby as a quick check rather than a required step.`
      : `The main recommendation should fit your current knowledge. Use the foundation if any concepts feel unfamiliar, then continue into the advanced topic.`;
  const map = document.createElement("div");
  map.className = "learning-map";
  map.append(
    buildLearningCard("prerequisite", "If you want to revisit some concepts", selectedTopic.prerequisite),
    buildLearningCard("recommended", "Start here", selectedTopic.recommended),
    buildLearningCard("next", "Where this can take you", selectedTopic.next),
  );
  body.append(
    createBubble(intro),
    map,
  );
  createPromptGroup(
    "Explore this learning route",
    [
      { label: "Start with the prerequisite", value: "prerequisite" },
      { label: "This level works for me", value: "recommended" },
      { label: "Show me what comes next", value: "next" },
    ],
    "route",
  );
  stage = "route";
  article.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showRouteDetail(route) {
  const routeLabels = {
    prerequisite: "Let’s strengthen the foundation first",
    recommended: "Your recommended topic is ready",
    next: "Here’s the next horizon",
  };
  const detailContent = selectedTopic[route];
  const { body, article } = createAssistantMessage();
  const panel = document.createElement("section");
  const title = document.createElement("h2");
  const description = document.createElement("p");
  const outcomes = document.createElement("ul");
  const outcomeText = route === "prerequisite"
    ? ["Recognize the core concepts", "Practice with a focused example", "Check your readiness for the main topic"]
    : route === "recommended"
      ? ["Apply the core design pattern", "Work through a realistic scenario", "Validate your understanding with a knowledge check"]
      : ["Connect this topic to production practice", "Handle more complex failure modes", "Build toward an advanced role or credential"];

  panel.className = "detail-panel";
  title.textContent = detailContent.title;
  description.textContent = `${detailContent.description} Estimated time: ${detailContent.meta[1]}.`;
  outcomeText.forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    outcomes.append(item);
  });
  panel.append(title, description, outcomes);
  body.append(
    createBubble(`${routeLabels[route]}. I’ll keep the rest of the route connected so you can move backward or forward whenever you need.`),
    panel,
  );
  createPromptGroup(
    "Keep exploring",
    [
      { label: "Compare all three again", value: "compare" },
      { label: "Explore another topic", value: "restart" },
    ],
    "detail",
  );
  stage = "detail";
  article.scrollIntoView({ behavior: "smooth", block: "center" });
}

function restartConversation() {
  const { body, article } = createAssistantMessage();
  body.append(createBubble("What would you like to explore next?"));
  createPromptGroup(
    "Suggested prompts",
    [
      { label: "Build a multi-agent solution", value: "I want to build a multi-agent solution" },
      { label: "Evaluate an AI agent", value: "Help me evaluate an AI agent" },
      { label: "Secure AI applications", value: "How do I secure AI applications?" },
    ],
    "topic",
  );
  stage = "topic";
  article.scrollIntoView({ behavior: "smooth", block: "center" });
}

function handleResponse(value, group) {
  disablePromptGroup(group);

  if (group.dataset.promptGroup === "topic") {
    selectedTopic = findTopic(value);
    appendUserMessage(value);
    askConfidence();
    return;
  }

  if (group.dataset.promptGroup === "confidence") {
    appendUserMessage(confidenceLabels[value]);
    showLearningMap(value);
    return;
  }

  if (group.dataset.promptGroup === "route") {
    const labels = {
      prerequisite: "Start with the prerequisite",
      recommended: "This level works for me",
      next: "Show me what comes next",
    };
    appendUserMessage(labels[value]);
    showRouteDetail(value);
    return;
  }

  if (value === "restart") {
    appendUserMessage("Explore another topic");
    restartConversation();
  } else {
    appendUserMessage("Compare all three again");
    showLearningMap("familiar");
  }
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

  if (stage === "topic") {
    selectedTopic = findTopic(value);
    appendUserMessage(value);
    askConfidence();
  } else {
    appendUserMessage(value);
    const { body, article } = createAssistantMessage();
    body.append(createBubble("I’ll use that as context. Here’s a learning route you can adjust as you go."));
    article.scrollIntoView({ behavior: "smooth", block: "center" });
    showLearningMap("familiar");
  }

  messageInput.value = "";
  messageInput.style.height = "auto";
  sendButton.disabled = true;
});