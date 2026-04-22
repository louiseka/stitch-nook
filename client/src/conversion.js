const US_TO_UK = [
  [/\bhdc\b/gi, 'htr'],
  [/\bdtr\b/gi, 'ttr'],
  [/\bdc\b/gi, 'tr'],
  [/\btc\b/gi, 'dtr'],
  [/\btr\b/gi, 'dtr'],
  [/\byo\b/gi, 'yrh'],
  [/\bdouble treble\b/gi, 'triple treble'],
  [/\btreble crochet\b/gi, 'double treble'],
  [/\btriple crochet\b/gi, 'double treble'],
  [/\bdouble crochet\b/gi, 'treble crochet'],
  [/\bhalf double crochet\b/gi, 'half treble crochet'],
  [/\byarn over\b/gi, 'yarn round hook'],
  [/\bgauge\b/gi, 'tension'],
  [/\bbind[ -]off\b/gi, 'cast off'],
];

const UK_TO_US = [
  [/\bhalf treble crochet\b/gi, 'half double crochet'],
  [/\btriple treble\b/gi, 'double treble'],
  [/\bdouble treble\b/gi, 'treble crochet'],
  [/\btreble crochet\b/gi, 'double crochet'],
  [/\byarn round hook\b/gi, 'yarn over'],
  [/\bcast[ -]off\b/gi, 'bind off'],
  [/\bhtr\b/gi, 'hdc'],
  [/\bttr\b/gi, 'dtr'],
  [/\bdtr\b/gi, 'tr'],
  [/\btr\b/gi, 'dc'],
  [/\byrh\b/gi, 'yo'],
  [/\btension\b/gi, 'gauge'],
];

export function convertText(text, mode) {
  if (mode !== 'uk' || !text) return text;
  return US_TO_UK.reduce((s, [pattern, replacement]) => s.replace(pattern, replacement), text);
}

function convertFromUk(text) {
  if (!text) return text;
  return UK_TO_US.reduce((s, [pattern, replacement]) => s.replace(pattern, replacement), text);
}

/** Display instructions with the correct term conversion based on how they were stored vs what the user wants to see. */
export function convertInstructions(text, storedTerms, displayTerms) {
  if (!text) return text;
  const stored = storedTerms || 'us';
  if (stored === displayTerms) return text;
  if (stored === 'us' && displayTerms === 'uk') return convertText(text, 'uk');
  if (stored === 'uk' && displayTerms === 'us') return convertFromUk(text);
  return text;
}
