/**
 * NEXUS-GRAPHRAG: Semantic Vector Knowledge Base & Neo4j Entity Topology
 * Lead Software Engineer & AI Architect: أ. طارق ابوعشي | Tareq Abuashi
 */

import { GraphEdge, GraphNode, KnowledgeDocument } from '../types/rag';

/**
 * 24-Dimensional Semantic Concept Basis for Deterministic Browser Embeddings
 * Maps domain terminology & sub-concepts into normalized dense vectors.
 */
export const SEMANTIC_AXES: string[][] = [
  ['auth', 'gateway', 'jwt', 'oidc', 'login', 'edge', 'mtls', 'ingress'],
  ['token', 'signer', 'rotate', 'rotation', 'key', 'ecdsa', 'ed25519', 'ttl'],
  ['cve', 'cve-2026-4102', 'vulnerability', 'patch', 'exploit', 'replay', 'mitigate', 'security'],
  ['vault', 'kms', 'secret', 'hsm', 'lease', 'envelope', 'encrypt', 'cipher'],
  ['fastapi', 'router', 'python', 'async', 'uvicorn', 'pydantic', 'http', 'endpoint'],
  ['go', 'inventory', 'grpc', 'protobuf', 'microservice', 'stock', 'concurrency', 'latency'],
  ['order', 'engine', 'checkout', 'saga', 'idempotency', 'transaction', 'payment'],
  ['qdrant', 'vector', 'hnsw', 'cosine', 'embedding', 'shard', 'ann', 'efsearch'],
  ['vector-indexer', 'indexer', 'chunk', 'pipeline', 'ingest', 'cdc', 'sync', 'upsert'],
  ['rag', 'orchestrator', 'langgraph', 'agent', 'critic', 'planner', 'synthesizer', 'llm'],
  ['redis', 'cache', 'evict', 'eviction', 'session', 'ttl', 'invalidation', 'pub/sub'],
  ['user', 'db', 'postgres', 'postgresql', 'schema', 'read-replica', 'acid', 'row'],
  ['cypher', 'neo4j', 'graph', 'hop', 'traversal', 'path', 'relationship', 'edge'],
  ['rrf', 'reciprocal', 'fusion', 'bm25', 'hybrid', 'rank', 'scoring', 'sparse'],
  ['faithfulness', 'ragas', 'recall', 'hallucination', 'grounding', 'guardrail', 'nli', 'verify'],
  ['latency', 'p99', 'p95', 'timeout', 'circuit', 'breaker', 'trace', 'otel'],
  ['failover', 'fallback', 'resilience', 'retry', 'backoff', 'degraded', 'replica'],
  ['audit', 'compliance', 'rbac', 'boundary', 'zero-trust', 'policy', 'isolation'],
  ['jailbreak', 'prompt', 'injection', 'firewall', 'owasp', 'adversarial', 'block'],
  ['poison', 'poisoning', 'tamper', 'rogue', 'quarantine', 'anomaly', 'untrusted'],
  ['memory', 'ram', 'mmap', 'quantization', 'scalar', 'int8', 'benchmark', 'cold'],
  ['stream', 'kafka', 'event', 'webhook', 'delta', 'update', 'batch'],
  ['schema', 'metadata', 'payload', 'filter', 'hybrid-search', 'top-k'],
  ['architecture', 'microservices', 'distributed', 'cluster', 'kubernetes', 'mesh']
];

export function computeSemanticEmbedding(text: string): number[] {
  const lower = text.toLowerCase();
  const tokens = lower.split(/[^a-z0-9\-]+/).filter(Boolean);
  const vec = new Array<number>(SEMANTIC_AXES.length).fill(0.03);

  for (let dim = 0; dim < SEMANTIC_AXES.length; dim++) {
    const keywords = SEMANTIC_AXES[dim];
    let activation = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        activation += kw.includes('-') ? 1.8 : 1.15;
      }
      for (const tok of tokens) {
        if (tok === kw) {
          activation += 0.9;
        } else if (tok.length >= 4 && (kw.startsWith(tok) || tok.startsWith(kw))) {
          activation += 0.35;
        }
      }
    }
    // Slight deterministic hash fold so arbitrary words also leave a subtle signature
    let hashBias = 0;
    for (const tok of tokens) {
      let h = 0;
      for (let i = 0; i < tok.length; i++) {
        h = (h * 31 + tok.charCodeAt(i)) >>> 0;
      }
      if (h % SEMANTIC_AXES.length === dim) {
        hashBias += 0.18;
      }
    }
    vec[dim] += activation + hashBias;
  }

  // L2 Normalize
  let norm = 0;
  for (let i = 0; i < vec.length; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1;
  return vec.map((v) => Number((v / norm).toFixed(5)));
}

export const PRESET_QUERIES: { label: string; query: string }[] = [
  {
    label: 'CVE-2026-4102 Token Rotation',
    query: 'How does Auth-Gateway handle CVE-2026-4102 token rotation?'
  },
  {
    label: 'FastAPI → Go-Inventory Latency',
    query: 'Trace FastAPI to Go-Inventory dependency latency'
  },
  {
    label: 'Vector-Indexer → Qdrant HNSW',
    query: 'How does Vector-Indexer sync embeddings into Qdrant-Cluster?'
  },
  {
    label: 'Redis Eviction & RAG Failover',
    query: 'Explain RAG-Orchestrator failover when Redis-Cache evicts sessions'
  },
  {
    label: 'Vault-KMS Key Lease Audit',
    query: 'Audit Vault-KMS key lease boundaries across Order-Engine and Token-Signer'
  }
];

export function createInitialGraphNodes(): GraphNode[] {
  const specs: Omit<GraphNode, 'vx' | 'vy' | 'radius' | 'hopLevel' | 'highlightPulse'>[] = [
    {
      id: 'Auth-Gateway',
      label: 'Auth-Gateway',
      category: 'service',
      layer: 'Edge Ingress Mesh',
      description: 'Zero-trust Envoy/JWT edge gateway enforcing mTLS, JWKS rotation, and CVE-2026-4102 nonce validation.',
      trustScore: 0.98,
      latencyP99Ms: 6.4,
      vectorNorm: 1.0,
      x: 180,
      y: 120
    },
    {
      id: 'Token-Signer',
      label: 'Token-Signer',
      category: 'security',
      layer: 'Cryptographic Plane',
      description: 'Stateless Ed25519/ECDSA token issuer using 15-minute ephemeral KMS leases and dual-key overlap windows.',
      trustScore: 0.99,
      latencyP99Ms: 4.1,
      vectorNorm: 1.0,
      x: 340,
      y: 80
    },
    {
      id: 'CVE-2026-4102',
      label: 'CVE-2026-4102',
      category: 'vulnerability',
      layer: 'Threat Intelligence',
      description: 'Critical JWT kid-header cache-poisoning & replay advisory patched via strict kid allowlist + 300s key rotation.',
      trustScore: 0.96,
      latencyP99Ms: 0.0,
      vectorNorm: 1.0,
      x: 520,
      y: 75
    },
    {
      id: 'Vault-KMS',
      label: 'Vault-KMS',
      category: 'security',
      layer: 'HSM Secret Custody',
      description: 'HashiCorp Vault + Cloud HSM root key custodian issuing scoped dynamic leases with strict service-account ACLs.',
      trustScore: 0.99,
      latencyP99Ms: 8.2,
      vectorNorm: 1.0,
      x: 420,
      y: 195
    },
    {
      id: 'FastAPI-Router',
      label: 'FastAPI-Router',
      category: 'service',
      layer: 'API Orchestration Tier',
      description: 'Async Python 3.12 ingress router managing Pydantic v2 validation, OpenTelemetry spans, and gRPC channel pooling.',
      trustScore: 0.95,
      latencyP99Ms: 14.8,
      vectorNorm: 1.0,
      x: 150,
      y: 265
    },
    {
      id: 'Order-Engine',
      label: 'Order-Engine',
      category: 'service',
      layer: 'Transactional Core',
      description: 'Distributed saga coordinator guaranteeing idempotent checkout commits and KMS-signed webhook receipts.',
      trustScore: 0.97,
      latencyP99Ms: 22.5,
      vectorNorm: 1.0,
      x: 310,
      y: 300
    },
    {
      id: 'Go-Inventory',
      label: 'Go-Inventory',
      category: 'service',
      layer: 'High-Throughput Core',
      description: 'Low-latency Go 1.23 gRPC microservice handling lock-free SKU reservations and Redis-backed stock counters.',
      trustScore: 0.96,
      latencyP99Ms: 5.9,
      vectorNorm: 1.0,
      x: 175,
      y: 390
    },
    {
      id: 'Redis-Cache',
      label: 'Redis-Cache',
      category: 'storage',
      layer: 'In-Memory State',
      description: 'Clustered Redis 7.4 storing short-lived session digests, JTI revocation bloom filters, and L1 query caches.',
      trustScore: 0.94,
      latencyP99Ms: 1.4,
      vectorNorm: 1.0,
      x: 465,
      y: 320
    },
    {
      id: 'User-DB',
      label: 'User-DB',
      category: 'storage',
      layer: 'Relational Persistence',
      description: 'PostgreSQL 16 primary/replica cluster storing RBAC claims, tenant scopes, and audit ledger tables.',
      trustScore: 0.98,
      latencyP99Ms: 9.3,
      vectorNorm: 1.0,
      x: 340,
      y: 415
    },
    {
      id: 'RAG-Orchestrator',
      label: 'RAG-Orchestrator',
      category: 'ai',
      layer: 'Agentic Control Plane',
      description: 'LangGraph multi-agent state machine coordinating Cypher graph lookup, HNSW vector critic, and RAGAS guardrails.',
      trustScore: 0.98,
      latencyP99Ms: 42.0,
      vectorNorm: 1.0,
      x: 615,
      y: 235
    },
    {
      id: 'Vector-Indexer',
      label: 'Vector-Indexer',
      category: 'ai',
      layer: 'Embedding Pipeline',
      description: 'Streaming CDC ingestion worker chunking schemas/runbooks into 1536-d float16/int8 vectors for Qdrant.',
      trustScore: 0.95,
      latencyP99Ms: 18.7,
      vectorNorm: 1.0,
      x: 635,
      y: 375
    },
    {
      id: 'Qdrant-Cluster',
      label: 'Qdrant-Cluster',
      category: 'ai',
      layer: 'HNSW Vector Store',
      description: '3-node Qdrant HNSW engine (M=32, efConstruct=256, efSearch=128) serving sub-10ms cosine similarity search.',
      trustScore: 0.97,
      latencyP99Ms: 3.8,
      vectorNorm: 1.0,
      x: 505,
      y: 420
    }
  ];

  return specs.map((s) => ({
    ...s,
    vx: 0,
    vy: 0,
    radius: s.category === 'ai' || s.id === 'Auth-Gateway' ? 24 : 21,
    hopLevel: -1,
    highlightPulse: 0
  }));
}

export function createInitialGraphEdges(): GraphEdge[] {
  const edges: Omit<GraphEdge, 'activePath' | 'hopIndex' | 'quarantined'>[] = [
    { id: 'e1', source: 'Auth-Gateway', target: 'Token-Signer', type: 'DELEGATES_SIGNING', weight: 0.96, latencyMs: 2.1 },
    { id: 'e2', source: 'Token-Signer', target: 'Vault-KMS', type: 'LEASES_KEY_FROM', weight: 0.98, latencyMs: 3.4 },
    { id: 'e3', source: 'Auth-Gateway', target: 'CVE-2026-4102', type: 'MITIGATES_ADVISORY', weight: 0.95, latencyMs: 0.5 },
    { id: 'e4', source: 'Token-Signer', target: 'CVE-2026-4102', type: 'ROTATES_AGAINST', weight: 0.97, latencyMs: 0.8 },
    { id: 'e5', source: 'Auth-Gateway', target: 'FastAPI-Router', type: 'FORWARDS_JWT', weight: 0.92, latencyMs: 4.2 },
    { id: 'e6', source: 'Auth-Gateway', target: 'Redis-Cache', type: 'CHECKS_REVOCATION', weight: 0.90, latencyMs: 1.1 },
    { id: 'e7', source: 'FastAPI-Router', target: 'Order-Engine', type: 'DISPATCHES_SAGA', weight: 0.91, latencyMs: 6.5 },
    { id: 'e8', source: 'FastAPI-Router', target: 'Go-Inventory', type: 'GRPC_RESERVES', weight: 0.94, latencyMs: 5.9 },
    { id: 'e9', source: 'Order-Engine', target: 'Go-Inventory', type: 'LOCKS_SKU', weight: 0.89, latencyMs: 4.8 },
    { id: 'e10', source: 'Order-Engine', target: 'Vault-KMS', type: 'SIGNS_WEBHOOK', weight: 0.93, latencyMs: 3.9 },
    { id: 'e11', source: 'Order-Engine', target: 'User-DB', type: 'PERSISTS_LEDGER', weight: 0.92, latencyMs: 5.4 },
    { id: 'e12', source: 'Go-Inventory', target: 'Redis-Cache', type: 'SYNC_STOCK_TTL', weight: 0.87, latencyMs: 1.3 },
    { id: 'e13', source: 'FastAPI-Router', target: 'RAG-Orchestrator', type: 'INVOKES_AGENT', weight: 0.95, latencyMs: 7.2 },
    { id: 'e14', source: 'RAG-Orchestrator', target: 'Qdrant-Cluster', type: 'QUERIES_HNSW', weight: 0.98, latencyMs: 3.8 },
    { id: 'e15', source: 'RAG-Orchestrator', target: 'Redis-Cache', type: 'FALLBACK_SESSION', weight: 0.88, latencyMs: 1.4 },
    { id: 'e16', source: 'Vector-Indexer', target: 'Qdrant-Cluster', type: 'UPSERTS_VECTORS', weight: 0.97, latencyMs: 6.1 },
    { id: 'e17', source: 'Vector-Indexer', target: 'User-DB', type: 'CDC_STREAM_READ', weight: 0.86, latencyMs: 4.7 },
    { id: 'e18', source: 'RAG-Orchestrator', target: 'Vault-KMS', type: 'VERIFY_ATTESTATION', weight: 0.90, latencyMs: 2.9 },
    { id: 'e19', source: 'Token-Signer', target: 'User-DB', type: 'READS_RBAC_CLAIMS', weight: 0.85, latencyMs: 4.3 }
  ];

  return edges.map((e) => ({
    ...e,
    activePath: false,
    hopIndex: -1,
    quarantined: false
  }));
}

const RAW_DOCUMENTS: Omit<KnowledgeDocument, 'embedding'>[] = [
  {
    id: 'doc-01',
    title: 'CVE-2026-4102 Zero-Downtime Token Rotation Protocol',
    serviceId: 'Auth-Gateway',
    relatedNodes: ['Auth-Gateway', 'Token-Signer', 'CVE-2026-4102', 'Vault-KMS'],
    chunk:
      'To mitigate CVE-2026-4102 (JWKS kid-header cache poisoning & replay), Auth-Gateway enforces strict kid allowlist pinning and triggers a 300-second dual-key overlap window with Token-Signer. Ephemeral Ed25519 keys are leased from Vault-KMS via short-lived HSM tokens while Redis-Cache stores JTI revocation bloom filters.',
    tags: ['cve-2026-4102', 'auth-gateway', 'token-signer', 'rotation', 'jwks', 'vault-kms'],
    trustScore: 0.99,
    qdrantPointId: 'qd_pt_9104a',
    hnswLayer: 2
  },
  {
    id: 'doc-02',
    title: 'Token-Signer Ephemeral Key Signing & Replay Guard',
    serviceId: 'Token-Signer',
    relatedNodes: ['Token-Signer', 'CVE-2026-4102', 'Redis-Cache', 'Auth-Gateway'],
    chunk:
      'Token-Signer rotates asymmetric signing keys every 15 minutes under CVE-2026-4102 hardening guidelines. Old public keys remain verifiable for 5 minutes during drain, while any downgraded alg=none or forged kid header is rejected at Auth-Gateway with HTTP 401 and audit telemetry.',
    tags: ['token-signer', 'rotation', 'ed25519', 'cve-2026-4102', 'replay'],
    trustScore: 0.98,
    qdrantPointId: 'qd_pt_9108c',
    hnswLayer: 1
  },
  {
    id: 'doc-03',
    title: 'FastAPI-Router to Go-Inventory gRPC Latency Profile',
    serviceId: 'FastAPI-Router',
    relatedNodes: ['FastAPI-Router', 'Go-Inventory', 'Order-Engine', 'Redis-Cache'],
    chunk:
      'End-to-end dependency trace from FastAPI-Router to Go-Inventory exhibits 5.9ms p99 gRPC latency over HTTP/2 multiplexed pools (14.8ms total API overhead including Pydantic v2 validation). Circuit breakers trip if Go-Inventory tail latency exceeds 35ms, falling back to Redis-Cache stock snapshots.',
    tags: ['fastapi-router', 'go-inventory', 'latency', 'grpc', 'p99', 'trace', 'dependency'],
    trustScore: 0.97,
    qdrantPointId: 'qd_pt_3312f',
    hnswLayer: 2
  },
  {
    id: 'doc-04',
    title: 'Go-Inventory Lock-Free SKU Reservation & Redis Sync',
    serviceId: 'Go-Inventory',
    relatedNodes: ['Go-Inventory', 'Redis-Cache', 'Order-Engine'],
    chunk:
      'Go-Inventory eliminates mutex contention via sharded atomic Lua CAS operations in Redis-Cache (1.3ms hop) paired with asynchronous write-behind reconciliation. When Order-Engine or FastAPI-Router invokes ReserveSKU, p95 stays at 3.2ms and p99 at 5.9ms.',
    tags: ['go-inventory', 'redis-cache', 'latency', 'sku', 'grpc'],
    trustScore: 0.96,
    qdrantPointId: 'qd_pt_3340b',
    hnswLayer: 0
  },
  {
    id: 'doc-05',
    title: 'Vector-Indexer CDC Pipeline & Qdrant HNSW Upsert',
    serviceId: 'Vector-Indexer',
    relatedNodes: ['Vector-Indexer', 'Qdrant-Cluster', 'User-DB'],
    chunk:
      'Vector-Indexer consumes PostgreSQL logical replication CDC streams from User-DB, chunks payloads with 128-token overlap, generates normalized dense vectors plus BM25 sparse weights, and batch-upserts into Qdrant-Cluster HNSW segments (M=32, efConstruct=256, int8 scalar quantization).',
    tags: ['vector-indexer', 'qdrant-cluster', 'hnsw', 'embeddings', 'sync', 'cdc'],
    trustScore: 0.98,
    qdrantPointId: 'qd_pt_7710e',
    hnswLayer: 2
  },
  {
    id: 'doc-06',
    title: 'Qdrant-Cluster HNSW Tuning & Sub-10ms Cosine Recall',
    serviceId: 'Qdrant-Cluster',
    relatedNodes: ['Qdrant-Cluster', 'RAG-Orchestrator', 'Vector-Indexer'],
    chunk:
      'Qdrant-Cluster maintains 3 sharded replicas with memory-mapped HNSW graphs (efSearch=128). This achieves 99.1% recall@10 at 3.8ms p99 query latency—an order-of-magnitude speedup over O(N*d) brute-force flat scans when serving RAG-Orchestrator.',
    tags: ['qdrant-cluster', 'hnsw', 'cosine', 'efsearch', 'recall', 'vector'],
    trustScore: 0.98,
    qdrantPointId: 'qd_pt_7744a',
    hnswLayer: 1
  },
  {
    id: 'doc-07',
    title: 'RAG-Orchestrator Session Failover on Redis Eviction',
    serviceId: 'RAG-Orchestrator',
    relatedNodes: ['RAG-Orchestrator', 'Redis-Cache', 'User-DB', 'Qdrant-Cluster'],
    chunk:
      'When Redis-Cache triggers volatile-lru eviction on conversational memory, RAG-Orchestrator catches the cache miss without dropping the LangGraph state machine: it reconstructs conversation checkpoints from User-DB audit snapshots and re-hydrates top-K context from Qdrant-Cluster within 24ms.',
    tags: ['rag-orchestrator', 'redis-cache', 'failover', 'evict', 'sessions', 'langgraph'],
    trustScore: 0.97,
    qdrantPointId: 'qd_pt_5501d',
    hnswLayer: 2
  },
  {
    id: 'doc-08',
    title: 'Vault-KMS Key Lease Boundaries: Order-Engine vs Token-Signer',
    serviceId: 'Vault-KMS',
    relatedNodes: ['Vault-KMS', 'Order-Engine', 'Token-Signer', 'User-DB'],
    chunk:
      'Vault-KMS isolates cryptographic blast radius using distinct Transit mounts: Token-Signer holds a 15m non-exportable Ed25519 signing lease strictly scoped to jwt-issuer role, whereas Order-Engine holds a separate HMAC-SHA256 webhook-attestation lease unable to mint user auth tokens.',
    tags: ['vault-kms', 'order-engine', 'token-signer', 'lease', 'audit', 'boundary', 'rbac'],
    trustScore: 0.99,
    qdrantPointId: 'qd_pt_8820f',
    hnswLayer: 2
  },
  {
    id: 'doc-09',
    title: 'Order-Engine Distributed Saga & KMS Webhook Attestation',
    serviceId: 'Order-Engine',
    relatedNodes: ['Order-Engine', 'Vault-KMS', 'Go-Inventory', 'User-DB'],
    chunk:
      'Order-Engine enforces transactional idempotency keys persisted in User-DB before locking stock in Go-Inventory. Every outbound settlement event is signed via its isolated Vault-KMS Transit key lease to guarantee non-repudiation without cross-service privilege escalation.',
    tags: ['order-engine', 'vault-kms', 'saga', 'idempotency', 'audit'],
    trustScore: 0.96,
    qdrantPointId: 'qd_pt_4409c',
    hnswLayer: 1
  },
  {
    id: 'doc-10',
    title: 'LangGraph Self-Correction & RAGAS Faithfulness Guardrails',
    serviceId: 'RAG-Orchestrator',
    relatedNodes: ['RAG-Orchestrator', 'Qdrant-Cluster', 'FastAPI-Router'],
    chunk:
      'Inside RAG-Orchestrator, the Vector Semantic Critic evaluates cosine grounding and NLI entailment across retrieved chunks. If RAGAS Faithfulness drops below 82% or contradictory claims emerge, Faithfulness Guard routes execution back to Planner Agent for constrained Cypher + expanded HNSW re-query.',
    tags: ['rag-orchestrator', 'langgraph', 'critic', 'faithfulness', 'ragas', 'self-correction'],
    trustScore: 0.99,
    qdrantPointId: 'qd_pt_5599z',
    hnswLayer: 2
  },
  {
    id: 'doc-11',
    title: 'User-DB RBAC Schema & Audit Ledger Isolation',
    serviceId: 'User-DB',
    relatedNodes: ['User-DB', 'Token-Signer', 'Vector-Indexer', 'Order-Engine'],
    chunk:
      'User-DB stores tenant RBAC claims and immutable security audit logs under PostgreSQL Row-Level Security (RLS). Token-Signer queries read-replicas during login enrichment while Vector-Indexer excludes PII columns prior to embedding.',
    tags: ['user-db', 'rbac', 'postgres', 'audit', 'pii', 'schema'],
    trustScore: 0.97,
    qdrantPointId: 'qd_pt_2205k',
    hnswLayer: 0
  },
  {
    id: 'doc-12',
    title: 'Redis-Cache L1 Digest Eviction & JTI Revocation Policy',
    serviceId: 'Redis-Cache',
    relatedNodes: ['Redis-Cache', 'Auth-Gateway', 'RAG-Orchestrator', 'Go-Inventory'],
    chunk:
      'Redis-Cache separates critical JTI revocation keys (noeviction namespace) from ephemeral RAG session windows (volatile-lru). This ensures CVE-2026-4102 token revocations are never evicted under memory pressure while RAG-Orchestrator safely falls back to User-DB on session cache misses.',
    tags: ['redis-cache', 'eviction', 'jti', 'auth-gateway', 'rag-orchestrator', 'failover'],
    trustScore: 0.96,
    qdrantPointId: 'qd_pt_6618m',
    hnswLayer: 1
  }
];

export const KNOWLEDGE_CORPUS: KnowledgeDocument[] = RAW_DOCUMENTS.map((doc) => ({
  ...doc,
  embedding: computeSemanticEmbedding(`${doc.title} ${doc.serviceId} ${doc.tags.join(' ')} ${doc.chunk}`)
}));

export const HALLUCINATED_DOC: KnowledgeDocument = {
  id: 'doc-hallucinated-99',
  title: 'Unverified Legacy Override Note (Synthetic Hallucination)',
  serviceId: 'Rogue-Cache-Mirror',
  relatedNodes: ['Auth-Gateway', 'Vault-KMS'],
  chunk:
    'CLAIM [UNVERIFIED]: Auth-Gateway disables TLS and caches raw Vault-KMS root private keys inside public client cookies for 90 days to bypass CVE-2026-4102 latency.',
  tags: ['cve-2026-4102', 'auth-gateway', 'vault-kms', 'override', 'bypass'],
  trustScore: 0.19,
  qdrantPointId: 'qd_pt_untrusted_99',
  hnswLayer: 0,
  isHallucination: true,
  embedding: computeSemanticEmbedding('Auth-Gateway CVE-2026-4102 Vault-KMS token rotation bypass legacy')
};
