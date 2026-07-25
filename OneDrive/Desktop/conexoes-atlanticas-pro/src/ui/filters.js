/**
 * Inicialização dos filtros
 */

import { store } from '../state/store.js';
import { PERIODS } from '../config/constants.js';

const searchInput = document.getElementById('search-input');
const periodFilter = document.getElementById('period-filter');
const tematicaFilter = document.getElementById('tematica-filter');
const tipoFilter = document.getElementById('tipo-filter');
const docLegend = document.getElementById('doc-legend');

/**
 * Popula o select de períodos
 */
function populatePeriods() {
  periodFilter.innerHTML = PERIODS.map(p => 
    `<option value="${p.value}">${p.label}</option>`
  ).join('');
}

/**
 * Popula o select de temáticas
 */
function populateTematicas() {
  const state = store.getState();
  const tematicas = new Set(state.nodes.map(n => n.tematica));
  tematicas.add('Outros');

  const sorted = Array.from(tematicas).sort();
  tematicaFilter.innerHTML = '<option value="all">Todas</option>' + 
    sorted.map(t => `<option value="${t}">${t}</option>`).join('');
}

/**
 * Atualiza contadores da legenda
 */
function updateLegendCounts() {
  const state = store.getState();
  const counts = {};
  state.nodes.forEach(n => {
    counts[n.docType] = (counts[n.docType] || 0) + 1;
  });

  const typeMap = {
    'dissertacao_tese': 'count-dissertacao_tese',
    'livro': 'count-livro',
    'capitulo_livro': 'count-capitulo_livro',
    'artigo_revista': 'count-artigo_revista',
    'referencia_bibliografica': 'count-referencia_bibliografica'
  };

  Object.entries(typeMap).forEach(([type, id]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = counts[type] || 0;
  });
}

/**
 * Atualiza estado visual da legenda (ativo/inativo)
 */
function updateLegendActiveState() {
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

/**
 * Atualiza filtros no estado
 */
function updateFilters() {
  store.setState({
    filters: {
      query: searchInput.value.trim().toLowerCase(),
      period: periodFilter.value,
      tematica: tematicaFilter.value,
      tipo: tipoFilter.value
    }
  });
  updateLegendActiveState();
}

// Event listeners
searchInput.addEventListener('input', debounce(updateFilters, 300));
periodFilter.addEventListener('change', updateFilters);
tematicaFilter.addEventListener('change', updateFilters);
tipoFilter.addEventListener('change', updateFilters);

// 🎨 Clique na legenda para filtrar
if (docLegend) {
  docLegend.querySelectorAll('.doc-legend-item').forEach(item => {
    item.addEventListener('click', () => {
      const type = item.dataset.type;
      const currentFilter = store.getState().filters.tipo;

      // Toggle: se já está selecionado, volta para "todos"
      if (currentFilter === type) {
        tipoFilter.value = 'all';
      } else {
        tipoFilter.value = type;
      }

      updateFilters();
    });
  });
}

// Debounce utilitário
function debounce(fn, ms) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
}

// Inicializar quando dados carregarem
store.subscribe((state, prev) => {
  if (state.nodes.length > 0 && prev.nodes.length === 0) {
    populateTematicas();
    updateLegendCounts();
  }
});

populatePeriods();
