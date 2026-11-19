/**
 * NEXUS-GRAPHRAG: Animated SVG LangGraph Agentic State Machine Tracer
 * Lead Software Engineer & AI Architect: أ. طارق ابوعشي | Tareq Abuashi
 */

import { AgentNodeId, AgentStepTelemetry } from '../types/rag';

export function createInitialAgentSteps(): AgentStepTelemetry[] {
  return [
    { id: 'planner', label: 'Planner Agent', status: 'idle', latencyMs: 0, tokens: 0, note: 'Intent & Guardrail Check' },
    { id: 'cypher_retriever', label: 'Cypher Graph Retriever', status: 'idle', latencyMs: 0, tokens: 0, note: 'Neo4j 2-Hop + HNSW + BM25' },
    { id: 'vector_critic', label: 'Vector Semantic Critic', status: 'idle', latencyMs: 0, tokens: 0, note: 'Cosine & Trust Audit' },
    { id: 'faithfulness_guard', label: 'Faithfulness Guard', status: 'idle', latencyMs: 0, tokens: 0, note: 'RAGAS NLI Verification' },
    { id: 'synthesizer', label: 'Grounded Synthesizer', status: 'idle', latencyMs: 0, tokens: 0, note: 'Cited Context Assembly' }
  ];
}

interface NodeGeom {
  id: AgentNodeId;
  x: number;
  y: number;
  w: number;
  h: number;
  short: string;
}

const DAG_NODES: NodeGeom[] = [
  { id: 'planner', x: 18, y: 42, w: 126, h: 64, short: '01 • PLANNER' },
  { id: 'cypher_retriever', x: 174, y: 42, w: 136, h: 64, short: '02 • CYPHER + HNSW' },
  { id: 'vector_critic', x: 340, y: 42, w: 134, h: 64, short: '03 • VECTOR CRITIC' },
  { id: 'faithfulness_guard', x: 504, y: 42, w: 134, h: 64, short: '04 • RAGAS GUARD' },
  { id: 'synthesizer', x: 668, y: 42, w: 134, h: 64, short: '05 • SYNTHESIZER' }
];

const STATUS_STYLE: Record<
  AgentStepTelemetry['status'],
  { stroke: string; fill: string; badgeBg: string; badgeText: string; label: string }
> = {
  idle: {
    stroke: 'rgba(148, 163, 184, 0.25)',
    fill: 'rgba(15, 23, 42, 0.72)',
    badgeBg: 'rgba(71, 85, 105, 0.35)',
    badgeText: '#94a3b8',
    label: 'IDLE'
  },
  running: {
    stroke: '#06b6d4',
    fill: 'rgba(8, 47, 73, 0.85)',
    badgeBg: 'rgba(6, 182, 212, 0.25)',
    badgeText: '#22d3ee',
    label: 'RUN'
  },
  passed: {
    stroke: '#10b981',
    fill: 'rgba(6, 78, 59, 0.55)',
    badgeBg: 'rgba(16, 185, 129, 0.25)',
    badgeText: '#34d399',
    label: 'PASS'
  },
  retry: {
    stroke: '#f59e0b',
    fill: 'rgba(69, 26, 3, 0.72)',
    badgeBg: 'rgba(245, 158, 11, 0.25)',
    badgeText: '#fbbf24',
    label: 'RETRY'
  },
  blocked: {
    stroke: '#f43f5e',
    fill: 'rgba(76, 5, 25, 0.82)',
    badgeBg: 'rgba(244, 63, 94, 0.28)',
    badgeText: '#fda4af',
    label: 'BLOCKED'
  }
};

export class LangGraphTracer {
  private container: HTMLElement;
  private steps: AgentStepTelemetry[] = createInitialAgentSteps();
  private selfCorrectionActive = false;
  private attemptCount = 1;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  public update(
    steps: AgentStepTelemetry[],
    selfCorrectionActive: boolean,
    attemptCount: number
  ): void {
    this.steps = steps.map((s) => ({ ...s }));
    this.selfCorrectionActive = selfCorrectionActive;
    this.attemptCount = attemptCount;
    this.render();
  }

  public reset(): void {
    this.steps = createInitialAgentSteps();
    this.selfCorrectionActive = false;
    this.attemptCount = 1;
    this.render();
  }

  private render(): void {
    const stepMap = new Map<AgentNodeId, AgentStepTelemetry>();
    for (const s of this.steps) stepMap.set(s.id, s);

    // Build forward connectors
    const forwardEdgesSvg = DAG_NODES.slice(0, -1)
      .map((node, idx) => {
        const next = DAG_NODES[idx + 1];
        const x1 = node.x + node.w;
        const y1 = node.y + node.h / 2;
        const x2 = next.x;
        const y2 = next.y + next.h / 2;

        const currStep = stepMap.get(node.id);
        const nextStep = stepMap.get(next.id);
        const isActive =
          (currStep?.status === 'passed' && nextStep?.status !== 'idle') ||
          currStep?.status === 'running';
        const isBlocked = currStep?.status === 'blocked' || nextStep?.status === 'blocked';

        const stroke = isBlocked
          ? '#f43f5e'
          : isActive
            ? '#22d3ee'
            : 'rgba(148, 163, 184, 0.28)';

        const animClass = isActive && !isBlocked ? 'dag-edge-flow' : '';
        return `
          <g>
            <line x1="${x1}" y1="${y1}" x2="${x2 - 4}" y2="${y2}"
              stroke="${stroke}" stroke-width="${isActive ? 2.4 : 1.5}"
              class="${animClass}"
              marker-end="${isBlocked ? 'url(#arrow-rose)' : isActive ? 'url(#arrow-cyan)' : 'url(#arrow-muted)'}" />
          </g>
        `;
      })
      .join('');

    // Build Self-Correction Feedback Arc (Vector Semantic Critic -> Planner / Cypher)
    const loopColor = this.selfCorrectionActive ? '#f59e0b' : 'rgba(139, 92, 246, 0.35)';
    const loopStrokeW = this.selfCorrectionActive ? 2.5 : 1.4;
    const loopClass = this.selfCorrectionActive ? 'dag-loop-flow' : '';
    const criticNode = DAG_NODES[2];
    const cypherNode = DAG_NODES[1];
    const startLoopX = criticNode.x + criticNode.w / 2;
    const startLoopY = criticNode.y + criticNode.h;
    const endLoopX = cypherNode.x + cypherNode.w / 2;
    const endLoopY = cypherNode.y + cypherNode.h + 4;

    const feedbackArcSvg = `
      <g>
        <path d="M ${startLoopX} ${startLoopY} C ${startLoopX} 148, ${endLoopX} 148, ${endLoopX} ${endLoopY}"
          fill="none"
          stroke="${loopColor}"
          stroke-width="${loopStrokeW}"
          stroke-dasharray="5 4"
          class="${loopClass}"
          marker-end="${this.selfCorrectionActive ? 'url(#arrow-amber)' : 'url(#arrow-violet)'}" />
        <rect x="${(startLoopX + endLoopX) / 2 - 92}" y="128" width="184" height="20" rx="10"
          fill="${this.selfCorrectionActive ? 'rgba(69, 26, 3, 0.94)' : 'rgba(15, 23, 42, 0.88)'}"
          stroke="${this.selfCorrectionActive ? '#f59e0b' : 'rgba(139, 92, 246, 0.35)'}" stroke-width="1" />
        <text x="${(startLoopX + endLoopX) / 2}" y="141"
          text-anchor="middle"
          font-family="'Fira Code', monospace"
          font-size="9.5"
          font-weight="600"
          fill="${this.selfCorrectionActive ? '#fbbf24' : '#a78bfa'}">
          ${this.selfCorrectionActive ? 'SELF-CORRECTION RE-QUERY (ATTEMPT ' + this.attemptCount + ')' : 'SELF-CORRECTION LOOP (ON REJECT)'}
        </text>
      </g>
    `;

    // Build SVG Nodes
    const nodesSvg = DAG_NODES.map((geom) => {
      const telemetry = stepMap.get(geom.id)!;
      const st = STATUS_STYLE[telemetry.status];
      const glowFilter =
        telemetry.status === 'running'
          ? 'filter="url(#glow-cyan)"'
          : telemetry.status === 'retry'
            ? 'filter="url(#glow-amber)"'
            : telemetry.status === 'blocked'
              ? 'filter="url(#glow-rose)"'
              : '';

      return `
        <g ${glowFilter}>
          <rect x="${geom.x}" y="${geom.y}" width="${geom.w}" height="${geom.h}" rx="10"
            fill="${st.fill}" stroke="${st.stroke}" stroke-width="${telemetry.status === 'idle' ? 1.2 : 2}" />
          <text x="${geom.x + 10}" y="${geom.y + 17}"
            font-family="'Fira Code', monospace" font-size="8.5" font-weight="600" fill="#94a3b8">
            ${geom.short}
          </text>
          <rect x="${geom.x + geom.w - 48}" y="${geom.y + 7}" width="40" height="14" rx="4" fill="${st.badgeBg}" />
          <text x="${geom.x + geom.w - 28}" y="${geom.y + 17}"
            text-anchor="middle" font-family="'Fira Code', monospace" font-size="8" font-weight="700" fill="${st.badgeText}">
            ${st.label}
          </text>
          <text x="${geom.x + 10}" y="${geom.y + 36}"
            font-family="'Outfit', sans-serif" font-size="11.5" font-weight="700" fill="#f8fafc">
            ${telemetry.label.length > 18 ? telemetry.label.slice(0, 17) + '…' : telemetry.label}
          </text>
          <text x="${geom.x + 10}" y="${geom.y + 53}"
            font-family="'Fira Code', monospace" font-size="9" fill="#67e8f9">
            ${telemetry.latencyMs > 0 ? telemetry.latencyMs.toFixed(1) + 'ms' : '-- ms'} • ${telemetry.tokens} tok
          </text>
        </g>
      `;
    }).join('');

    this.container.innerHTML = `
      <svg viewBox="0 0 820 158" class="langgraph-svg" role="img" aria-label="LangGraph Agentic State Machine DAG">
        <defs>
          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#06b6d4" flood-opacity="0.65" />
          </filter>
          <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#f59e0b" flood-opacity="0.7" />
          </filter>
          <filter id="glow-rose" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#f43f5e" flood-opacity="0.75" />
          </filter>
          <marker id="arrow-muted" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="rgba(148,163,184,0.45)" />
          </marker>
          <marker id="arrow-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#22d3ee" />
          </marker>
          <marker id="arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
          </marker>
          <marker id="arrow-violet" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#a78bfa" />
          </marker>
          <marker id="arrow-rose" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
          </marker>
        </defs>
        ${forwardEdgesSvg}
        ${feedbackArcSvg}
        ${nodesSvg}
      </svg>
    `;
  }
}
