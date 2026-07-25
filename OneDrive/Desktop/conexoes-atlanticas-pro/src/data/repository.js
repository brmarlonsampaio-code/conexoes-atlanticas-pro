/**
 * Repositório de dados - abstração sobre fontes de dados
 */

import { classifyTematica } from '../utils/classifier.js';
import { getNodeColorByType, DOC_TYPES } from '../config/colors.js';
import { ARTICLES_DATA } from './articles-data.js';

/**
 * Classifica o tipo de documento baseado nos dados
 * @param {Object} d — dados brutos do artigo
 * @returns {string} tipo de documento
 */
function classifyDocType(d) {
  // Se já tem tipo definido no dado
  if (d.tipo) {
    if (d.tipo === 'referencia_bibliografica') return DOC_TYPES.REFERENCIA_BIBLIOGRAFICA;
    if (d.tipo === 'dissertacao') return DOC_TYPES.DISSERTACAO_TESE;
    if (d.tipo === 'tese') return DOC_TYPES.DISSERTACAO_TESE;
    if (d.tipo === 'livro') return DOC_TYPES.LIVRO;
    if (d.tipo === 'capitulo') return DOC_TYPES.CAPITULO_LIVRO;
    if (d.tipo === 'artigo') return DOC_TYPES.ARTIGO_REVISTA;
  }

  // Inferência pelo campo editora_local
  const editora = (d.editora_local || '').toLowerCase();
  const titulo = (d.titulo || '').toLowerCase();

  if (editora.includes('revista') || editora.includes('v.')) {
    return DOC_TYPES.ARTIGO_REVISTA;
  }
  if (editora.includes('capítulo') || titulo.includes('capítulo')) {
    return DOC_TYPES.CAPITULO_LIVRO;
  }
  if (editora.includes('dissertação') || editora.includes('dissertacao') || editora.includes('mestrado') || editora.includes('doutorado')) {
    return DOC_TYPES.DISSERTACAO_TESE;
  }
  if (editora.includes('livro') || (!d.orientador && d.ano && !editora.includes('revista'))) {
    return DOC_TYPES.LIVRO;
  }

  // IDs 1-62 são trabalhos originais (dissertações/teses)
  const numId = parseInt(d.id);
  if (numId >= 1 && numId <= 62) {
    return DOC_TYPES.DISSERTACAO_TESE;
  }

  // IDs 63-104 são referências bibliográficas
  if (numId >= 63 && numId <= 104) {
    if (editora.includes('revista') || editora.includes('v.')) {
      return DOC_TYPES.ARTIGO_REVISTA;
    }
    if (editora.includes('capítulo') || editora.includes('capitulo')) {
      return DOC_TYPES.CAPITULO_LIVRO;
    }
    if (!editora.includes('dissertação') && !editora.includes('dissertacao')) {
      return DOC_TYPES.LIVRO;
    }
    return DOC_TYPES.REFERENCIA_BIBLIOGRAFICA;
  }

  return DOC_TYPES.REFERENCIA_BIBLIOGRAFICA;
}

export class ArticleRepository {
  constructor() {
    this.articles = null;
  }

  /**
   * Carrega artigos dos dados embeddados
   * @returns {Promise<Object[]>}
   */
  async load() {
    if (this.articles) return this.articles;

    this.articles = ARTICLES_DATA.map(d => this._mapToNode(d));
    return this.articles;
  }

  /**
   * Mapeia artigo bruto para nó do grafo
   * @param {Object} d 
   * @returns {Object}
   */
  _mapToNode(d) {
    let yearNum = null;
    let yearDisplay = d.ano;

    if (d.ano !== 'ABANDONO' && d.ano !== 'sem informação') {
      const match = d.ano.match(/(\d{4})/);
      if (match) yearNum = parseInt(match[1], 10);
    }

    const tematica = d.tematica || classifyTematica(d.keywords);
    const id = d.id.toString().startsWith('t') ? d.id : `t${d.id}`;
    const docType = classifyDocType(d);

    return {
      id: id,
      label: d.titulo.length > 40 ? d.titulo.substring(0, 38) + '…' : d.titulo,
      fullTitle: d.titulo,
      author: d.autor,
      year: yearNum,
      yearDisplay: yearDisplay,
      advisor: d.orientador || '—',
      keywords: d.keywords,
      tematica: tematica,
      docType: docType,
      color: getNodeColorByType(docType),
      nodeType: id.startsWith('t') && parseInt(id.slice(1)) <= 62 ? 'original' : 'referencia',
      citations: 0,
      abstract: d.abstract || null,
      venue: d.editora_local || null,
      doi: d.doi || null,
      pdfUrl: d.pdf_url || null,  // 🎓 NOVO: link do PDF
      paperId: id,
      url: d.url || null
    };
  }

  /**
   * Constrói arestas baseadas em similaridade
   * @param {Object[]} nodes 
   * @returns {Object[]}
   */
  buildEdges(nodes) {
    const edges = [];
    const edgeSet = new Set();

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        let weight = 0;

        if (nodes[i].tematica === nodes[j].tematica) {
          weight += 2;
        }

        const kw1 = new Set(nodes[i].keywords.map(k => k.toLowerCase()));
        const kw2 = new Set(nodes[j].keywords.map(k => k.toLowerCase()));
        let intersection = 0;
        for (const k of kw1) {
          if (kw2.has(k)) intersection++;
        }
        weight += intersection * 0.5;

        if (nodes[i].year !== null && nodes[j].year !== null) {
          const diff = Math.abs(nodes[i].year - nodes[j].year);
          if (diff <= 3) weight += 1;
          else if (diff <= 6) weight += 0.5;
        }

        if (weight > 0) {
          const key = [nodes[i].id, nodes[j].id].sort().join('|');
          if (!edgeSet.has(key)) {
            edgeSet.add(key);
            edges.push({ source: nodes[i].id, target: nodes[j].id, weight });
          }
        }
      }
    }

    return this._limitDegree(edges, nodes, 8);
  }

  _limitDegree(edges, nodes, limit) {
    edges.sort((a, b) => b.weight - a.weight);
    const keepSet = new Set();
    const degree = {};

    for (const e of edges) {
      const src = typeof e.source === 'string' ? e.source : e.source.id;
      const tgt = typeof e.target === 'string' ? e.target : e.target.id;

      if ((degree[src] || 0) < limit && (degree[tgt] || 0) < limit) {
        keepSet.add(`${src}|${tgt}`);
        degree[src] = (degree[src] || 0) + 1;
        degree[tgt] = (degree[tgt] || 0) + 1;
      }
    }

    return edges.filter(e => {
      const src = typeof e.source === 'string' ? e.source : e.source.id;
      const tgt = typeof e.target === 'string' ? e.target : e.target.id;
      return keepSet.has(`${src}|${tgt}`);
    });
  }
}

export const articleRepository = new ArticleRepository();
