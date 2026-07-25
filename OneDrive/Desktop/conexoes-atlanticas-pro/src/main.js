/**
 * Entry point da aplicação
 */

import { articleRepository } from './data/repository.js';
import { store } from './state/store.js';
import { GraphRenderer } from './graph/renderer.js';
import { showToast } from './ui/toast.js';
import { closeSidebar, renderSidebar } from './ui/sidebar.js';
import './ui/filters.js';

class App {
  constructor() {
    this.renderer = null;
    this.unsubscribers = [];
  }

  async init() {
    try {
      showToast('Carregando constelação...', 'loading', 2000);

      // Carregar dados
      const nodes = await articleRepository.load();
      const edges = articleRepository.buildEdges(nodes);

      store.setState({ nodes, edges });

      // Inicializar grafo
      this.renderer = new GraphRenderer('graph-container');
      this.renderer.update(nodes, edges);

      // Subscrever a mudanças
      this._subscribeToState();

      // Selecionar primeiro nó
      if (nodes.length > 0) {
        setTimeout(() => {
          store.setState({ selectedNodeId: nodes[0].id });
        }, 600);
      }

      showToast('Constelação carregada!', 'success', 2000);

    } catch (error) {
      console.error('Erro ao inicializar:', error);
      showToast('Erro ao carregar dados. Recarregue a página.', 'error', 5000);
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

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();

  // Tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSidebar();
    }
  });
});
