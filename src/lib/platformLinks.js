// Centralized links to the docs subdomain and GitHub repo so every component
// references the same destination. Main site = discover/learn; docs = deep
// reference; GitHub = build/contribute.
export const DOCS_BASE = 'https://docs.theblockchainlibrary.com';
export const GITHUB_URL = 'https://github.com/jasonansellto/the-blockchain-library';

export const platformLinks = {
  quickstart: `${DOCS_BASE}/getting-started/quickstart`,
  knowledgeEngine: `${DOCS_BASE}/knowledge-engine/overview`,
  knowledgeGraph: `${DOCS_BASE}/knowledge-engine/knowledge-graph`,
  aiLearning: `${DOCS_BASE}/knowledge-engine/ai-learning`,
  topicsCatalog: `${DOCS_BASE}/generated/catalogs/topics`,
  glossaryCatalog: `${DOCS_BASE}/generated/catalogs/glossary`,
  booksCatalog: `${DOCS_BASE}/generated/catalogs/books`,
  researchCatalog: `${DOCS_BASE}/generated/catalogs/research`,
  codeExamples: `${DOCS_BASE}/generated/catalogs/code-examples`,
  learningPath: `${DOCS_BASE}/learn/learning-path`,
  developersOverview: `${DOCS_BASE}/developers/overview`,
  researchOverview: `${DOCS_BASE}/research/overview`,
  architecture: `${GITHUB_URL}/blob/main/ARCHITECTURE.md`,
  vision: `${GITHUB_URL}/blob/main/VISION.md`,
  roadmap: `${GITHUB_URL}/blob/main/ROADMAP.md`,
  contributing: `${GITHUB_URL}/blob/main/CONTRIBUTING.md`,
  github: GITHUB_URL,
};

// Platform statistics — current object counts. Presented as "and growing".
export const platformStats = [
  { value: '100+', label: 'Canonical Topic Objects' },
  { value: '250+', label: 'Structured Glossary Definitions' },
  { value: '9', label: 'Books Connected to the Knowledge Graph' },
  { value: '10', label: 'Tutorials' },
  { value: '10', label: 'Developer Code Examples' },
  { value: '10', label: 'AI Prompt Patterns' },
  { value: '10', label: 'Knowledge Checks / Quizzes' },
  { value: '2', label: 'Structured Learning Paths' },
];