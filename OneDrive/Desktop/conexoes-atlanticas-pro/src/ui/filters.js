/**
 * Inicialização dos filtros
 */

import { store } from '../state/store.js';
import { PERIODS } from '../config/constants.js';

const searchInput = document.getElementById('search-input');
const periodFilter = document.getElementById('period-filter');
const tematicaFilter = document.getElementById('tematica-filter');

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
 * Atualiza filtros no estado
 */
function updateFilters() {
  store.setState({
    filters: {
      query: searchInput.value.trim().toLowerCase(),
      period: periodFilter.value,
      tematica: tematicaFilter.value
    }
  });
}

// Event listeners
searchInput.addEventListener('input', debounce(updateFilters, 300));
periodFilter.addEventListener('change', updateFilters);
tematicaFilter.addEventListener('change', updateFilters);

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
  }
});

populatePeriods();
