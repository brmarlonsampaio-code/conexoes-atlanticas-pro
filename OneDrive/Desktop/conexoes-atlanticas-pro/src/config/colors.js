/**
 * Sistema de cores centralizado
 * Inclui cores por tipo de documento acadêmico
 */

// ─── TIPOS DE DOCUMENTO ─────────────────────────────────────────────
export const DOC_TYPES = {
  DISSERTACAO_TESE: 'dissertacao_tese',
  LIVRO: 'livro',
  CAPITULO_LIVRO: 'capitulo_livro',
  ARTIGO_REVISTA: 'artigo_revista',
  REFERENCIA_BIBLIOGRAFICA: 'referencia_bibliografica'
};

// ─── CORES POR TIPO ─────────────────────────────────────────────────
export const DOC_TYPE_COLORS = {
  [DOC_TYPES.DISSERTACAO_TESE]: '#3B82F6',      // 🔵 Azul
  [DOC_TYPES.LIVRO]: '#D97706',                  // 🟡 Dourado
  [DOC_TYPES.CAPITULO_LIVRO]: '#EA580C',         // 🟠 Laranja
  [DOC_TYPES.ARTIGO_REVISTA]: '#16A34A',         // 🟢 Verde
  [DOC_TYPES.REFERENCIA_BIBLIOGRAFICA]: '#9CA3AF' // ⚪ Cinza claro
};

// ─── LABELS HUMANIZADOS ─────────────────────────────────────────────
export const DOC_TYPE_LABELS = {
  [DOC_TYPES.DISSERTACAO_TESE]: 'Dissertação/Tese',
  [DOC_TYPES.LIVRO]: 'Livro',
  [DOC_TYPES.CAPITULO_LIVRO]: 'Capítulo de livro',
  [DOC_TYPES.ARTIGO_REVISTA]: 'Artigo de revista',
  [DOC_TYPES.REFERENCIA_BIBLIOGRAFICA]: 'Referência bibliográfica'
};

// ─── ÍCONES VISUAIS ─────────────────────────────────────────────────
export const DOC_TYPE_ICONS = {
  [DOC_TYPES.DISSERTACAO_TESE]: '🔵',
  [DOC_TYPES.LIVRO]: '🟡',
  [DOC_TYPES.CAPITULO_LIVRO]: '🟠',
  [DOC_TYPES.ARTIGO_REVISTA]: '🟢',
  [DOC_TYPES.REFERENCIA_BIBLIOGRAFICA]: '⚪'
};

// ─── PALETA LEGADA (mantida para compatibilidade) ───────────────────
export const COLORS = {
  node: {
    default: '#4a5a6a',
    highlight: '#aabbcc',
    fade: '#3a4a5a',
    year2020: '#4a7a9a',
    year2021: '#5a8aaa',
    year2022: '#6a9aba',
    year2023: '#7aaaca',
    year2024: '#8abada',
    unknown: '#4a5a6a',
    // Cores por tipo integradas
    ...DOC_TYPE_COLORS
  },
  link: {
    default: '#7a8a9a',
    highlight: '#aabbcc',
    fade: '#3a4a5a'
  },
  text: {
    primary: '#e8ecf2',
    secondary: 'rgba(255, 255, 255, 0.55)',
    muted: 'rgba(255, 255, 255, 0.25)'
  },
  accent: '#d4a853'
};

// ─── FUNÇÕES DE COR ─────────────────────────────────────────────────

/**
 * Retorna a cor do nó baseada no tipo de documento
 * @param {string} docType 
 * @returns {string}
 */
export function getNodeColorByType(docType) {
  return DOC_TYPE_COLORS[docType] || COLORS.node.default;
}

/**
 * Retorna a cor do nó baseada no ano (LEGADO — mantido para compatibilidade)
 * @param {number|null} year 
 * @returns {string}
 */
export function getNodeColor(year) {
  if (year === null || year === undefined) return COLORS.node.unknown;
  if (year >= 2024) return COLORS.node.year2024;
  if (year >= 2023) return COLORS.node.year2023;
  if (year >= 2022) return COLORS.node.year2022;
  if (year >= 2021) return COLORS.node.year2021;
  if (year >= 2020) return COLORS.node.year2020;
  return COLORS.node.default;
}
