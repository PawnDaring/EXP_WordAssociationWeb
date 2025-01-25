export const wordAssociations: Record<string, string[]> = {
  'ocean': ['wave', 'blue', 'deep', 'vast', 'marine'],
  'mountain': ['peak', 'high', 'climb', 'snow', 'rocky'],
  'forest': ['trees', 'green', 'nature', 'wild', 'woods'],
  'sun': ['bright', 'warm', 'yellow', 'light', 'sky'],
  'book': ['read', 'pages', 'story', 'knowledge', 'words'],
};

export const wordRelationships: Record<string, Record<string, string>> = {
  'ocean-mountain': 'natural formations',
  'ocean-forest': 'ecosystems',
  'mountain-forest': 'wilderness',
  'sun-ocean': 'natural elements',
  'sun-mountain': 'outdoor features',
  'book-knowledge': 'learning tools',
};