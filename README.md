# NEXUS-GRAPHRAG: Agentic GraphRAG, HNSW Vector Search & LLM Context Orchestrator

> **Exclusive Lead Software Engineer & AI Architect:** **أ. طارق ابوعشي | Tareq Abuashi — Lead Software Engineer & AI Architect**  
> **Reference Architecture Project (#94)**

NEXUS-GRAPHRAG is an interactive, real-time in-browser Agentic GraphRAG & Hybrid Vector Retrieval studio. It combines a 60fps Canvas 2D Neo4j Knowledge Graph, a genuine client-side Dense Cosine + Sparse BM25 + 2-Hop Cypher Hybrid Search engine with Reciprocal Rank Fusion (RRF), an animated SVG `LangGraph` agentic state machine with self-correction loops, live RAGAS evaluation telemetry, and a Red-Team Chaos & Fault Injection Lab.

---

## Core Architectural Pillars

### 1. Interactive Neo4j Knowledge Graph (60fps Canvas 2D — `src/engine/knowledgeGraph.ts`)
- **Service & Threat Mesh:** Models 12 interconnected production entities (`Auth-Gateway`, `Token-Signer`, `Order-Engine`, `Vector-Indexer`, `RAG-Orchestrator`, `Vault-KMS`, `CVE-2026-4102`, `FastAPI-Router`, `Go-Inventory`, `Qdrant-Cluster`, `User-DB`, `Redis-Cache`).
- **Interactive Physics & Inspection:** Drag-and-drop force-directed nodes, hover telemetry tooltips, and click-to-inspect Neo4j edge topology, trust scores, and `p99` latencies.
- **Animated 2-Hop Cypher Paths:** Illuminates traversed edges (`ANCHOR` → `HOP 1` → `HOP 2`) with traveling light pulses during live queries.

### 2. In-Browser Hybrid Search Engine (`src/engine/hybridSearch.ts`)
- **Dense Vector Search (Qdrant-style HNSW):** Computes L2-normalized semantic embeddings across a 24-dimensional domain basis and ranks documents by Cosine Similarity:
  $$\cos(\theta) = \frac{\mathbf{q} \cdot \mathbf{d}}{\|\mathbf{q}\| \|\mathbf{d}\|}$$
- **Sparse Lexical Search (BM25):** Full tokenization with IDF weighting and saturation ($k_1 = 1.5, b = 0.75$) to preserve exact CVE IDs and service identifiers.
- **2-Hop Neo4j Graph Traversal:** Identifies anchor entities, executes BFS up to 2 hops across verified edges (`trustScore >= 0.60`), and synthesizes executable Cypher queries.
- **Reciprocal Rank Fusion (RRF):** Merges Dense, Sparse, and Graph rankings without fragile score calibration:
  $$\text{RRF}(d) = \sum_{m \in \{\text{HNSW}, \text{BM25}, \text{Graph}\}} \frac{w_m}{k + r_m(d)}, \quad k = 60$$

### 3. Animated `LangGraph` Agentic State Machine (`src/components/LangGraphTracer.ts`)
- Real-time SVG DAG visualizing the 5-stage orchestration flow:
  `Planner Agent` → `Cypher Graph Retriever` → `Vector Semantic Critic` → `Faithfulness Guard` → `Grounded Synthesizer`
- Tracks per-stage execution latency (`ms`), token usage, and triggers a visual **Self-Correction Loop** back-edge when the `Vector Semantic Critic` rejects ungrounded retrieval.

### 4. Red-Team & Fault Injection Lab
- **Prompt Injection / Jailbreak:** Intercepts OWASP LLM01 override & Vault-KMS exfiltration payloads at the ingress guardrail (`Guardrail Firewall BLOCKED`).
- **Retrieval Hallucination Injection:** Injects synthetic low-trust context (`doc-hallucinated-99`), causing `Vector Semantic Critic` to reject Attempt #1 and trigger automatic `LangGraph` self-correction.
- **Graph Poisoning Node:** Injects `Shadow-Relay-X` (`trustScore: 0.14`) and isolates its forged edges from Cypher traversal.
- **Cold Vector Cache Benchmark:** Runs a live in-browser `Float32Array` benchmark comparing **HNSW Hot $O(\log N)$** against **Brute-Force Cold $O(N \cdot d)$** over 8,192 × 64-dim vectors.

### 5. Web Audio Telemetry & AI Architecture Dossier
- Synthesized Web Audio API chimes for agent transitions, node inspection, self-correction alerts, and security blocks (with header mute toggle).
- Interactive **AI Architecture Dossier Modal** detailing HNSW $O(\log N)$ complexity, Cosine Similarity, RRF fusion, and RAGAS metrics.

---

## Local Development & Build

```bash
npm run dev
npm run build
```

---

**Designed & Engineered by أ. طارق ابوعشي | Tareq Abuashi — Lead Software Engineer & AI Architect**
