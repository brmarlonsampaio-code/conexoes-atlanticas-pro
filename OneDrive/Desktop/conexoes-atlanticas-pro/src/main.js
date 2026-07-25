/**
 * Entry point da aplicação
 */

import { articleRepository } from './data/repository.js';
import { store } from './state/store.js';
import { GraphRenderer } from './graph/renderer.js';
import { showToast } from './ui/toast.js';
import { closeSidebar, renderSidebar } from './ui/sidebar.js';
import { DOC_TYPE_LABELS } from './config/colors.js';
import { PERIODS } from './config/constants.js';
import './ui/filters.js';

// ─── ELEMENTOS DOM ──────────────────────────────────────────────────
const searchInput = document.getElementById('search-input');
const periodFilter = document.getElementById('period-filter');
const tematicaFilter = document.getElementById('tematica-filter');
const tipoFilter = document.getElementById('tipo-filter');
const docLegend = document.getElementById('doc-legend');

// ─── ESTADO LOCAL ───────────────────────────────────────────────────
let allNodes = [];
let allEdges = [];
let tematicas = new Set();

class App {
  constructor() {
    this.renderer = null;
    this.unsubscribers = [];
  }

  async init() {
    try {
      showToast('Carregando constelação...', 'loading', 2000);

      // Carregar dados
      allNodes = await articleRepository.load();
      allEdges = articleRepository.buildEdges(allNodes);

      // Extrair temáticas únicas
      allNodes.forEach(n => {
        if (n.tematica) tematicas.add(n.tematica);
      });

      store.setState({ nodes: allNodes, edges: allEdges });

      // Popular filtros
      this._populatePeriodFilter();
      this._populateTematicaFilter();
      this._updateLegendCounts();

      // Inicializar grafo
      this.renderer = new GraphRenderer('graph-container');
      this.renderer.update(allNodes, allEdges);

      // Subscrever a mudanças
      this._subscribeToState();
      this._bindEvents();

      // Selecionar primeiro nó
      if (allNodes.length > 0) {
        setTimeout(() => {
          store.setState({ selectedNodeId: allNodes[0].id });
        }, 600);
      }

      showToast('Constelação carregada!', 'success', 2000);

    } catch (error) {
      console.error('Erro ao inicializar:', error);
      showToast('Erro ao carregar dados. Recarregue a página.', 'error', 5000);
    }
  }

  _populatePeriodFilter() {
    if (!periodFilter) return;
    periodFilter.innerHTML = PERIODS.map(p =>
      `<option value="${p.value}">${p.label}</option>`
    ).join('');
  }

  _populateTematicaFilter() {
    if (!tematicaFilter) return;
    const sorted = Array.from(tematicas).sort();
    tematicaFilter.innerHTML = '<option value="all">Todas</option>' +
      sorted.map(t => `<option value="${t}">${t}</option>`).join('');
  }

  _updateLegendCounts() {
    const counts = {};
    allNodes.forEach(n => {
      counts[n.docType] = (counts[n.docType] || 0) + 1;
    });

    Object.keys(DOC_TYPE_LABELS).forEach(type => {
      const el = document.getElementById(`count-${type}`);
      if (el) el.textContent = counts[type] || 0;
    });
  }

  _updateLegendActiveState() {
    const activeType = store.getState().filters.tipo;
    if (!docLegend) return;

    docLegend.querySelectorAll('.doc-legend-item').forEach(item => {
      const type = item.dataset.type;
      item.classList.remove('active', 'inactive');

      if (activeType === 'all') {
        // Todos ativos
      } else if (activeType === type) {
        item.classList.add('active');
      } else {
        item.classList.add('inactive');
      }
    });
  }

  _bindEvents() {
    // Busca
    if (searchInput) {
      searchInput.addEventListener('input', debounce(() => {
        store.setState({
          filters: { ...store.getState().filters, query: searchInput.value.trim().toLowerCase() }
        });
      }, 300));
    }

    // Filtro de período
    if (periodFilter) {
      periodFilter.addEventListener('change', () => {
        store.setState({
          filters: { ...store.getState().filters, period: periodFilter.value }
        });
      });
    }

    // Filtro de temática
    if (tematicaFilter) {
      tematicaFilter.addEventListener('change', () => {
        store.setState({
          filters: { ...store.getState().filters, tematica: tematicaFilter.value }
        });
      });
    }

    // 🎨 Filtro por tipo de documento
    if (tipoFilter) {
      tipoFilter.addEventListener('change', () => {
        store.setState({
          filters: { ...store.getState().filters, tipo: tipoFilter.value }
        });
        this._updateLegendActiveState();
      });
    }

    // 🎨 Clique na legenda para filtrar
    if (docLegend) {
      docLegend.querySelectorAll('.doc-legend-item').forEach(item => {
        item.addEventListener('click', () => {
          const type = item.dataset.type;
          const currentFilter = store.getState().filters.tipo;

          if (currentFilter === type) {
            tipoFilter.value = 'all';
            store.setState({
              filters: { ...store.getState().filters, tipo: 'all' }
            });
          } else {
            tipoFilter.value = type;
            store.setState({
              filters: { ...store.getState().filters, tipo: type }
            });
          }

          this._updateLegendActiveState();
        });
      });
    }
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

// Debounce utilitário
function debounce(fn, ms) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();

  // Tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      store.setState({ selectedNodeId: null });
    }
  });
});
