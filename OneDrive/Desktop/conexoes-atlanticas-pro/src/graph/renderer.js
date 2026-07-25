/**
 * Renderer do grafo com D3.js - Layout espalhado estilo Connected Papers
 */

import { select, zoom, forceSimulation, forceManyBody, forceCenter, forceLink, forceCollide, forceX, forceY, drag } from 'd3';
import { store } from '../state/store.js';

export class GraphRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) throw new Error(`Container #${containerId} não encontrado`);

    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    this.svg = select(this.container)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', [0, 0, this.width, this.height]);

    this.g = this.svg.append('g');

    this.zoomBehavior = zoom()
      .scaleExtent([0.05, 5])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
      });

    this.svg.call(this.zoomBehavior);

    this.simulation = null;
    this.nodeElements = null;
    this.linkElements = null;
    this.labelElements = null;

    this._setupResize();
  }

  update(nodes, edges) {
    // Inicializar em posições bem espalhadas (grid + aleatório)
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const spacing = Math.max(this.width, this.height) / cols;
    nodes.forEach((d, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      // Posição base em grid + ruído aleatório grande
      d.x = (col * spacing) + (Math.random() - 0.5) * spacing * 2;
      d.y = (row * spacing) + (Math.random() - 0.5) * spacing * 2;
      d.vx = 0;
      d.vy = 0;
    });

    this.nodes = nodes;
    this.edges = edges;

    this.g.selectAll('*').remove();

    // Links - bem finos e sutis
    this.linkElements = this.g.append('g')
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('stroke', 'rgba(148,163,184,0.08)')
      .attr('stroke-width', d => Math.max(0.2, d.weight * 0.8));

    // Nós
    this.nodeElements = this.g.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => d.color)
      .attr('stroke', d => d.color)
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.4)
      .attr('opacity', 0.8)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        store.setState({ selectedNodeId: d.id });
      })
      .on('mouseover', (event, d) => {
        store.setState({ highlightedNodeId: d.id });
        this._showTooltip(event, d);
      })
      .on('mouseout', () => {
        store.setState({ highlightedNodeId: null });
        this._hideTooltip();
      })
      .call(drag()
        .on('start', (event, d) => {
          if (!event.active) this.simulation.alphaTarget(0.2).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) this.simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    // Labels - SÓ os 8 mais conectados, fonte pequena
    const topNodes = [...nodes].sort((a, b) => b.connections - a.connections).slice(0, 8);
    const topIds = new Set(topNodes.map(d => d.id));

    this.labelElements = this.g.append('g')
      .selectAll('text')
      .data(nodes.filter(d => topIds.has(d.id)))
      .join('text')
      .text(d => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.radius + 10)
      .style('font-size', '8px')
      .style('font-weight', '400')
      .style('fill', 'rgba(255,255,255,0.4)')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    // ═══════════════════════════════════════════════════════════════
    // FORÇAS - Muito mais espalhadas (estilo Connected Papers)
    // ═══════════════════════════════════════════════════════════════
    this.simulation = forceSimulation(nodes)
      // Links: distância GRANDE, força FRACA (não puxa muito)
      .force('link', forceLink(edges)
        .id(d => d.id)
        .distance(d => 120 + (1 - d.weight) * 100)  // 120-220px de distância
        .strength(d => d.weight * 0.15)              // força bem fraca
      )
      // Repulsão FORTE entre TODOS os nós
      .force('charge', forceManyBody()
        .strength(d => -200 - d.radius * 10)          // MUITA repulsão
        .distanceMin(5)
        .distanceMax(600)                              // alcance longo
      )
      // Colisão: empurra nós que se sobrepõem
      .force('collide', forceCollide()
        .radius(d => d.radius + 12)                 // buffer maior
        .strength(0.8)                               // colisão forte
        .iterations(3)
      )
      // Centro: atração MUITO fraca para o centro
      .force('center', forceCenter(this.width / 2, this.height / 2))
      .force('x', forceX(this.width / 2).strength(0.008))
      .force('y', forceY(this.height / 2).strength(0.008))
      .alphaDecay(0.015)      // desaceleração lenta (mais tempo para espalhar)
      .velocityDecay(0.3)     // amortecimento médio
      .alpha(1)               // começa com energia máxima
      .on('tick', () => this._tick());

    this.svg.on('click', () => {
      store.setState({ selectedNodeId: null });
    });
  }

  _tick() {
    this.linkElements
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    this.nodeElements
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);

    this.labelElements
      .attr('x', d => d.x)
      .attr('y', d => d.y);
  }

  updateHighlights(highlightedId, selectedId) {
    if (!this.nodeElements) return;

    const targetId = selectedId || highlightedId;
    const connectedIds = new Set();
    if (targetId) {
      this.edges.forEach(e => {
        const s = typeof e.source === 'object' ? e.source.id : e.source;
        const t = typeof e.target === 'object' ? e.target.id : e.target;
        if (s === targetId) connectedIds.add(t);
        if (t === targetId) connectedIds.add(s);
      });
      connectedIds.add(targetId);
    }

    this.nodeElements
      .transition().duration(200)
      .attr('r', d => {
        if (d.id === selectedId) return d.radius * 1.8;
        if (d.id === highlightedId) return d.radius * 1.4;
        return d.radius;
      })
      .attr('opacity', d => {
        if (!targetId) return 0.8;
        if (connectedIds.has(d.id)) return 1;
        return 0.12;
      })
      .attr('stroke-width', d => {
        if (d.id === selectedId) return 3;
        if (d.id === highlightedId) return 2;
        return 1;
      });

    this.linkElements
      .transition().duration(200)
      .attr('stroke-opacity', d => {
        if (!targetId) return 0.08;
        const s = typeof d.source === 'object' ? d.source.id : d.source;
        const t = typeof d.target === 'object' ? d.target.id : d.target;
        if (s === targetId || t === targetId) return 0.4;
        return 0.02;
      });

    this.labelElements
      .style('opacity', d => {
        if (!targetId) return 0;
        if (d.id === targetId) return 1;
        if (connectedIds.has(d.id)) return 0.7;
        return 0;
      });
  }

  _showTooltip(event, d) {
    const tooltip = document.getElementById('tooltip');
    if (!tooltip) return;
    tooltip.innerHTML = `
      <strong>${d.fullTitle}</strong>
      <span class="tooltip-sub">${d.author}${d.yearDisplay ? ' · ' + d.yearDisplay : ''}</span>
      <span class="tooltip-sub" style="color:${d.color};margin-top:4px;">● ${d.tematica}</span>
    `;
    tooltip.style.display = 'block';
    tooltip.style.left = (event.clientX + 15) + 'px';
    tooltip.style.top = (event.clientY + 15) + 'px';
  }

  _hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    if (tooltip) tooltip.style.display = 'none';
  }

  _setupResize() {
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        this.width = width;
        this.height = height;
        this.svg.attr('width', width).attr('height', height)
          .attr('viewBox', [0, 0, width, height]);
        if (this.simulation) {
          this.simulation.force('center', forceCenter(width / 2, height / 2));
          this.simulation.force('x', forceX(width / 2).strength(0.008));
          this.simulation.force('y', forceY(height / 2).strength(0.008));
          this.simulation.alpha(0.3).restart();
        }
      }
    });
    ro.observe(this.container);
  }
}
