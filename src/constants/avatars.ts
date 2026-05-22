// DiceBear avatar pools — adventurer style for male, lorelei for female, bottts-neutral for other
// Each seed deterministically generates a unique avatar via the DiceBear API

export type AvatarStyle = 'adventurer' | 'lorelei' | 'bottts-neutral';

export const MALE_SEEDS = [
  'Blaze', 'Riot', 'Flex', 'Drift', 'Vibe', 'Hype', 'Slick', 'Drip',
  'Zest', 'Neon', 'Volt', 'Flux', 'Raze', 'Grind', 'Peak', 'Rush',
  'Snap', 'Zap', 'Edge', 'Boost',
];

export const FEMALE_SEEDS = [
  'Nova', 'Luna', 'Aura', 'Vibe', 'Glam', 'Sage', 'Lyra', 'Muse',
  'Faye', 'Aria', 'Opal', 'Dawn', 'Zara', 'Iris', 'Skye', 'Jade',
  'Vera', 'Cleo', 'Suki', 'Remi',
];

export const OTHER_SEEDS = [
  'Pixel', 'Echo', 'Cosmo', 'Nebula', 'Cipher', 'Glitch', 'Prism',
  'Quasar', 'Spark', 'Jinx', 'Rune', 'Byte', 'Flux', 'Storm', 'Zen',
  'Orbit', 'Surge', 'Phase', 'Warp', 'Nova',
];

export function getStyleForGender(gender?: string | null): AvatarStyle {
  if (gender === 'female') return 'lorelei';
  if (gender === 'other') return 'bottts-neutral';
  return 'adventurer';
}

export function getSeedsForGender(gender?: string | null): string[] {
  if (gender === 'female') return FEMALE_SEEDS;
  if (gender === 'other') return OTHER_SEEDS;
  return MALE_SEEDS;
}

export function randomSeed(gender?: string | null): string {
  const pool = getSeedsForGender(gender);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function nextRandomSeed(currentSeed: string, gender?: string | null): string {
  const pool = getSeedsForGender(gender);
  const available = pool.filter((s) => s !== currentSeed);
  return available[Math.floor(Math.random() * available.length)];
}

export function avatarUrl(seed: string, gender?: string | null): string {
  const style = getStyleForGender(gender);
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}
