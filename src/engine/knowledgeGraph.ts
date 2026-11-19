/**
 * NEXUS-GRAPHRAG: 60fps Canvas 2D Neo4j Knowledge Graph Engine
 * Supports node dragging, hover tooltips, click inspection, 2-hop Cypher light pulses, and poisoning isolation.
 * Lead Software Engineer & AI Architect: أ. طارق ابوعشي | Tareq Abuashi
 */

import { GraphEdge, GraphNode, NodeCategory } from '../types/rag';

const CATEGORY_COLORS: Record<NodeCategory, { fill: string; stroke: string; glow: string }> = {
  service: { fill: '#082f49', stroke: '#06b6d4', glow: 'rgba(6, 182, 212, 0.55)' },
  security: { fill: '#2e1065', stroke: '#a855f7', glow: 'rgba(168, 85, 247, 0.55)' },
  ai: { fill: '#064e3b', stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.6)' },
  vulnerability: { fill: '#451a03', stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.6)' },
  storage: { fill: '#172554', stroke: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)' },
  poisoned: { fill: '#4c0519', stroke: '#f43f5e', glow: 'rgba(244, 63, 94, 0.8)' }
};

export interface GraphCallbacks {
  onSelectNode?: (node: GraphNode | null) => void;
}

export class KnowledgeGraphEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private nodes: GraphNode[] = [];
  private edges: GraphEdge[] = [];
  private callbacks: GraphCallbacks;

  private width = 760;
  private height = 460;
  private dpr = 1;
  private rafId: number | null = null;
  private time = 0;

  private draggedNode: GraphNode | null = null;
  private hoveredNode: GraphNode | null = null;
  private selectedNodeId: string | null = 'RAG-Orchestrator';
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private pointerDownPos = { x: 0, y: 0 };

  private activeEdgeIds = new Set<string>();
  private hopMap: Record<string, number> = {};
  private physicsEnabled = true;

  constructor(
    canvas: HTMLCanvasElement,
    initialNodes: GraphNode[],
    initialEdges: GraphEdge[],
    callbacks: GraphCallbacks = {}
  ) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context unavailable');
    }
    this.ctx = context;
    this.callbacks = callbacks;

    this.setData(initialNodes, initialEdges);
    this.bindEvents();
    this.resize();
    this.start();
  }

  public setData(nodes: GraphNode[], edges: GraphEdge[]): void {
    this.nodes = nodes.map((n) => ({ ...n }));
    this.edges = edges.map((e) => ({ ...e }));
    this.scaleInitialPositions();
  }

  public getNodes(): GraphNode[] {
    return this.nodes;
  }

  public getEdges(): GraphEdge[] {
    return this.edges;
  }

  public getSelectedNode(): GraphNode | null {
    if (!this.selectedNodeId) return null;
    return this.nodes.find((n) => n.id === this.selectedNodeId) ?? null;
  }

  public selectNodeById(nodeId: string | null): void {
    this.selectedNodeId = nodeId;
    this.callbacks.onSelectNode?.(this.getSelectedNode());
  }

  public setTraversalHighlight(hopMap: Record<string, number>, activeEdgeIds: string[]): void {
    this.hopMap = { ...hopMap };
    this.activeEdgeIds = new Set(activeEdgeIds);

    for (const node of this.nodes) {
      node.hopLevel = hopMap[node.id] ?? -1;
      node.highlightPulse = node.hopLevel >= 0 ? 1 : 0;
    }
    for (const edge of this.edges) {
      edge.activePath = this.activeEdgeIds.has(edge.id) && !edge.quarantined;
    }
  }

  public clearHighlights(): void {
    this.hopMap = {};
    this.activeEdgeIds.clear();
    for (const n of this.nodes) {
      n.hopLevel = -1;
      n.highlightPulse = 0;
    }
    for (const e of this.edges) {
      e.activePath = false;
    }
  }

  public injectPoisonedNode(): void {
    // Remove if already present
    this.removePoisonedNode();

    const poisoned: GraphNode = {
      id: 'Shadow-Relay-X',
      label: 'Shadow-Relay-X',
      category: 'poisoned',
      layer: 'QUARANTINED ANOMALY',
      description:
        'Adversarial poisoned entity injected via untrusted webhook claiming forged edge to Vault-KMS & Auth-Gateway. Trust score 0.14 < 0.60 threshold — edges quarantined.',
      trustScore: 0.14,
      latencyP99Ms: 280.0,
      vectorNorm: 0.42,
      x: this.width * 0.46,
      y: this.height * 0.52,
      vx: 0,
      vy: 0,
      radius: 23,
      quarantined: true,
      hopLevel: -1,
      highlightPulse: 1
    };

    const poisonEdges: GraphEdge[] = [
      {
        id: 'e-poison-1',
        source: 'Shadow-Relay-X',
        target: 'Vault-KMS',
        type: 'FORGED_LEASE_READ',
        weight: 0.12,
        latencyMs: 140,
        quarantined: true,
        activePath: false
      },
      {
        id: 'e-poison-2',
        source: 'Shadow-Relay-X',
        target: 'Auth-Gateway',
        type: 'POISONED_ROUTE',
        weight: 0.14,
        latencyMs: 95,
        quarantined: true,
        activePath: false
      }
    ];

    this.nodes.push(poisoned);
    this.edges.push(...poisonEdges);
    this.selectedNodeId = poisoned.id;
    this.callbacks.onSelectNode?.(poisoned);
  }

  public removePoisonedNode(): void {
    this.nodes = this.nodes.filter((n) => n.id !== 'Shadow-Relay-X');
    this.edges = this.edges.filter((e) => !e.id.startsWith('e-poison-'));
    if (this.selectedNodeId === 'Shadow-Relay-X') {
      this.selectedNodeId = 'RAG-Orchestrator';
      this.callbacks.onSelectNode?.(this.getSelectedNode());
    }
  }

  public resetLayout(initialNodes: GraphNode[], initialEdges: GraphEdge[]): void {
    this.setData(initialNodes, initialEdges);
    this.clearHighlights();
    this.selectedNodeId = 'RAG-Orchestrator';
    this.callbacks.onSelectNode?.(this.getSelectedNode());
  }

  private scaleInitialPositions(): void {
    // Normalize base coordinates (designed around 760x480) to actual canvas bounds
    const scaleX = this.width / 760;
    const scaleY = this.height / 480;
    for (const node of this.nodes) {
      if (node.x <= 760 && node.y <= 480) {
        node.x = Math.max(46, Math.min(this.width - 46, node.x * scaleX));
        node.y = Math.max(42, Math.min(this.height - 42, node.y * scaleY));
      }
    }
  }

  public resize(): void {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const nextW = Math.max(320, Math.floor(rect.width));
    const nextH = Math.max(360, Math.floor(rect.height));
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    const prevW = this.width;
    const prevH = this.height;
    this.width = nextW;
    this.height = nextH;

    this.canvas.width = Math.floor(nextW * this.dpr);
    this.canvas.height = Math.floor(nextH * this.dpr);
    this.canvas.style.width = `${nextW}px`;
    this.canvas.style.height = `${nextH}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    if (prevW > 0 && prevH > 0 && (prevW !== nextW || prevH !== nextH)) {
      const rx = nextW / prevW;
      const ry = nextH / prevH;
      for (const n of this.nodes) {
        n.x = Math.max(44, Math.min(nextW - 44, n.x * rx));
        n.y = Math.max(40, Math.min(nextH - 40, n.y * ry));
      }
    }
  }

  private getNodeAt(x: number, y: number): GraphNode | null {
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const n = this.nodes[i];
      const dx = x - n.x;
      const dy = y - n.y;
      if (dx * dx + dy * dy <= (n.radius + 8) * (n.radius + 8)) {
        return n;
      }
    }
    return null;
  }

  private getPointerPos(ev: PointerEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ev.clientX - rect.left,
      y: ev.clientY - rect.top
    };
  }

  private bindEvents(): void {
    window.addEventListener('resize', () => this.resize());

    this.canvas.addEventListener('pointerdown', (ev) => {
      const pos = this.getPointerPos(ev);
      this.pointerDownPos = pos;
      const hit = this.getNodeAt(pos.x, pos.y);
      if (hit) {
        this.draggedNode = hit;
        this.dragOffsetX = hit.x - pos.x;
        this.dragOffsetY = hit.y - pos.y;
        hit.pinned = true;
        this.canvas.setPointerCapture(ev.pointerId);
        this.canvas.style.cursor = 'grabbing';
      }
    });

    this.canvas.addEventListener('pointermove', (ev) => {
      const pos = this.getPointerPos(ev);
      if (this.draggedNode) {
        this.draggedNode.x = Math.max(40, Math.min(this.width - 40, pos.x + this.dragOffsetX));
        this.draggedNode.y = Math.max(36, Math.min(this.height - 36, pos.y + this.dragOffsetY));
        this.draggedNode.vx = 0;
        this.draggedNode.vy = 0;
        return;
      }
      const hover = this.getNodeAt(pos.x, pos.y);
      this.hoveredNode = hover;
      this.canvas.style.cursor = hover ? 'pointer' : 'default';
    });

    this.canvas.addEventListener('pointerup', (ev) => {
      const pos = this.getPointerPos(ev);
      const dist = Math.hypot(pos.x - this.pointerDownPos.x, pos.y - this.pointerDownPos.y);
      if (this.draggedNode) {
        this.draggedNode.pinned = false;
        if (dist < 6) {
          this.selectedNodeId = this.draggedNode.id;
          this.callbacks.onSelectNode?.(this.draggedNode);
        }
        this.draggedNode = null;
        this.canvas.style.cursor = this.hoveredNode ? 'pointer' : 'default';
      } else if (dist < 6) {
        const hit = this.getNodeAt(pos.x, pos.y);
        if (hit) {
          this.selectedNodeId = hit.id;
          this.callbacks.onSelectNode?.(hit);
        }
      }
    });

    this.canvas.addEventListener('pointerleave', () => {
      this.hoveredNode = null;
    });
  }

  private stepPhysics(): void {
    if (!this.physicsEnabled) return;

    const nodeMap = new Map<string, GraphNode>();
    for (const n of this.nodes) nodeMap.set(n.id, n);

    // Gentle node-node repulsion so labels never overlap
    const minSep = 96;
    for (let i = 0; i < this.nodes.length; i++) {
      const a = this.nodes[i];
      for (let j = i + 1; j < this.nodes.length; j++) {
        const b = this.nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.01;
        if (dist < minSep) {
          const force = ((minSep - dist) / minSep) * 0.24;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          if (!a.pinned) {
            a.vx -= fx;
            a.vy -= fy;
          }
          if (!b.pinned) {
            b.vx += fx;
            b.vy += fy;
          }
        }
      }
    }

    // Gentle spring along edges
    const idealLen = Math.min(165, Math.max(110, this.width * 0.19));
    for (const edge of this.edges) {
      const a = nodeMap.get(edge.source);
      const b = nodeMap.get(edge.target);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 0.01;
      const diff = (dist - idealLen) * 0.0025;
      const fx = (dx / dist) * diff;
      const fy = (dy / dist) * diff;
      if (!a.pinned) {
        a.vx += fx;
        a.vy += fy;
      }
      if (!b.pinned) {
        b.vx -= fx;
        b.vy -= fy;
      }
    }

    // Center gravity + damping + bounds
    const cx = this.width / 2;
    const cy = this.height / 2;
    for (const n of this.nodes) {
      if (n.pinned) continue;
      n.vx += (cx - n.x) * 0.00045;
      n.vy += (cy - n.y) * 0.00045;
      n.vx *= 0.84;
      n.vy *= 0.84;
      n.x += n.vx;
      n.y += n.vy;

      const padX = 54;
      const padY = 44;
      if (n.x < padX) { n.x = padX; n.vx *= -0.4; }
      if (n.x > this.width - padX) { n.x = this.width - padX; n.vx *= -0.4; }
      if (n.y < padY) { n.y = padY; n.vy *= -0.4; }
      if (n.y > this.height - padY) { n.y = this.height - padY; n.vy *= -0.4; }
    }
  }

  private drawGrid(): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.045)';
    ctx.lineWidth = 1;
    const step = 34;
    for (let x = 0; x < this.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawEdge(edge: GraphEdge, src: GraphNode, dst: GraphNode): void {
    const ctx = this.ctx;
    const dx = dst.x - src.x;
    const dy = dst.y - src.y;
    const dist = Math.hypot(dx, dy) || 1;
    const ux = dx / dist;
    const uy = dy / dist;

    const startX = src.x + ux * (src.radius + 3);
    const startY = src.y + uy * (src.radius + 3);
    const endX = dst.x - ux * (dst.radius + 6);
    const endY = dst.y - uy * (dst.radius + 6);

    ctx.save();

    if (edge.quarantined) {
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
      ctx.lineWidth = 1.6;
    } else if (edge.activePath) {
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2.4;
      ctx.shadowColor = 'rgba(6, 182, 212, 0.75)';
      ctx.shadowBlur = 10;
    } else {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.lineWidth = 1.15;
    }

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Arrowhead
    const angle = Math.atan2(dy, dx);
    const arrowLen = edge.activePath ? 8 : 6;
    ctx.setLineDash([]);
    ctx.fillStyle = edge.quarantined
      ? '#f43f5e'
      : edge.activePath
        ? '#22d3ee'
        : 'rgba(148, 163, 184, 0.35)';
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowLen * Math.cos(angle - Math.PI / 7),
      endY - arrowLen * Math.sin(angle - Math.PI / 7)
    );
    ctx.lineTo(
      endX - arrowLen * Math.cos(angle + Math.PI / 7),
      endY - arrowLen * Math.sin(angle + Math.PI / 7)
    );
    ctx.closePath();
    ctx.fill();

    // Traveling light pulse along active 2-hop Cypher edges
    if (edge.activePath && !edge.quarantined) {
      const t = (this.time * 0.9 + (edge.latencyMs % 3) * 0.25) % 1;
      const px = startX + (endX - startX) * t;
      const py = startY + (endY - startY) * t;

      const grad = ctx.createRadialGradient(px, py, 0, px, py, 9);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.35, '#22d3ee');
      grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, 9, 0, Math.PI * 2);
      ctx.fill();

      // Edge relation label on active paths
      const mx = (startX + endX) / 2;
      const my = (startY + endY) / 2;
      ctx.font = '500 9px "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(6, 9, 19, 0.85)';
      const txtW = ctx.measureText(edge.type).width + 8;
      ctx.fillRect(mx - txtW / 2, my - 7, txtW, 14);
      ctx.fillStyle = '#67e8f9';
      ctx.fillText(edge.type, mx, my);
    } else if (edge.quarantined) {
      const mx = (startX + endX) / 2;
      const my = (startY + endY) / 2;
      ctx.font = '600 9px "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fda4af';
      ctx.fillText('QUARANTINED', mx, my - 6);
    }

    ctx.restore();
  }

  private drawNode(node: GraphNode): void {
    const ctx = this.ctx;
    const style = CATEGORY_COLORS[node.category];
    const isSelected = node.id === this.selectedNodeId;
    const isHovered = node === this.hoveredNode;
    const isActiveHop = (node.hopLevel ?? -1) >= 0;

    ctx.save();

    // Animated pulse ring for active Cypher hop or quarantined anomaly
    if (isActiveHop || node.quarantined || isSelected) {
      const pulse = 0.5 + 0.5 * Math.sin(this.time * 4.5);
      const ringRadius = node.radius + 5 + pulse * 5;
      ctx.beginPath();
      ctx.arc(node.x, node.y, ringRadius, 0, Math.PI * 2);
      if (node.quarantined) {
        ctx.strokeStyle = `rgba(244, 63, 94, ${0.4 + pulse * 0.45})`;
      } else if (node.hopLevel === 0) {
        ctx.strokeStyle = `rgba(245, 158, 11, ${0.45 + pulse * 0.45})`;
      } else if (isActiveHop) {
        ctx.strokeStyle = `rgba(6, 182, 212, ${0.4 + pulse * 0.4})`;
      } else {
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.55)';
      }
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Core Node Circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fillStyle = style.fill;
    if (isActiveHop || isSelected || isHovered || node.quarantined) {
      ctx.shadowColor = style.glow;
      ctx.shadowBlur = 16;
    }
    ctx.fill();

    ctx.lineWidth = isSelected ? 2.8 : isActiveHop ? 2.4 : 1.6;
    ctx.strokeStyle = isSelected ? '#ffffff' : style.stroke;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner glyph / abbreviation
    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 10px "Fira Code", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const shortCode = node.id
      .split('-')
      .map((s) => s[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();
    ctx.fillText(shortCode, node.x, node.y);

    // Node full label pill below node
    ctx.font = '600 10.5px "Outfit", sans-serif';
    const labelW = ctx.measureText(node.label).width + 12;
    const labelY = node.y + node.radius + 14;
    ctx.fillStyle = node.quarantined
      ? 'rgba(127, 29, 29, 0.88)'
      : isActiveHop
        ? 'rgba(8, 47, 73, 0.92)'
        : 'rgba(6, 9, 19, 0.82)';
    ctx.beginPath();
    ctx.roundRect(node.x - labelW / 2, labelY - 9, labelW, 18, 5);
    ctx.fill();
    ctx.strokeStyle = node.quarantined
      ? 'rgba(244, 63, 94, 0.65)'
      : isActiveHop
        ? 'rgba(34, 211, 238, 0.6)'
        : 'rgba(148, 163, 184, 0.22)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = node.quarantined ? '#fecdd3' : isActiveHop ? '#e0f2fe' : '#cbd5e1';
    ctx.fillText(node.label, node.x, labelY);

    // Hop badge above node when traversed
    if (isActiveHop && !node.quarantined) {
      const hopTxt = node.hopLevel === 0 ? 'ANCHOR' : `HOP ${node.hopLevel}`;
      ctx.font = '700 8.5px "Fira Code", monospace';
      const bw = ctx.measureText(hopTxt).width + 10;
      const by = node.y - node.radius - 11;
      ctx.fillStyle = node.hopLevel === 0 ? '#f59e0b' : node.hopLevel === 1 ? '#06b6d4' : '#8b5cf6';
      ctx.beginPath();
      ctx.roundRect(node.x - bw / 2, by - 7, bw, 14, 4);
      ctx.fill();
      ctx.fillStyle = '#060913';
      ctx.fillText(hopTxt, node.x, by);
    } else if (node.quarantined) {
      const qTxt = 'TRUST 0.14 • BLOCKED';
      ctx.font = '700 8.5px "Fira Code", monospace';
      const bw = ctx.measureText(qTxt).width + 10;
      const by = node.y - node.radius - 11;
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.roundRect(node.x - bw / 2, by - 7, bw, 14, 4);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillText(qTxt, node.x, by);
    }

    ctx.restore();
  }

  private drawHoverTooltip(): void {
    const n = this.hoveredNode;
    if (!n) return;
    const ctx = this.ctx;
    ctx.save();

    const text1 = `${n.id} (${n.layer})`;
    const text2 = `Trust: ${n.trustScore.toFixed(2)} | p99: ${n.latencyP99Ms}ms | Click to inspect`;
    ctx.font = '600 11px "Outfit", sans-serif';
    const w1 = ctx.measureText(text1).width;
    ctx.font = '400 10px "Fira Code", monospace';
    const w2 = ctx.measureText(text2).width;
    const boxW = Math.max(w1, w2) + 20;
    const boxH = 44;

    let bx = n.x + n.radius + 12;
    let by = n.y - boxH / 2;
    if (bx + boxW > this.width - 8) bx = n.x - n.radius - boxW - 12;
    if (by < 8) by = 8;
    if (by + boxH > this.height - 8) by = this.height - boxH - 8;

    ctx.fillStyle = 'rgba(6, 9, 19, 0.94)';
    ctx.strokeStyle = n.quarantined ? '#f43f5e' : '#06b6d4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(bx, by, boxW, boxH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 11px "Outfit", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(text1, bx + 10, by + 8);

    ctx.fillStyle = n.quarantined ? '#fda4af' : '#67e8f9';
    ctx.font = '400 10px "Fira Code", monospace';
    ctx.fillText(text2, bx + 10, by + 24);

    ctx.restore();
  }

  private render = (): void => {
    this.time += 0.016;
    this.stepPhysics();

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    this.drawGrid();

    const nodeMap = new Map<string, GraphNode>();
    for (const n of this.nodes) nodeMap.set(n.id, n);

    // Draw inactive edges first, active edges on top
    for (const e of this.edges) {
      if (e.activePath) continue;
      const src = nodeMap.get(e.source);
      const dst = nodeMap.get(e.target);
      if (src && dst) this.drawEdge(e, src, dst);
    }
    for (const e of this.edges) {
      if (!e.activePath) continue;
      const src = nodeMap.get(e.source);
      const dst = nodeMap.get(e.target);
      if (src && dst) this.drawEdge(e, src, dst);
    }

    for (const n of this.nodes) {
      this.drawNode(n);
    }

    this.drawHoverTooltip();
    this.rafId = requestAnimationFrame(this.render);
  };

  public start(): void {
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(this.render);
    }
  }

  public stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
