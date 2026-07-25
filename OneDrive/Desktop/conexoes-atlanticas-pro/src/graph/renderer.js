/**
 * Renderer do grafo com D3.js
 * Layout estilo Connected Papers - versão corrigida
 */

import { select, zoom, forceSimulation, forceManyBody, forceCenter, forceLink, forceCollide, drag } from 'd3';
import { store } from '../state/store.js';
import { COLORS } from '../config/colors.js';

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

    // Glow filter
    const defs = this.svg.append('defs');
    const filter = defs.append('filter')
      .attr('id', 'node-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    this.g = this.svg.append('g');

    this.zoomBehavior = zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
      });

    this.svg.call(this.zoomBehavior);

    this.simulation = null;
    this.nodeElements = null;
    this.glowElements = null;
    this.linkElements = null;
    this.labelElements = null;

    this._setupResize();
  }

  update(nodes, edges) {
    this.nodes = nodes;
    this.edges = edges;

    this.g.selectAll('*').remove();

    // Links
    this.linkElements = this.g.append('g')
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('stroke', COLORS.link.default)
      .attr('stroke-width', d => Math.max(0.5, d.weight * 1.5))
      .attr('stroke-opacity', 0.25);

    // Glow (círculo maior por trás)
    this.glowElements = this.g.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => d.radius + 4)
      .attr('fill', d => d.color)
      .attr('opacity', 0.15)
      .attr('filter', 'url(#node-glow)')
      .style('pointer-events', 'none');

    // Nós principais
    this.nodeElements = this.g.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => d.color)
      .attr('stroke', d => d.color)
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.6)
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

    // Labels (só para nós com conexões >= 3 ou originais)
    const labeledNodes = nodes.filter(d => d.connections >= 3 || d.nodeType === 'original');
    this.labelElements = this.g.append('g')
      .selectAll('text')
      .data(labeledNodes)
      .join('text')
      .text(d => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.radius + 12)
      .style('font-size', '10px')
      .style('fill', 'rgba(255,255,255,0.6)')
      .style('pointer-events', 'none')
      .style('opacity', 0.7);

    // Simulação de forças
    this.simulation = forceSimulation(nodes)
      .force('link', forceLink(edges)
        .id(d => d.id)
        .distance(d => 80 + (1 - d.weight) * 60)
        .strength(d => d.weight * 0.4)
      )
      .force('charge', forceManyBody()
        .strength(d => -100 - d.radius * 5)
        .distanceMin(15)
        .distanceMax(350)
      )
      .force('collide', forceCollide()
        .radius(d => d.radius + 8)
        .strength(0.5)
        .iterations(2)
      )
      .force('center', forceCenter(this.width / 2, this.height / 2))
      .force('x', forceCenter(this.width / 2, this.height / 2).strength(0.02))
      .force('y', forceCenter(this.height / 2, this.height / 2).strength(0.02))
      .alphaDecay(0.02)
      .velocityDecay(0.35)
      .on('tick', () => this._tick());

    // Click no fundo = desselecionar
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

    this.glowElements
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);

    this.nodeElements
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);

    this.labelElements
      .attr('x', d => d.x)
      .attr('y', d => d.y);
  }

  updateHighlights(highlightedId, selectedId) {
    if (!this.nodeElements) return;

    const isHighlighted = d => d.id === highlightedId || d.id === selectedId;
    const isConnectedTo = (d, targetId) => {
      if (!targetId) return false;
      return this.edges.some(e => {
        const s = typeof e.source === 'object' ? e.source.id : e.source;
        const t = typeof e.target === 'object' ? e.target.id : e.target;
        return (s === targetId && t === d.id) || (t === targetId && s === d.id);
      });
    };

    this.nodeElements
      .attr('stroke-width', d => isHighlighted(d) ? 3 : 1.5)
      .attr('stroke-opacity', d => {
        if (!highlightedId && !selectedId) return 0.6;
        if (isHighlighted(d)) return 1;
        if (selectedId && isConnectedTo(d, selectedId)) return 0.8;
        return 0.2;
      })
      .attr('opacity', d => {
        if (!highlightedId && !selectedId) return 1;
        if (isHighlighted(d)) return 1;
        if (selectedId && isConnectedTo(d, selectedId)) return 1;
        return 0.25;
      });

    this.glowElements
      .attr('opacity', d => {
        if (!highlightedId && !selectedId) return 0.15;
        if (isHighlighted(d)) return 0.4;
        if (selectedId && isConnectedTo(d, selectedId)) return 0.25;
        return 0.05;
      });

    this.linkElements
      .attr('stroke-opacity', d => {
        const s = typeof d.source === 'object' ? d.source.id : d.source;
        const t = typeof d.target === 'object' ? d.target.id : d.target;
        if (!highlightedId && !selectedId) return 0.25;
        if (s === highlightedId || t === highlightedId || s === selectedId || t === selectedId) return 0.6;
        return 0.05;
      });

    this.labelElements
      .style('opacity', d => {
        if (!highlightedId && !selectedId) return 0.7;
        if (isHighlighted(d)) return 1;
        if (selectedId && isConnectedTo(d, selectedId)) return 0.8;
        return 0.15;
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
