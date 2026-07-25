/**
 * Ponto de entrada da aplicação
 */

import { articleRepository } from './data/repository.js';
import { GraphRenderer } from './graph/renderer.js';
<<<<<<< HEAD
import { showToast } from './ui/toast.js';
import { closeSidebar, renderSidebar } from './ui/sidebar.js';
import './ui/filters.js';
=======
import { store } from './state/store.js';
import { sidebar } from './ui/sidebar.js';
import { DOC_TYPE_LABELS, DOC_TYPE_COLORS } from './config/colors.js';
import { PERIODS } from './config/constants.js';
>>>>>>> 4a8c95a4c1d50c35c0ad74f453a19da514262beb

// ─── ELEMENTOS DOM ──────────────────────────────────────────────────
const searchInput = document.getElementById('search-input');
const periodFilter = document.getElementById('period-filter');
const tematicaFilter = document.getElementById('tematica-filter');
const tipoFilter = document.getElementById('tipo-filter');
const docLegend = document.getElementById('doc-legend');

// ─── ESTADO LOCAL ───────────────────────────────────────────────────
let allNodes = [];
let allEdges = [];
let filteredNodes = [];
let filteredEdges = [];
let tematicas = new Set();

// ─── INICIALIZAÇÃO ──────────────────────────────────────────────────
async function init() {
  // Carregar dados
  allNodes = await articleRepository.load();
  allEdges = articleRepository.buildEdges(allNodes);

  // Extrair temáticas únicas
  allNodes.forEach(n => {
    if (n.tematica) tematicas.add(n.tematica);
  });

  // Popular filtros
  populatePeriodFilter();
  populateTematicaFilter();

  // Atualizar contadores da legenda
  updateLegendCounts();

  // Inicializar grafo
  const renderer = new GraphRenderer('graph-container');
  renderer.update(allNodes, allEdges);

  // Estado inicial
  store.setState({
    nodes: allNodes,
    edges: allEdges,
    filteredNodes: allNodes,
    filteredEdges: allEdges,
    selectedNodeId: null,
    highlightedNodeId: null,
    searchQuery: '',
    periodFilter: 'all',
    tematicaFilter: 'all',
    tipoFilter: 'all'
  });

  // ─── EVENT LISTENERS ─────────────────────────────────────────────

  // Busca
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    store.setState({ searchQuery: query });
    applyFilters();
  });

  // Filtro de período
  periodFilter.addEventListener('change', (e) => {
    store.setState({ periodFilter: e.target.value });
    applyFilters();
  });

  // Filtro de temática
  tematicaFilter.addEventListener('change', (e) => {
    store.setState({ tematicaFilter: e.target.value });
    applyFilters();
  });

  // 🎨 Filtro por tipo de documento
  tipoFilter.addEventListener('change', (e) => {
    store.setState({ tipoFilter: e.target.value });
    applyFilters();
  });

  // 🎨 Clique na legenda para filtrar
  docLegend.querySelectorAll('.doc-legend-item').forEach(item => {
    item.addEventListener('click', () => {
      const type = item.dataset.type;
      const currentFilter = store.getState().tipoFilter;

      // Toggle: se já está selecionado, volta para "todos"
      if (currentFilter === type) {
        store.setState({ tipoFilter: 'all' });
        tipoFilter.value = 'all';
      } else {
        store.setState({ tipoFilter: type });
        tipoFilter.value = type;
      }

      applyFilters();
      updateLegendActiveState();
    });
  });

  // Subscribe ao store
  store.subscribe((state) => {
    renderer.updateHighlights(state.highlightedNodeId, state.selectedNodeId);

    // Atualizar sidebar
    if (state.selectedNodeId) {
      const node = allNodes.find(n => n.id === state.selectedNodeId);
      sidebar.render(node);
    } else {
      sidebar.clear();
    }
<<<<<<< HEAD
  }

  _subscribeToState() {
    // Highlights
    this.unsubscribers.push(
      store.subscribe((state, prev) => {
        if (state.highlightedNodeId !== prev.highlightedNodeId ||
            state.selectedNodeId !== prev.selectedNodeId) {
          this.renderer.updateHighlights(state.highlightedNodeId, state.selectedNodeId);
        }
      })
    );

    // Sidebar - renderizar nó selecionado
    this.unsubscribers.push(
      store.subscribe((state, prev) => {
        if (state.selectedNodeId !== prev.selectedNodeId) {
          const node = store.getSelectedNode();
          if (node) {
            renderSidebar(node);
          } else {
            closeSidebar();
          }
        }
      })
    );

    // Filtros
    this.unsubscribers.push(
      store.subscribe((state, prev) => {
        if (JSON.stringify(state.filters) !== JSON.stringify(prev.filters)) {
          this._applyFilters();
        }
      })
    );
  }

  _applyFilters() {
    const visibleNodes = store.getVisibleNodes();
    const visibleEdges = store.getVisibleEdges();

    // Atualizar visibilidade dos elementos D3
    if (this.renderer.nodeElements) {
      this.renderer.nodeElements.style('display', d => {
        return visibleNodes.some(n => n.id === d.id) ? null : 'none';
      });
    }

    if (this.renderer.linkElements) {
      this.renderer.linkElements.style('display', d => {
        const src = typeof d.source === 'object' ? d.source.id : d.source;
        const tgt = typeof d.target === 'object' ? d.target.id : d.target;
        const srcVisible = visibleNodes.some(n => n.id === src);
        const tgtVisible = visibleNodes.some(n => n.id === tgt);
        return (srcVisible && tgtVisible) ? null : 'none';
      });
    }

    // Fechar sidebar se nó selecionado ficou invisível
    const state = store.getState();
    if (state.selectedNodeId && !visibleNodes.some(n => n.id === state.selectedNodeId)) {
      closeSidebar();
    }
  }

  destroy() {
    this.unsubscribers.forEach(unsub => unsub());
  }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
=======
  });
>>>>>>> 4a8c95a4c1d50c35c0ad74f453a19da514262beb

  // Tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      store.setState({ selectedNodeId: null });
    }
  });
}

// ─── POPULAR FILTROS ────────────────────────────────────────────────
function populatePeriodFilter() {
  PERIODS.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.value;
    opt.textContent = p.label;
    periodFilter.appendChild(opt);
  });
}

function populateTematicaFilter() {
  const sorted = Array.from(tematicas).sort();
  sorted.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    tematicaFilter.appendChild(opt);
  });
}

// ─── APLICAR FILTROS ──────────────────────────────────────────────
function applyFilters() {
  const state = store.getState();
  const query = state.searchQuery;
  const period = state.periodFilter;
  const tematica = state.tematicaFilter;
  const tipo = state.tipoFilter;

  filteredNodes = allNodes.filter(node => {
    // Busca textual
    if (query) {
      const text = `${node.fullTitle} ${node.author} ${node.advisor} ${node.keywords.join(' ')}`.toLowerCase();
      if (!text.includes(query)) return false;
    }

    // Filtro de período
    if (period !== 'all') {
      if (period === '2020-2021' && (node.year < 2020 || node.year > 2021)) return false;
      if (period === '2022-2023' && (node.year < 2022 || node.year > 2023)) return false;
      if (period === '2024+' && node.year < 2024) return false;
      if (period === 'sem-info' && node.year !== null) return false;
    }

    // Filtro de temática
    if (tematica !== 'all' && node.tematica !== tematica) return false;

    // 🎨 Filtro por tipo de documento
    if (tipo !== 'all' && node.docType !== tipo) return false;

    return true;
  });

  // Filtrar arestas para manter apenas conexões entre nós visíveis
  const visibleIds = new Set(filteredNodes.map(n => n.id));
  filteredEdges = allEdges.filter(e => {
    const src = typeof e.source === 'object' ? e.source.id : e.source;
    const tgt = typeof e.target === 'object' ? e.target.id : e.target;
    return visibleIds.has(src) && visibleIds.has(tgt);
  });

  // Atualizar store e grafo
  store.setState({
    filteredNodes,
    filteredEdges
  });

  // Re-renderizar grafo
  const renderer = new GraphRenderer('graph-container');
  renderer.update(filteredNodes, filteredEdges);

  // Atualizar estado visual da legenda
  updateLegendActiveState();
}

// ─── CONTADORES DA LEGENDA ─────────────────────────────────────────
function updateLegendCounts() {
  const counts = {};
  allNodes.forEach(n => {
    counts[n.docType] = (counts[n.docType] || 0) + 1;
  });

  Object.keys(DOC_TYPE_LABELS).forEach(type => {
    const el = document.getElementById(`count-${type}`);
    if (el) {
      el.textContent = counts[type] || 0;
    }
  });
}

// ─── ESTADO VISUAL DA LEGENDA ──────────────────────────────────────
function updateLegendActiveState() {
  const activeType = store.getState().tipoFilter;
  docLegend.querySelectorAll('.doc-legend-item').forEach(item => {
    const type = item.dataset.type;
    if (activeType === 'all') {
      item.classList.remove('inactive');
    } else if (activeType === type) {
      item.classList.remove('inactive');
    } else {
      item.classList.add('inactive');
    }
  });
}

// ─── INICIAR ──────────────────────────────────────────────────────
init().catch(console.error);
