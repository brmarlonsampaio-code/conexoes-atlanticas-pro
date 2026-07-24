/**
 * Renderizador do grafo D3
 */

import * as d3 from 'd3';
import { COLORS } from '../config/colors.js';
import { CONFIG } from '../config/constants.js';
import { store } from '../state/store.js';
import { showTooltip, hideTooltip, positionTooltip } from '../ui/tooltip.js';

export class GraphRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.svgEl = document.getElementById('graph-svg');
    this.width = 800;
    this.height = 600;
    this.simulation = null;
    this.g = null;
    this.linkElements = null;
    this.nodeElements = null;
    this.zoomBehavior = null;

    this._initSVG();
    this._initSimulation();
    this._bindEvents();
  }

  _initSVG() {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width || 800;
    this.height = rect.height || 600;

    this.svg = d3.select(this.svgEl)
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .style('background', 'transparent');

    this._initDefs();
    this.g = this.svg.append('g');

    this.zoomBehavior = d3.zoom()
      .scaleExtent([CONFIG.GRAPH.ZOOM_MIN, CONFIG.GRAPH.ZOOM_MAX])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
      });

    this.svg.call(this.zoomBehavior);
  }

  _initDefs() {
    const defs = this.svg.append('defs');

    // Glow filter
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');
    const merge = filter.append('feMerge');
    merge.append('feMergeNode').attr('in', 'blur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Highlight glow
    const filterH = defs.append('filter')
      .attr('id', 'glow-highlight')
      .attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%');
    filterH.append('feGaussianBlur').attr('stdDeviation', '7').attr('result', 'blur');
    const mergeH = filterH.append('feMerge');
    mergeH.append('feMergeNode').attr('in', 'blur');
    mergeH.append('feMergeNode').attr('in', 'SourceGraphic');
  }

  _initSimulation() {
    this.simulation = d3.forceSimulation()
      .force('charge', d3.forceManyBody()
        .strength(-550)
        .distanceMin(CONFIG.GRAPH.CHARGE_DISTANCE_MIN)
        .distanceMax(CONFIG.GRAPH.CHARGE_DISTANCE_MAX))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('collision', d3.forceCollide().radius(CONFIG.GRAPH.COLLISION_RADIUS));
  }

  _bindEvents() {
    window.addEventListener('resize', () => this._resize());

    this.svgEl.addEventListener('click', (e) => {
      if (e.target === this.svgEl || e.target.tagName === 'svg') {
        store.setState({ selectedNodeId: null });
      }
    });
  }

  _resize() {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width || 800;
    this.height = rect.height || 600;

    this.svg
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`);

    this.simulation.force('center', d3.forceCenter(this.width / 2, this.height / 2));
    this.simulation.alpha(0.2).restart();
  }

  /**
   * Atualiza o grafo com dados
   * @param {Object[]} nodes 
   * @param {Object[]} edges 
   */
  update(nodes, edges) {
    // Calcular grau
    const degree = {};
    nodes.forEach(n => degree[n.id] = 0);
    edges.forEach(e => {
      const src = typeof e.source === 'object' ? e.source.id : e.source;
      const tgt = typeof e.target === 'object' ? e.target.id : e.target;
      degree[src] = (degree[src] || 0) + 1;
      degree[tgt] = (degree[tgt] || 0) + 1;
    });

    // Configurar simulação
    this.simulation.nodes(nodes);
    this.simulation.force('link', d3.forceLink(edges)
      .id(d => d.id)
      .distance(250)
      .strength(CONFIG.GRAPH.LINK_STRENGTH));

    // Inicializar posições
    nodes.forEach((d) => {
      if (d.x == null && d.y == null) {
        d.x = this.width / 2 + (Math.random() - 0.5) * 300;
        d.y = this.height / 2 + (Math.random() - 0.5) * 300;
      }
    });

    // Renderizar links
    this._renderLinks(edges);
    this._renderNodes(nodes, degree);

    this.simulation.on('tick', () => this._onTick());
    this.simulation.alpha(1).restart();

    // Zoom inicial
    setTimeout(() => {
      const scale = Math.min(this.width / 1600, this.height / 1200, 0.75);
      const tx = (this.width - 1100 * scale) / 2;
      const ty = (this.height - 800 * scale) / 2;
      this.svg.call(this.zoomBehavior.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
    }, 500);
  }

  _renderLinks(edges) {
    this.g.selectAll('.links').remove();
    const linkGroup = this.g.append('g').attr('class', 'links');

    this.linkElements = linkGroup
      .selectAll('path')
      .data(edges)
      .enter()
      .append('path')
      .attr('class', 'link-line')
      .attr('stroke', COLORS.link.default)
      .attr('stroke-width', d => Math.min(2.5, 0.5 + (d.weight || 1) * 0.5));
  }

  _renderNodes(nodes, degree) {
    this.g.selectAll('.nodes').remove();
    const nodeGroup = this.g.append('g').attr('class', 'nodes');

    this.nodeElements = nodeGroup
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .call(d3.drag()
        .on('start', (e, d) => this._dragStarted(e, d))
        .on('drag', (e, d) => this._dragged(e, d))
        .on('end', (e, d) => this._dragEnded(e, d)));

    // Círculos
    this.nodeElements.append('circle')
      .attr('class', 'node-circle')
      .attr('r', d => {
          const baseSize = d.nodeType === 'original' ? 7 : 4.5;
          return baseSize + (degree[d.id] || 0) * 0.8;
        })
      .attr('fill', d => d.color || COLORS.node.default)
      .attr('stroke', d => d.color || COLORS.node.default)
      .attr('stroke-width', 1.5)
      .attr('filter', 'url(#glow)')
      .style('cursor', 'pointer')
      .on('click', (e, d) => {
        e.stopPropagation();
        store.setState({ selectedNodeId: d.id });
      })
      .on('mouseenter', (e, d) => {
        store.setState({ highlightedNodeId: d.id });
        showTooltip(e, d);
      })
      .on('mousemove', (e) => positionTooltip(e))
      .on('mouseleave', () => {
        store.setState({ highlightedNodeId: null });
        hideTooltip();
      });

    // Labels
    this.nodeElements.append('text')
      .attr('class', 'node-label')
      .attr('dy', d => 10 + (degree[d.id] || 0) * 1.2 + 12)
      .text(d => d.label)
      .style('font-size', '9px')
      .style('fill', COLORS.text.primary);
  }

  _onTick() {
    if (this.linkElements) {
      this.linkElements.attr('d', d => {
        if (!d.source || !d.target) return '';
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 0.5 || 1;
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });
    }

    if (this.nodeElements) {
      this.nodeElements.attr('transform', d => `translate(${d.x},${d.y})`);
    }
  }

  _dragStarted(event, d) {
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  _dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  _dragEnded(event, d) {
    if (!event.active) this.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  /**
   * Atualiza highlights visuais
   * @param {string|null} highlightId 
   * @param {string|null} selectedId 
   */
  updateHighlights(highlightId, selectedId) {
    const activeId = highlightId || selectedId;
    if (!activeId || !this.linkElements || !this.nodeElements) {
      this._resetHighlights();
      return;
    }

    const state = store.getState();
    const edges = state.edges;

    // Links
    this.linkElements.each(function(d) {
      const el = d3.select(this);
      const src = typeof d.source === 'object' ? d.source.id : d.source;
      const tgt = typeof d.target === 'object' ? d.target.id : d.target;
      const isConnected = src === activeId || tgt === activeId;

      if (isConnected) {
        el.attr('class', 'link-line highlight').attr('stroke', COLORS.link.highlight);
      } else {
        el.attr('class', 'link-line fade').attr('stroke', COLORS.link.fade);
      }
    });

    // Nodes
    this.nodeElements.selectAll('.node-circle').each(function(d) {
      const el = d3.select(this);
      const isActive = d.id === activeId;
      const isConnected = edges.some(e => {
        const src = typeof e.source === 'object' ? e.source.id : e.source;
        const tgt = typeof e.target === 'object' ? e.target.id : e.target;
        return (src === activeId && tgt === d.id) || (tgt === activeId && src === d.id);
      });

      if (isActive) {
        el.attr('class', 'node-circle highlight').attr('filter', 'url(#glow-highlight)').style('opacity', 1);
      } else if (isConnected) {
        el.attr('class', 'node-circle').style('opacity', 0.9);
      } else {
        el.attr('class', 'node-circle fade').style('opacity', 0.25);
      }
    });

    // Labels
    this.nodeElements.selectAll('.node-label').each(function(d) {
      const el = d3.select(this);
      const isActive = d.id === activeId;
      const isConnected = edges.some(e => {
        const src = typeof e.source === 'object' ? e.source.id : e.source;
        const tgt = typeof e.target === 'object' ? e.target.id : e.target;
        return (src === activeId && tgt === d.id) || (tgt === activeId && src === d.id);
      });

      el.style('opacity', isActive || isConnected ? 1 : 0);
    });
  }

  _resetHighlights() {
    if (!this.linkElements || !this.nodeElements) return;

    this.linkElements
      .attr('class', 'link-line')
      .attr('stroke', COLORS.link.default)
      .style('stroke-opacity', null);

    this.nodeElements.selectAll('.node-circle')
      .attr('class', 'node-circle')
      .attr('filter', 'url(#glow)')
      .style('opacity', 1);

    this.nodeElements.selectAll('.node-label').style('opacity', 1);
  }
}
