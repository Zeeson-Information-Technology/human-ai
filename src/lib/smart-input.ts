// Client-side helpers to suggest corrections and normalization for job titles/roles.

function titleCaseToken(token: string) {
  if (!token) return token;
  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}

// Damerau–Levenshtein distance (adds transposition) — lightweight and good enough
function dlDistance(a: string, b: string) {
  const al = a.length;
  const bl = b.length;
  const dp: number[][] = Array.from({ length: al + 1 }, () => new Array(bl + 1).fill(0));
  for (let i = 0; i <= al; i++) dp[i][0] = i;
  for (let j = 0; j <= bl; j++) dp[0][j] = j;
  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
      }
    }
  }
  return dp[al][bl];
}

const PHRASE_FIXES: Array<[RegExp, string]> = [
  [/full\s*-?\s*stack/i, "Full-Stack"],
  [/front\s*-?\s*end/i, "Frontend"],
  [/back\s*-?\s*end/i, "Backend"],
  [/machine\s*learning/i, "Machine Learning"],
  [/data\s*scientist/i, "Data Scientist"],
  [/data\s*engineer/i, "Data Engineer"],
  [/product\s*manager/i, "Product Manager"],
];

const CANONICAL_TOKENS = new Set([
  // Roles / functions
  "annotator","annotation","linguist","labeler","labeller","labeling","labelling","transcriber","transcription",
  "software","developer","engineer","scientist","manager","designer","analyst","consultant","lead","senior","junior","mid",
  "frontend","backend","full-stack","mobile","ios","android","product","project","qa","sre","devops",
  // Languages
  "yoruba","igbo","hausa","swahili","amharic","zulu","xhosa","afrikaans","pidgin","arabic","french","english","spanish","portuguese","german","italian","russian","turkish","hindi","bengali","urdu","chinese","japanese","korean","indonesian","vietnamese","thai","malay","polish","swedish","norwegian","danish","finnish","greek","czech","romanian",
  // Common tech stack tokens
  "react","reactjs","react-native","next","nextjs","nextjs","nextjs","angular","vue","svelte",
  "node","nodejs","express","django","flask","spring","kotlin","swift","flutter","dart",
  "javascript","typescript","python","java","golang","go","ruby","php",
  "aws","azure","gcp","postgres","mysql","mongodb","redis","graphql","rest",
  "docker","kubernetes","terraform","cicd","ci","cd",
]);

const TOKEN_FIXES: Record<string, string> = {
  // Explicit typos
  anotator: "Annotator",
  anatator: "Annotator",
  annotator: "Annotator",
  sofware: "Software",
  softyare: "Software",
  softare: "Software",
  devops: "DevOps",
  // Tech proper case
  react: "React",
  reactjs: "React",
  "react-native": "React Native",
  nextjs: "Next.js",
  nodejs: "Node.js",
  node: "Node",
  javascript: "JavaScript",
  typescript: "TypeScript",
  // Proper case for languages
  yoruba: "Yoruba",
  igbo: "Igbo",
  hausa: "Hausa",
  swahili: "Swahili",
  pidgin: "Pidgin",
  english: "English",
  french: "French",
  arabic: "Arabic",
};

const ACRONYMS = new Set(["AI", "ML", "NLP", "NLU", "ASR", "NMT", "QA", "SRE", "PM"]);

function cleanToken(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9\-]/g, "");
}

function nearestCanonical(token: string): string | null {
  const t = cleanToken(token);
  let best: { s: string; d: number } | null = null;
  for (const cand of CANONICAL_TOKENS) {
    const d = dlDistance(t, cand);
    if (!best || d < best.d) best = { s: cand, d };
  }
  if (!best) return null;
  // Adaptive threshold by length (more forgiving for longer tokens)
  const len = t.length;
  const threshold = len <= 4 ? 1 : len <= 7 ? 2 : len <= 10 ? 3 : 4;
  if (best.d <= threshold) return best.s;
  return null;
}

const LANG_TOKENS = new Set([
  "yoruba","igbo","hausa","swahili","amharic","zulu","xhosa","afrikaans","pidgin","arabic","french","english",
]);

export function suggestNormalizedTitle(input: string) {
  const raw = (input || "").trim();
  if (!raw) return { suggestion: "", changed: false };

  let s = raw;
  // Phrase-level replacements first
  for (const [re, rep] of PHRASE_FIXES) {
    s = s.replace(re, rep);
  }
  // Token-level
  const originalTokens = s.split(/\s+/);
  const parts = originalTokens.map((w) => {
    // Hyphenated tokens
    if (w.includes("-")) {
      const sub = w.split("-").map((t) => {
        const lc = t.toLowerCase();
        const explicit = TOKEN_FIXES[lc];
        if (explicit) return explicit;
        if (ACRONYMS.has(t.toUpperCase())) return t.toUpperCase();
        const near = nearestCanonical(t);
        if (near) return TOKEN_FIXES[near] || titleCaseToken(near);
        return titleCaseToken(t);
      });
      return sub.join("-");
    }
    const lc = w.toLowerCase();
    const explicit = TOKEN_FIXES[lc];
    if (explicit) return explicit;
    if (ACRONYMS.has(w.toUpperCase())) return w.toUpperCase();
    const near = nearestCanonical(w);
    if (near) return TOKEN_FIXES[near] || titleCaseToken(near);
    return titleCaseToken(w);
  });

  // Additional phrase heuristic: Language + (noisy annotator) -> Annotator
  // Handles inputs like "Hausa Anantpar" -> "Hausa Annotator"
  for (let i = 0; i < originalTokens.length - 1; i++) {
    const prevLc = originalTokens[i].toLowerCase();
    const nextOrig = originalTokens[i + 1];
    const nextLc = nextOrig.toLowerCase();
    if (!LANG_TOKENS.has(prevLc)) continue;
    // Already mapped to something meaningful? If it's not canonical, try to coerce to Annotator
    const nextClean = cleanToken(nextLc);
    const nearAnn = dlDistance(nextClean, "annotator");
    const looksLikeAnn = /an.*t.*r/.test(nextClean);
    if (nearAnn <= 4 || looksLikeAnn) {
      parts[i + 1] = "Annotator";
    }
  }

  const suggestion = parts.join(" ").replace(/\s+/g, " ").trim();
  return { suggestion, changed: suggestion !== raw };
}
