/**
 * NEXUS-GRAPHRAG: AI Architecture & Mathematical Foundations Dossier Modal
 * Lead Software Engineer & AI Architect: أ. طارق ابوعشي | Tareq Abuashi
 */

export function createDossierModal(): { open: () => void; close: () => void } {
  const modal = document.createElement('div');
  modal.id = 'architecture-dossier-modal';
  modal.className = 'modal-backdrop hidden';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'dossier-modal-title');

  modal.innerHTML = `
    <div class="modal-card custom-scroll">
      <div class="modal-header">
        <div>
          <span class="modal-kicker">AI ARCHITECTURE DOSSIER &amp; MATHEMATICAL SPECIFICATION</span>
          <h2 id="dossier-modal-title">NEXUS-GRAPHRAG: Agentic Hybrid Vector &amp; Graph Engine</h2>
          <p class="modal-architect">
            Exclusive Lead Software Engineer &amp; AI Architect:
            <strong>أ. طارق ابوعشي | Tareq Abuashi</strong>
          </p>
        </div>
        <button id="close-dossier-btn" class="btn-icon" aria-label="Close Dossier Modal">
          <span>✕ Close</span>
        </button>
      </div>

      <div class="dossier-grid">
        <section class="dossier-section">
          <div class="dossier-badge cyan">01 • HNSW GRAPH NAVIGATION</div>
          <h3>Hierarchical Navigable Small World — <code>O(log N)</code></h3>
          <p>
            Unlike flat brute-force vector search which scales linearly at <code>O(N &middot; d)</code>,
            Qdrant's <strong>HNSW</strong> organizes dense embeddings into stacked proximity layers.
            Search begins at the sparse top layer (long-range skip links) and descends greedily to Layer 0
            (dense local neighborhood) with beam width <code>efSearch</code>.
          </p>
          <div class="formula-box">
            T_HNSW(N, d) = O(d &middot; M &middot; log(N)) &nbsp;&nbsp;|&nbsp;&nbsp;
            P(level = l) = e^(-l / m_L), &nbsp; m_L = 1 / ln(M)
          </div>
          <p class="meta-note">
            Active Cluster Tuning: <code>M = 32</code>, <code>efConstruct = 256</code>, <code>efSearch = 128</code>, Int8 Scalar Quantization.
          </p>
        </section>

        <section class="dossier-section">
          <div class="dossier-badge violet">02 • DENSE VECTOR SCORING</div>
          <h3>Normalized Cosine Similarity (Qdrant Space)</h3>
          <p>
            Query vectors <code>q</code> and document chunk vectors <code>d_i</code> are L2-normalized
            during ingestion by <code>Vector-Indexer</code>, reducing angular similarity to a fast SIMD dot-product.
          </p>
          <div class="formula-box">
            sim(q, d) = cos(&theta;) = (q &middot; d) / (||q|| &middot; ||d||) = &Sigma; q_k &middot; d_k
          </div>
          <p class="meta-note">
            Paired with sparse lexical <strong>BM25</strong> (k₁ = 1.5, b = 0.75) to preserve exact CVE IDs &amp; service identifiers.
          </p>
        </section>

        <section class="dossier-section">
          <div class="dossier-badge emerald">03 • RECIPROCAL RANK FUSION</div>
          <h3>Hybrid RRF: Dense + BM25 + Neo4j 2-Hop Graph</h3>
          <p>
            RRF merges heterogeneous rankers without fragile score-scale calibration. Each retriever
            (HNSW Cosine, BM25 Sparse, Neo4j 2-Hop Cypher Neighborhood) votes inversely proportional to its rank.
          </p>
          <div class="formula-box">
            RRF(d) = &Sigma;_{m &isin; {HNSW, BM25, Graph}}  w_m / (k + r_m(d)), &nbsp;&nbsp; k = 60
          </div>
          <p class="meta-note">
            Graph structural boost applies <code>w_Graph = 1.15</code> over verified edges with <code>trustScore &ge; 0.60</code>.
          </p>
        </section>

        <section class="dossier-section">
          <div class="dossier-badge gold">04 • RAGAS &amp; LANGGRAPH CRITIC</div>
          <h3>Faithfulness Guardrails &amp; Self-Correction Loop</h3>
          <p>
            Every synthesized claim is audited by <code>Vector Semantic Critic</code> and
            <code>Faithfulness Guard</code> using RAGAS metrics before reaching the user:
          </p>
          <div class="formula-box">
            Faithfulness = |Supported Claims| / |Total Generated Claims| &nbsp;&bull;&nbsp;
            Context Recall = |GT &cap; Retrieved| / |GT|
          </div>
          <p class="meta-note">
            If <code>Faithfulness &lt; 82%</code> or an unverified/hallucinated node is detected, LangGraph routes back to
            <code>Cypher Graph Retriever</code> for constrained self-correction.
          </p>
        </section>
      </div>

      <div class="dossier-footer">
        <span>NEXUS-GRAPHRAG Reference Architecture (#94)</span>
        <span>Designed &amp; Engineered exclusively by <strong>أ. طارق ابوعشي | Tareq Abuashi — Lead Software Engineer &amp; AI Architect</strong></span>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => {
    modal.classList.add('hidden');
  };
  const open = () => {
    modal.classList.remove('hidden');
  };

  modal.querySelector('#close-dossier-btn')?.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) close();
  });

  return { open, close };
}
