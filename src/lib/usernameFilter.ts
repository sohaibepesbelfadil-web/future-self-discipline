// Blocked words list (lowercase)
const BLOCKED_WORDS = [
  'admin', 'administrator', 'owner', 'superadmin', 'super_admin', 'moderator',
  'mod', 'staff', 'support', 'system', 'root', 'official', 'lovable',
  'fuck', 'shit', 'ass', 'dick', 'bitch', 'bastard', 'damn', 'cunt',
  'nigger', 'nigga', 'faggot', 'retard', 'slut', 'whore', 'porn',
  'nazi', 'hitler', 'terrorist', 'isis', 'kkk',
  'kill', 'murder', 'rape', 'suicide',
];

const BLOCKED_EXACT = [
  'admin', 'administrator', 'owner', 'superadmin', 'moderator', 'mod',
  'staff', 'support', 'system', 'root', 'official', 'god', 'bot',
];

export function validateUsername(username: string): { valid: boolean; error?: string } {
  const trimmed = username.trim();

  if (!trimmed) return { valid: false, error: 'Username is required' };
  if (trimmed.length < 3) return { valid: false, error: 'Username must be at least 3 characters' };
  if (trimmed.length > 30) return { valid: false, error: 'Username must be 30 characters or less' };
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) return { valid: false, error: 'Only letters, numbers, and underscores allowed' };
  if (/^[_]|[_]$/.test(trimmed)) return { valid: false, error: 'Cannot start or end with underscore' };

  const lower = trimmed.toLowerCase();

  // Exact match
  if (BLOCKED_EXACT.includes(lower)) {
    return { valid: false, error: 'This username is not allowed' };
  }

  // Contains blocked word
  for (const word of BLOCKED_WORDS) {
    if (lower.includes(word)) {
      return { valid: false, error: 'This username contains inappropriate content' };
    }
  }

  return { valid: true };
}
