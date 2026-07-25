/**
 * Store centralizado - padrão Observer
 */

class Store {
  constructor() {
    this.state = {
      nodes: [],
      edges: [],
      selectedNodeId: null,
      highlightedNodeId: null,
      filters: {
        query: '',
        period: 'all',
        tematica: 'all',
        tipo: 'all'  // NOVO: filtro por tipo de documento
      },
      ui: {
        sidebarOpen: false,
        loading: false,
        toast: null
      }
    };
    this.listeners = new Set();
  }

  /**
   * Subscreve a mudanças de estado
   * @param {Function} listener 
   * @returns {Function} unsubscribe
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Atualiza estado parcialmente
   * @param {Object} partial 
   */
  setState(partial) {
    const prev = structuredClone(this.state);
    this.state = { ...this.state, ...partial };
    this.listeners.forEach(listener => listener(this.state, prev));
  }

  /**
   * Retorna estado atual
   * @returns {Object}
   */
  getState() {
    return this.state;
  }

  /**
   * Retorna nó selecionado
   * @returns {Object|null}
   */
  getSelectedNode() {
    return this.state.nodes.find(n => n.id === this.state.selectedNodeId) || null;
  }

  /**
   * Retorna nós visíveis baseados nos filtros
   * @returns {Object[]}
   */
  getVisibleNodes() {
    const { nodes, filters } = this.state;
    return nodes.filter(node => this._matchesFilters(node, filters));
  }

  /**
   * Retorna arestas visíveis
   * @returns {Object[]}
   */
  getVisibleEdges() {
    const visibleIds = new Set(this.getVisibleNodes().map(n => n.id));
    return this.state.edges.filter(e => 
      visibleIds.has(e.source.id || e.source) && 
      visibleIds.has(e.target.id || e.target)
    );
  }

  /**
   * Normaliza string para busca: remove acentos e converte para minúsculas
   * @param {string} str
   * @returns {string}
   */
  _normalize(str) {
    if (!str) return '';
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  _matchesFilters(node, filters) {
    const { query, period, tematica, tipo } = filters;

    if (query) {
      const q = this._normalize(query);
      const match = 
        this._normalize(node.fullTitle).includes(q) ||
        this._normalize(node.author).includes(q) ||
        this._normalize(node.advisor).includes(q) ||
        node.keywords?.some(k => this._normalize(k).includes(q));
      if (!match) return false;
    }

    if (period !== 'all') {
      const year = node.year;
      switch (period) {
        case '2020-2021':
          if (year === null || year < 2020 || year > 2021) return false;
          break;
        case '2022-2023':
          if (year === null || year < 2022 || year > 2023) return false;
          break;
        case '2024+':
          if (year === null || year < 2024) return false;
          break;
        case 'sem-info':
          if (year !== null && node.yearDisplay !== 'sem informação' && node.yearDisplay !== 'ABANDONO') return false;
          break;
      }
    }

    if (tematica !== 'all' && node.tematica !== tematica) {
      return false;
    }

    // NOVO: filtro por tipo de documento
    if (tipo !== 'all' && node.docType !== tipo) {
      return false;
    }

    return true;
  }
}

export const store = new Store();
