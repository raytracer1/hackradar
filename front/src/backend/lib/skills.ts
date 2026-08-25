// Skill taxonomy shared by the SkillSelect UI and the /api/recommend
// matching engine. Pure data — must not import anything server-only.
//
// Aliases are lowercase match strings drawn from the live dataset's theme /
// description vocabulary (devpost "Machine Learning/AI", taikai "Bittensor",
// kaggle "time series", dorahacks "DeFi", ...). Keep aliases tight: each is
// matched with word boundaries, and over-broad aliases create false hits.

export interface Skill {
  id: string;
  label: string;
  aliases: string[];
}

export interface SkillGroup {
  name: string;
  skills: Skill[];
}

export const SKILL_GROUPS: SkillGroup[] = [
  {
    name: 'AI / Machine Learning',
    skills: [
      { id: 'machine-learning', label: 'Machine Learning', aliases: ['machine learning', 'machine learning/ai', 'ai/ml', 'artificial intelligence', 'ai'] },
      { id: 'llm-agents', label: 'LLM / AI Agents', aliases: ['llm', 'llms', 'large language model', 'large language models', 'ai agents', 'agentic', 'langchain', 'gpt', 'rag', 'prompt'] },
      { id: 'generative-ai', label: 'Generative AI', aliases: ['generative ai', 'genai', 'diffusion', 'stable diffusion', 'image generation'] },
      { id: 'computer-vision', label: 'Computer Vision', aliases: ['computer vision', 'image recognition', 'object detection', 'opencv', 'image classification'] },
      { id: 'nlp', label: 'NLP / Text', aliases: ['nlp', 'natural language processing', 'text classification', 'text analysis', 'sentiment'] },
      { id: 'data-science', label: 'Data Science', aliases: ['data science', 'data analysis', 'analytics', 'big data', 'time series', 'statistics', 'predictive'] },
      { id: 'deep-learning', label: 'Deep Learning', aliases: ['deep learning', 'neural network', 'neural networks', 'transformer', 'transformers', 'pytorch', 'tensorflow'] },
      { id: 'reinforcement', label: 'Reinforcement Learning', aliases: ['reinforcement learning', 'rl'] },
    ],
  },
  {
    name: 'Web Development',
    skills: [
      { id: 'web-fullstack', label: 'Web / Full-Stack', aliases: ['web', 'full-stack', 'full stack', 'fullstack', 'web development', 'web dev'] },
      { id: 'frontend', label: 'Frontend', aliases: ['frontend', 'front-end', 'front end'] },
      { id: 'react', label: 'React', aliases: ['react', 'reactjs', 'react.js'] },
      { id: 'nodejs', label: 'Node.js / Backend', aliases: ['node', 'nodejs', 'node.js', 'express', 'backend', 'back-end'] },
      { id: 'nextjs', label: 'Next.js', aliases: ['nextjs', 'next.js', 'next js'] },
      { id: 'typescript', label: 'TypeScript', aliases: ['typescript'] },
      { id: 'api', label: 'APIs', aliases: ['api', 'apis', 'api/sdk'] },
    ],
  },
  {
    name: 'Blockchain / Web3',
    skills: [
      { id: 'blockchain', label: 'Blockchain', aliases: ['blockchain', 'crypto', 'cryptocurrency', 'distributed ledger'] },
      { id: 'web3', label: 'Web3 / DApps', aliases: ['web3', 'web 3', 'dapp', 'dapps', 'smart contract', 'smart contracts'] },
      { id: 'solidity', label: 'Solidity / EVM', aliases: ['solidity', 'evm', 'ethereum', 'erc-20', 'erc20'] },
      { id: 'defi', label: 'DeFi', aliases: ['defi', 'decentralized finance'] },
      { id: 'chains', label: 'Chains & Protocols', aliases: ['gnosis', 'bittensor', 'polkadot', 'solana', 'arbitrum', 'optimism', 'polygon', 'avalanche', 'cosmos', 'near protocol', 'stellar', 'algorand'] },
      { id: 'zk', label: 'Zero-Knowledge', aliases: ['zero knowledge', 'zero-knowledge', 'zkp', 'zk proofs'] },
    ],
  },
  {
    name: 'Mobile',
    skills: [
      { id: 'mobile', label: 'Mobile', aliases: ['mobile', 'ios', 'android', 'flutter', 'react native', 'react-native', 'swift'] },
    ],
  },
  {
    name: 'Game Development',
    skills: [
      { id: 'game-dev', label: 'Game Dev', aliases: ['game', 'gaming', 'game development', 'game dev', 'gamedev', 'unity', 'unreal', 'godot', 'play-to-earn'] },
    ],
  },
  {
    name: 'Cybersecurity',
    skills: [
      { id: 'cybersecurity', label: 'Cybersecurity', aliases: ['cybersecurity', 'cyber security', 'information security', 'infosec', 'penetration testing', 'pentesting', 'capture the flag', 'ctf', 'security'] },
    ],
  },
  {
    name: 'IoT / Hardware',
    skills: [
      { id: 'iot', label: 'IoT / Hardware', aliases: ['iot', 'internet of things', 'hardware', 'embedded', 'robotics', 'arduino', 'raspberry pi', 'sensors'] },
    ],
  },
  {
    name: 'AR / VR',
    skills: [
      { id: 'arvr', label: 'AR / VR', aliases: ['ar/vr', 'augmented reality', 'virtual reality', 'mixed reality', 'spatial computing'] },
    ],
  },
  {
    name: 'Design / UX',
    skills: [
      { id: 'design', label: 'Design / UX', aliases: ['design', 'ui/ux', 'ui design', 'ux design', 'product design', 'figma', 'graphic design'] },
    ],
  },
  {
    name: 'Databases',
    skills: [
      { id: 'databases', label: 'Databases', aliases: ['database', 'databases', 'sql', 'nosql', 'postgres', 'postgresql', 'mongodb'] },
    ],
  },
  {
    name: 'Cloud / DevOps',
    skills: [
      { id: 'cloud', label: 'Cloud / DevOps', aliases: ['cloud', 'cloud computing', 'aws', 'azure', 'gcp', 'google cloud', 'devops', 'docker', 'kubernetes', 'k8s', 'serverless'] },
    ],
  },
  {
    name: 'Fintech',
    skills: [
      { id: 'fintech', label: 'Fintech', aliases: ['fintech', 'financial technology', 'payments', 'banking', 'finance', 'trading'] },
    ],
  },
  {
    name: 'Beginner / No-Code',
    skills: [
      { id: 'beginner', label: 'Beginner Friendly', aliases: ['beginner friendly', 'beginner', 'for beginners', 'starter'] },
      { id: 'nocode', label: 'Low / No Code', aliases: ['no code', 'no-code', 'low code', 'low-code'] },
    ],
  },
  {
    name: 'Productivity & Social',
    skills: [
      { id: 'productivity', label: 'Productivity / SaaS', aliases: ['productivity', 'saas', 'b2b', 'chrome extension', 'browser extension', 'social media'] },
      { id: 'social-good', label: 'Social Good', aliases: ['social good', 'social impact', 'sustainability', 'climate', 'health', 'healthcare', 'education', 'accessibility', 'nonprofit', 'women in tech'] },
      { id: 'open-source', label: 'Open Source', aliases: ['open source', 'open-source', 'oss'] },
    ],
  },
  {
    name: 'Media & Content',
    skills: [
      { id: 'media', label: 'Media & Content', aliases: ['media', 'content creation', 'video', 'audio', 'music', 'photography', 'podcast', 'streaming'] },
    ],
  },
];

const ALL_SKILLS = SKILL_GROUPS.flatMap((g) => g.skills);

const BY_ID = new Map(ALL_SKILLS.map((s) => [s.id, s]));

export function getSkill(id: string): Skill | undefined {
  return BY_ID.get(id);
}

// One word-boundary regex per skill id over all its aliases (escaped —
// aliases contain "/", ".", "+").
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const ALIAS_RE: Record<string, RegExp> = Object.fromEntries(
  ALL_SKILLS.map((s) => [
    s.id,
    new RegExp(`\\b(?:${s.aliases.map(esc).join('|')})\\b`, 'i'),
  ])
);
