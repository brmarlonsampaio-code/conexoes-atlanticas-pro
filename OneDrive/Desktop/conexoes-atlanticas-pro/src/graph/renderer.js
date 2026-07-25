/**
 * Renderer do grafo com D3.js
 * Layout estilo Connected Papers com forças mais orgânicas
 */

import * as d3 from 'd3';
import { store } from '../state/store.js';
import { COLORS } from '../config/colors.js';

export class GraphRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) throw new Error(`Container #${containerId} não encontrado`);

    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    this.svg = d3.select(this.container)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', [0, 0, this.width, this.height]);

    // Definições de filtros (glow)
    const defs = this.svg.append('defs');

    // Glow filter para nós
    const filter = defs.append('filter')
      .attr('id', 'node-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    this.g = this.svg.append('g');

    this.zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
      });

    this.svg.call(this.zoom);

    this.simulation = null;
    this.nodeElements = null;
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
      .attr('class', 'links')
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('class', 'link-line')
      .attr('stroke', COLORS.link.default)
      .attr('stroke-width', d => 0.5 + d.weight * 1.5);

    // Nodes (grupos com círculo + glow)
    const nodeGroup = this.g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node-group')
      .style('cursor', 'pointer')
      .call(d3.drag()
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

    // Círculo externo (glow)
    nodeGroup.append('circle')
      .attr('r', d => d.radius + 6)
      .attr('fill', d => d.color)
      .attr('opacity', 0.15)
      .attr('filter', 'url(#node-glow)');

    // Círculo principal
    this.nodeElements = nodeGroup.append('circle')
      .attr('class', 'node-circle')
      .attr('r', d => d.radius)
      .attr('fill', d => d.color)
      .attr('stroke', d => d3.color(d.color).brighter(0.5))
      .attr('stroke-width', 1.5)
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
      });

    // Labels (só para nós grandes ou originais)
    this.labelElements = this.g.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(nodes.filter(d => d.connections >= 3 || d.nodeType === 'original'))
      .join('text')
      .attr('class', 'node-label')
      .attr('dy', d => d.radius + 14)
      .text(d => d.label)
      .style('opacity', 0.7);

    // Simulação de forças (mais orgânica, estilo Connected Papers)
    this.simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges)
        .id(d => d.id)
        .distance(d => 60 + (1 - d.weight) * 80)
        .strength(d => d.weight * 0.5)
      )
      .force('charge', d3.forceManyBody()
        .strength(d => -80 - d.radius * 8)
        .distanceMin(20)
        .distanceMax(400)
      )
      .force('collide', d3.forceCollide()
        .radius(d => d.radius + 8)
        .strength(0.7)
        .iterations(2)
      )
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('x', d3.forceX(this.width / 2).strength(0.03))
      .force('y', d3.forceY(this.height / 2).strength(0.03))
      .alphaDecay(0.02)
      .velocityDecay(0.3)
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

    this.nodeElements.attr('transform', d => `translate(${d.x},${d.y})`);

    // Atualizar também os grupos (glow + círculo)
    this.g.selectAll('.node-group')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    this.labelElements
      .attr('x', d => d.x)
      .attr('y', d => d.y);
  }

  updateHighlights(highlightedId, selectedId) {
    if (!this.nodeElements) return;

    this.nodeElements
      .classed('highlight', d => d.id === highlightedId || d.id === selectedId)
      .classed('fade', d => {
        if (!highlightedId && !selectedId) return false;
        if (d.id === highlightedId || d.id === selectedId) return false;
        // Fade nós não conectados ao selecionado
        if (selectedId) {
          const connected = this.edges.some(e => {
            const s = typeof e.source === 'object' ? e.source.id : e.source;
            const t = typeof e.target === 'object' ? e.target.id : e.target;
            return (s === selectedId && t === d.id) || (t === selectedId && s === d.id);
          });
          return !connected;
        }
        return false;
      });

    this.linkElements
      .classed('highlight', d => {
        const s = typeof d.source === 'object' ? d.source.id : d.source;
        const t = typeof d.target === 'object' ? d.target.id : d.target;
        return (s === highlightedId || t === highlightedId || s === selectedId || t === selectedId);
      })
      .classed('fade', d => {
        if (!highlightedId && !selectedId) return false;
        const s = typeof d.source === 'object' ? d.source.id : d.source;
        const t = typeof d.target === 'object' ? d.target.id : d.target;
        return !((s === highlightedId || t === highlightedId) || (s === selectedId || t === selectedId));
      });

    this.labelElements
      .style('opacity', d => {
        if (!highlightedId && !selectedId) return 0.7;
        if (d.id === highlightedId || d.id === selectedId) return 1;
        const connected = this.edges.some(e => {
          const s = typeof e.source === 'object' ? e.source.id : e.source;
          const t = typeof e.target === 'object' ? e.target.id : e.target;
          return (s === selectedId && t === d.id) || (t === selectedId && s === d.id);
        });
        return connected ? 0.6 : 0.15;
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
          this.simulation.force('center', d3.forceCenter(width / 2, height / 2));
          this.simulation.alpha(0.3).restart();
        }
      }
    });
    ro.observe(this.container);
  }
}
