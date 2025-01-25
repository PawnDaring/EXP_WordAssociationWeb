export interface WordNode {
  id: string;
  group: number;
  metadata?: string[];  // Array of keywords associated with the node
}

export interface WordLink {
  source: string;
  target: string;
  value: number;
  relationship: string;
  sharedKeywords?: string[];  // Array of shared keywords between nodes
}

export interface GraphData {
  nodes: WordNode[];
  links: WordLink[];
}