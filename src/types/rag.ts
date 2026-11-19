export type NodeCategory = 'service' | 'security' | 'ai' | 'vulnerability' | 'storage' | 'poisoned';

export interface GraphNode {
  id: string;
  label: string;
  category: NodeCategory;
  layer: string;
  description: string;
  trustScore: number; // 0.0 - 1.0
  latencyP99Ms: number;
  vectorNorm: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pinned?: boolean;
  quarantined?: boolean;
  hopLevel?: number; // -1 inactive, 0 anchor, 1 hop-1, 2 hop-2
  highlightPulse?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string; // Neo4j relationship type e.g. DELEGATES_TO, MITIGATES
  weight: number;
  latencyMs: number;
  activePath?: boolean;
  hopIndex?: number;
  quarantined?: boolean;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  serviceId: string;
  relatedNodes: string[];
  chunk: string;
  tags: string[];
  trustScore: number;
  qdrantPointId: string;
  hnswLayer: number;
  embedding: number[]; // Normalized 24-dim semantic vector
  isHallucination?: boolean;
}

export interface VectorHit {
  doc: KnowledgeDocument;
  cosineScore: number;
  vectorRank: number;
}

export interface SparseHit {
  doc: KnowledgeDocument;
  bm25Score: number;
  bm25Rank: number;
  matchedTerms: string[];
}

export interface GraphTraversalResult {
  anchorNodes: string[];
  visitedNodes: string[];
  hopMap: Record<string, number>;
  activeEdgeIds: string[];
  cypherQuery: string;
  paths: string[];
  graphDocScores: Record<string, number>;
  graphRanks: Record<string, number>;
}

export interface RRFResultItem {
  doc: KnowledgeDocument;
  rrfScore: number;
  vectorRank: number | null;
  cosineScore: number;
  bm25Rank: number | null;
  bm25Score: number;
  graphRank: number | null;
  graphBoost: number;
  rrfBreakdown: string;
}

export interface RagasMetrics {
  faithfulness: number;    // 0 - 100%
  contextRecall: number;   // 0 - 100%
  answerRelevance: number; // 0 - 100%
  hallucinationRisk: 'LOW' | 'MODERATE' | 'CRITICAL' | 'BLOCKED';
}

export interface BenchmarkResult {
  corpusSize: number;
  dimensions: number;
  hnswTimeMs: number;
  bruteForceTimeMs: number;
  speedup: number;
  hnswHops: number;
  efSearch: number;
  recallAtK: number;
}

export type AgentNodeId =
  | 'planner'
  | 'cypher_retriever'
  | 'vector_critic'
  | 'faithfulness_guard'
  | 'synthesizer';

export type AgentNodeStatus = 'idle' | 'running' | 'passed' | 'retry' | 'blocked';

export interface AgentStepTelemetry {
  id: AgentNodeId;
  label: string;
  status: AgentNodeStatus;
  latencyMs: number;
  tokens: number;
  note: string;
}

export type FaultMode = 'none' | 'prompt_injection' | 'hallucination' | 'graph_poisoning';

export interface SearchPipelineResult {
  query: string;
  blockedByFirewall: boolean;
  firewallReason?: string;
  selfCorrected: boolean;
  attempts: number;
  vectorHits: VectorHit[];
  sparseHits: SparseHit[];
  graphTraversal: GraphTraversalResult;
  rrfResults: RRFResultItem[];
  ragas: RagasMetrics;
  answerMarkdown: string;
  citations: string[];
  hnswSearchMs: number;
  totalTokens: number;
}
