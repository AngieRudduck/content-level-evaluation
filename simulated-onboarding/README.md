# Simulated onboarding experiences

This folder contains standalone prototypes for comparing onboarding approaches.

## Experiences

- [`ai-skills-navigator-current/`](ai-skills-navigator-current/) recreates the current conversational playlist-building experience in a simplified form.
- [`guided-personalization/`](guided-personalization/) applies a preference-based onboarding flow inspired by Salesforce Trailhead while retaining AI Skills Navigator branding.
- [`catalog-discovery/`](catalog-discovery/) offers a Google-inspired catalog with search and filters for credential, format, level, role, and duration.
- [`career-pathways/`](career-pathways/) uses an AWS-inspired sequence from learning intent to role- or credential-based paths grouped by theme.
- [`sample-content-search/`](sample-content-search/) searches the 100-item AI and machine learning evaluation sample in `content-data/` using credential, format, level, role, and duration filters.
- [`foundry-module-search/`](foundry-module-search/) searches live Microsoft Learn modules and learning paths related to Foundry by level, role, product, subject, and format using the Foundry datasets in `content-data/`.
- [`foundry-guided-discovery/`](foundry-guided-discovery/) guides new Foundry learners toward task-based learning paths or relevant Microsoft credentials.
- [`qualtrics/`](qualtrics/) presents the current conversational onboarding pattern as a deterministic four-step evaluation with Back and Next controls.
- [`suggested-prompts/`](suggested-prompts/) guides learners through one conversational question at a time with suggested prompts and optional custom responses.
- [`chat-native-learning/`](chat-native-learning/) uses suggested prompts to explore a topic and keeps recommended, prerequisite, and next-step learning inside the chat.

Open an experience's `index.html` directly in a browser. No build step or dependencies are required.
