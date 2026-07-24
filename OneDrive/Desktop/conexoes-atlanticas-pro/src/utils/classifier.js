/**
 * Classificação de temáticas por keywords
 */

const THEME_MAP = [
  { keywords: ['cacau', 'produção de cacau', 'escoamento do cacau', 'crise do cacau', 'monocultura cacaueira'], theme: 'Cacau' },
  { keywords: ['cinema', 'filme', 'cinematográfica'], theme: 'Cinema' },
  { keywords: ['educação', 'ensino', 'escolar', 'estudantes', 'escola', 'currículo', 'aprendizagem'], theme: 'Educação' },
  { keywords: ['diáspora', 'África', 'africana', 'afro', 'negritude', 'relações raciais'], theme: 'Diáspora' },
  { keywords: ['guerra', 'armas', 'militar', 'batalha', 'conflitos'], theme: 'Guerra' },
  { keywords: ['urbano', 'urbanas', 'cidade', 'territorial', 'ocupação', 'remodelação', 'intervenções'], theme: 'Urbanismo' },
  { keywords: ['religião', 'religiosidades', 'igreja', 'batista', 'litúrgicas', 'festa'], theme: 'Religião' },
  { keywords: ['mulheres', 'feminina', 'gênero', 'sexual', 'libertação'], theme: 'Gênero' },
  { keywords: ['saúde', 'sanitário', 'doenças'], theme: 'Saúde' },
  { keywords: ['trabalho', 'trabalhador', 'assalariado'], theme: 'Trabalho' },
  { keywords: ['memória', 'memórias', 'lembrança'], theme: 'Memória' },
  { keywords: ['cultura', 'cultural', 'pop', 'japonesa', 'brega', 'serestas'], theme: 'Cultura' },
  { keywords: ['porto', 'portuária', 'marítimo'], theme: 'Porto' },
  { keywords: ['arqueologia', 'arqueológico'], theme: 'Arqueologia' },
  { keywords: ['feiras', 'feira'], theme: 'Feiras' },
  { keywords: ['políticas públicas', 'política', 'governo', 'Estado'], theme: 'Política' },
  { keywords: ['imprensa', 'jornal', 'notícias'], theme: 'Imprensa' },
  { keywords: ['reggae', 'rap', 'música', 'produção musical'], theme: 'Música' },
  { keywords: ['história', 'historiografia', 'passado'], theme: 'História' },
  { keywords: ['Atlântico', 'atlânticas'], theme: 'Atlântico' }
];

/**
 * Classifica a temática baseada nas keywords
 * @param {string[]} keywords 
 * @returns {string}
 */
export function classifyTematica(keywords = []) {
  if (!keywords || keywords.length === 0) return 'Outros';

  for (const item of THEME_MAP) {
    for (const kw of keywords) {
      const kwLower = kw.toLowerCase();
      if (item.keywords.some(k => kwLower.includes(k))) {
        return item.theme;
      }
    }
  }
  return 'Outros';
}
