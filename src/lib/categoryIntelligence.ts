/**
 * Keyword knowledge used to pick category icons automatically and to suggest the right
 * category while an admin types a product name. Pure functions: safe on client and server.
 *
 * Keyword syntax: a trailing `*` matches any word starting with it ("accessor*" matches
 * "accessories"); otherwise the whole word must match, optionally pluralised.
 */
const GROUPS: { icon: string; keywords: string[] }[] = [
  {
    icon: 'Smartphone',
    keywords: ['phone', 'smartphone', 'iphone', 'galaxy', 'android', 'tecno', 'infinix', 'itel', 'redmi', 'xiaomi', 'pixel', 'oppo', 'vivo', 'mobile', 'cellphone'],
  },
  { icon: 'Tablet', keywords: ['tablet', 'ipad'] },
  { icon: 'Laptop', keywords: ['laptop', 'macbook', 'notebook', 'computer', 'pc', 'desktop', 'chromebook', 'imac'] },
  { icon: 'Watch', keywords: ['watch', 'smartwatch', 'wearable', 'fitness tracker'] },
  {
    icon: 'Headphones',
    keywords: ['audio', 'headphone', 'headset', 'earbud', 'earphone', 'airpod', 'speaker', 'soundbar', 'sound', 'jbl', 'bose', 'marshall', 'beats', 'music'],
  },
  { icon: 'BatteryCharging', keywords: ['power bank', 'powerbank', 'romoss'] },
  {
    icon: 'Plug',
    keywords: ['accessor*', 'charg*', 'cable', 'adapter', 'case', 'cover', 'screen guard', 'screen protector', 'protector', 'usb', 'type-c', 'lightning', 'hub', 'anker', 'oraimo'],
  },
  {
    icon: 'Sun',
    keywords: ['solar', 'inverter', 'panel', 'lithium', 'energy', 'kva', 'mppt', 'charge controller', 'renewable'],
  },
  { icon: 'Tv', keywords: ['tv', 'television', 'electronic*', 'monitor', 'decoder', 'home theatre', 'home theater'] },
  {
    icon: 'Refrigerator',
    keywords: ['appliance', 'fridge', 'refrigerator', 'freezer', 'kitchen', 'blender', 'microwave', 'washing machine', 'air conditioner', 'fan', 'iron', 'cooker', 'kettle', 'home'],
  },
  { icon: 'Printer', keywords: ['office', 'printer', 'scanner', 'photocopier', 'shredder', 'projector', 'stationery'] },
  { icon: 'Gamepad2', keywords: ['game', 'gaming', 'console', 'playstation', 'ps5', 'ps4', 'xbox', 'nintendo', 'controller'] },
  { icon: 'Camera', keywords: ['camera', 'content', 'creator', 'creat*', 'microphone', 'mic', 'ring light', 'tripod', 'gimbal', 'vlog*'] },
  { icon: 'CarFront', keywords: ['car', 'vehicle', 'automobile', 'suv', 'sedan', 'toyota', 'lexus', 'honda', 'benz', 'automotive'] },
  { icon: 'Bike', keywords: ['bike', 'bicycle', 'motorcycle', 'motorbike', 'scooter', 'okada'] },
  { icon: 'Shirt', keywords: ['fashion', 'lifestyle', 'clothing', 'clothes', 'apparel', 'shoe', 'sneaker', 'bag', 'wear'] },
  { icon: 'Dumbbell', keywords: ['gym', 'fitness', 'health', 'workout', 'exercise', 'massager', 'treadmill', 'sport*'] },
  { icon: 'Wrench', keywords: ['tool', 'toolkit', 'drill', 'hardware', 'screwdriver', 'repair kit'] },
  { icon: 'ToyBrick', keywords: ['kid', 'children', 'child', 'baby', 'toy', 'toddler'] },
  { icon: 'Lightbulb', keywords: ['light*', 'lamp', 'bulb', 'illumination', 'lantern', 'torch', 'led'] },
  { icon: 'Gift', keywords: ['gadget', 'gift', 'smart home', 'drone'] },
];

export const DEFAULT_CATEGORY_ICON = 'LayoutGrid';

/** Every icon an admin can pick for a category, in display order. */
export const CATEGORY_ICON_NAMES = [DEFAULT_CATEGORY_ICON, ...GROUPS.map((group) => group.icon), 'Video', 'Sparkles'];

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const MATCHERS = GROUPS.map((group) => ({
  icon: group.icon,
  patterns: group.keywords.map((keyword) =>
    keyword.endsWith('*')
      ? new RegExp(`(^|[^a-z0-9])${escapeRegex(keyword.slice(0, -1))}`, 'i')
      : new RegExp(`(^|[^a-z0-9])${escapeRegex(keyword)}(s|es)?($|[^a-z0-9])`, 'i')
  ),
}));

function groupScores(text: string) {
  const scores = new Map<string, number>();
  if (!text.trim()) return scores;
  for (const matcher of MATCHERS) {
    const hits = matcher.patterns.filter((pattern) => pattern.test(text)).length;
    if (hits > 0) scores.set(matcher.icon, hits);
  }
  return scores;
}

function topGroup(scores: Map<string, number>) {
  let best: string | null = null;
  let bestScore = 0;
  for (const [icon, score] of scores) {
    if (score > bestScore) {
      best = icon;
      bestScore = score;
    }
  }
  return best;
}

/** Picks the most fitting icon for a category from its name and description. */
export function suggestCategoryIcon(name: string, description = '') {
  return topGroup(groupScores(name)) || topGroup(groupScores(description)) || DEFAULT_CATEGORY_ICON;
}

/** Uses the admin's explicit icon, otherwise a smart guess from the category text. */
export function resolveCategoryIcon(iconName: string | null | undefined, name: string, description = '') {
  if (iconName && iconName !== DEFAULT_CATEGORY_ICON) return iconName;
  return suggestCategoryIcon(name, description);
}

export function slugifyCategoryName(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function defaultCategoryDescription(name: string) {
  return `Shop original ${name.trim()} at G Naath, with trusted warranty and fast store dispatch.`;
}

function words(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2)
    .map((word) => word.replace(/(es|s)$/, ''));
}

export interface CategoryLike {
  slug: string;
  name: string;
  description?: string | null;
}

/**
 * Suggests the best existing category for a product. Returns null when nothing fits well
 * enough, so the admin's own choice is never overridden by a weak guess.
 */
export function suggestCategoryForProduct(
  product: { name: string; brand?: string | null; description?: string | null },
  categories: CategoryLike[]
): string | null {
  const nameScores = groupScores(product.name);
  const brandScores = groupScores(product.brand || '');
  const descriptionScores = groupScores((product.description || '').slice(0, 300));
  const productWords = new Set(words(`${product.name} ${product.brand || ''}`));

  let bestSlug: string | null = null;
  let bestScore = 0;

  for (const category of categories) {
    const categoryText = `${category.name} ${category.slug.replace(/-/g, ' ')} ${category.description || ''}`;
    const categoryGroups = groupScores(categoryText);
    let score = 0;
    for (const icon of categoryGroups.keys()) {
      score += (nameScores.get(icon) || 0) * 3 + (brandScores.get(icon) || 0) * 2 + (descriptionScores.get(icon) || 0);
    }
    for (const word of words(category.name)) {
      if (productWords.has(word)) score += 4;
    }
    if (score > bestScore) {
      bestScore = score;
      bestSlug = category.slug;
    }
  }

  return bestScore >= 2 ? bestSlug : null;
}
