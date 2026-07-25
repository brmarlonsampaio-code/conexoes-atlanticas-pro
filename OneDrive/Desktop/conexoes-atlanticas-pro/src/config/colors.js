/**
 * Sistema de cores centralizado
 * Cores por tipo de documento + cores por TEMÁTICA (estilo Connected Papers)
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
  [DOC_TYPES.DISSERTACAO_TESE]: '#3B82F6', // 🔵 Azul
  [DOC_TYPES.LIVRO]: '#D97706', // 🟡 Dourado
  [DOC_TYPES.CAPITULO_LIVRO]: '#EA580C', // 🟠 Laranja
  [DOC_TYPES.ARTIGO_REVISTA]: '#16A34A', // 🟢 Verde
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

// ═══════════════════════════════════════════════════════════════════
// NOVO: CORES POR TEMÁTICA (estilo Connected Papers)
// ═══════════════════════════════════════════════════════════════════
export const THEME_COLORS = {
  'Urbanismo': '#3b82f6',
  'Diáspora': '#8b5cf6',
  'Economia': '#10b981',
  'Gênero': '#f59e0b',
  'Política': '#ef4444',
  'Religião': '#ec4899',
  'Cultura': '#06b6d4',
  'Trabalho': '#84cc16',
  'Porto': '#f97316',
  'Guerra': '#6366f1',
  'História Social': '#14b8a6',
  'Educação': '#a855f7',
  'Ensino de História': '#22c55e',
  'Arqueologia': '#eab308',
  'História Política e Administrativa': '#f43f5e',
  'Outros': '#64748b',
  'Literatura e Cultura': '#06b6d4',
  'Urbanismo Colonial': '#3b82f6',
  'Urbanização': '#3b82f6',
  'Morfologia Urbana': '#3b82f6',
  'Teoria Urbana': '#3b82f6',
  'Urbanização e Cultura': '#3b82f6',
  'Teoria do Urbanismo Colonial': '#3b82f6',
  'Urbanismo e Poder': '#3b82f6',
  'Urbanismo e Religião': '#3b82f6',
  'Urbanização Atlântica': '#3b82f6',
  'Cartografia Histórica e Urbanismo': '#3b82f6',
  'Urbanização Regional': '#3b82f6',
  'Historiografia da Urbanização': '#3b82f6',
  'Imaginário Urbano': '#3b82f6',
  'Urbanismo e Simbologia': '#3b82f6',
  'Urbanismo de Origem Portuguesa': '#3b82f6',
  'História Agrária e Geografia Histórica': '#10b981',
  'História Econômica': '#10b981',
  'História Econômica e Regional': '#10b981',
  'Formação Nacional': '#10b981',
  'Ecologia e Meio Ambiente': '#10b981',
  'História Ambiental e Econômica': '#10b981',
  'Pensamento Descolonial e Colonialismo': '#8b5cf6',
  'Teoria da História e Espacialidade': '#14b8a6',
  'Teoria e Metodologia da História Urbana': '#14b8a6',
  'Historiografia e Interpretação do Brasil': '#14b8a6',
  'Patrimônio Histórico': '#eab308',
  'Linguística e Fontes Históricas': '#64748b',
  'História Colonial e Política Indígena': '#f43f5e',
  'Política Indígena': '#f43f5e',
  'Urbanismo e Poder Municipal': '#3b82f6',
  'Urbanismo e Legislação': '#3b82f6',
  'História Regional e Urbanização': '#3b82f6',
  'História Política e Elites': '#f43f5e',
  'História Política e Cultural': '#f43f5e',
  'História Política e Religiosa': '#f43f5e',
  'História Indígena': '#f43f5e',
  'Arquitetura e Urbanismo': '#3b82f6',
  'Arquitetura Colonial': '#3b82f6'
};

/**
 * Retorna a cor do nó baseada na TEMÁTICA (novo padrão Connected Papers)
 * @param {string} theme
 * @returns {string}
 */
export function getNodeColorByTheme(theme) {
  return THEME_COLORS[theme] || '#64748b';
}

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
    ...DOC_TYPE_COLORS
  },
  link: {
    default: 'rgba(148, 163, 184, 0.15)',
    highlight: 'rgba(212, 168, 83, 0.5)',
    fade: 'rgba(148, 163, 184, 0.05)'
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
