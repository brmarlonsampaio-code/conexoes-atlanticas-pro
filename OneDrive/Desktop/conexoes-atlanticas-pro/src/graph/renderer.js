/**
 * Renderer do grafo com D3.js - versão limpa
 */

import { select, zoom, forceSimulation, forceManyBody, forceCenter, forceLink, forceCollide, drag } from 'd3';
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
      .scaleExtent([0.1, 4])
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
    // Inicializar posições aleatórias para evitar empilhamento
    nodes.forEach((d, i) => {
      if (d.x == null || d.y == null) {
        const angle = (i / nodes.length) * Math.PI * 2;
        const radius = 100 + Math.random() * 200;
        d.x = this.width / 2 + Math.cos(angle) * radius;
        d.y = this.height / 2 + Math.sin(angle) * radius;
      }
    });

    this.nodes = nodes;
    this.edges = edges;

    this.g.selectAll('*').remove();

    // Links
    this.linkElements = this.g.append('g')
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('stroke', 'rgba(148,163,184,0.12)')
      .attr('stroke-width', d => Math.max(0.3, d.weight));

    // Nós
    this.nodeElements = this.g.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => d.color)
      .attr('stroke', d => d.color)
      .attr('stroke-width', 1.2)
      .attr('stroke-opacity', 0.5)
      .attr('opacity', 0.85)
      .style('cursor', 'pointer')
      .style('transition', 'r 0.2s, opacity 0.2s')
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
          if (!event.active) this.simulation.alphaTarget(0.3).restart();
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

    // Labels - SÓ para os 12 nós mais conectados
    const topNodes = [...nodes].sort((a, b) => b.connections - a.connections).slice(0, 12);
    const topIds = new Set(topNodes.map(d => d.id));

    this.labelElements = this.g.append('g')
      .selectAll('text')
      .data(nodes.filter(d => topIds.has(d.id)))
      .join('text')
      .text(d => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.radius + 11)
      .style('font-size', '9px')
      .style('font-weight', '500')
      .style('fill', 'rgba(255,255,255,0.5)')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    // Simulação
    this.simulation = forceSimulation(nodes)
      .force('link', forceLink(edges)
        .id(d => d.id)
        .distance(d => 70 + (1 - d.weight) * 50)
        .strength(d => d.weight * 0.3)
      )
      .force('charge', forceManyBody()
        .strength(d => -80 - d.radius * 4)
        .distanceMin(10)
        .distanceMax(300)
      )
      .force('collide', forceCollide()
        .radius(d => d.radius + 5)
        .strength(0.4)
        .iterations(2)
      )
      .force('center', forceCenter(this.width / 2, this.height / 2))
      .alphaDecay(0.03)
      .velocityDecay(0.4)
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

    // Encontrar nós conectados ao target
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
      .transition().duration(150)
      .attr('r', d => {
        if (d.id === selectedId) return d.radius * 1.6;
        if (d.id === highlightedId) return d.radius * 1.3;
        return d.radius;
      })
      .attr('opacity', d => {
        if (!targetId) return 0.85;
        if (connectedIds.has(d.id)) return 1;
        return 0.15;
      })
      .attr('stroke-width', d => {
        if (d.id === selectedId) return 3;
        if (d.id === highlightedId) return 2;
        return 1.2;
      });

    this.linkElements
      .transition().duration(150)
      .attr('stroke-opacity', d => {
        if (!targetId) return 0.12;
        const s = typeof d.source === 'object' ? d.source.id : d.source;
        const t = typeof d.target === 'object' ? d.target.id : d.target;
        if (s === targetId || t === targetId) return 0.5;
        return 0.03;
      });

    // Mostrar label do nó em destaque
    this.labelElements
      .style('opacity', d => {
        if (!targetId) return 0;
        if (d.id === targetId || connectedIds.has(d.id)) return 1;
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
          this.simulation.alpha(0.3).restart();
        }
      }
    });
    ro.observe(this.container);
  }
}
