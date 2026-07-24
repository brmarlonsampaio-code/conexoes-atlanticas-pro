/**
 * Sistema de cores centralizado
 */

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
    unknown: '#4a5a6a'
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

/**
 * Retorna a cor do nó baseada no ano
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
