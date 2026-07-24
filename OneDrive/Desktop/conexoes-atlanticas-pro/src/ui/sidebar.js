/**
 * Renderização do painel lateral
 */

import { escapeHTML, createElement, clearElement } from '../utils/dom.js';
import { store } from '../state/store.js';

const sidebar = document.getElementById('sidebar');
const sidebarEmpty = document.getElementById('sidebar-empty');
const sidebarContent = document.getElementById('sidebar-content');

/**
 * Gera resumo do abstract
 * @param {Object} node 
 * @returns {string}
 */
function generateAbstract(node) {
  if (node.abstract && node.abstract.trim().length > 0) {
    return node.abstract;
  }

  const parts = [`Temática: ${node.tematica}.`];
  if (node.advisor && node.advisor !== '—') {
    parts.push(`Orientado por ${node.advisor},`);
  }
  if (node.keywords && node.keywords.length) {
    parts.push(`aborda temas como ${node.keywords.slice(0, 4).join(', ')}`);
  }
  parts.push('situado no contexto da história da Bahia.');
  return parts.join(' ');
}

/**
 * Cria lista de conexões
 * @param {Object[]} connections 
 * @param {Function} onSelect 
 * @returns {HTMLElement}
 */
function createConnectionsList(connections, onSelect) {
  if (!connections || connections.length === 0) {
    return createElement('div', {
      text: 'Nenhuma conexão direta',
      style: { fontSize: '13px', color: 'rgba(255,255,255,0.2)', margin: '8px 0 12px' }
    });
  }

  const list = createElement('div', { className: 'connections-list' });

  connections.forEach(conn => {
    const item = createElement('div', {
      className: 'conn-item',
      style: { cursor: 'pointer' },
      onClick: () => onSelect(conn.id)
    });

    const dot = createElement('span', {
      className: 'conn-dot',
      style: { background: conn.color || '#4a5a6a' }
    });

    const label = createElement('span', { text: conn.label });
    const year = createElement('span', {
      text: conn.yearDisplay || '—',
      style: { marginLeft: 'auto', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }
    });

    item.appendChild(dot);
    item.appendChild(label);
    item.appendChild(year);
    list.appendChild(item);
  });

  return list;
}

/**
 * Renderiza o sidebar com dados do nó
 * @param {Object} node 
 */
export function renderSidebar(node) {
  if (!node) {
    closeSidebar();
    return;
  }

  sidebarEmpty.style.display = 'none';
  sidebarContent.style.display = 'block';
  sidebar.classList.add('open');

  const state = store.getState();
  const edges = state.edges;
  const allNodes = state.nodes;

  // Calcular conexões
  const connectedEdges = edges.filter(e => {
    const src = typeof e.source === 'object' ? e.source.id : e.source;
    const tgt = typeof e.target === 'object' ? e.target.id : e.target;
    return src === node.id || tgt === node.id;
  });

  const connections = connectedEdges.map(e => {
    const src = typeof e.source === 'object' ? e.source.id : e.source;
    const tgt = typeof e.target === 'object' ? e.target.id : e.target;
    const otherId = src === node.id ? tgt : src;
    return allNodes.find(n => n.id === otherId);
  }).filter(Boolean);

  const uniqueConnections = connections.filter((v, i, a) => 
    a.findIndex(t => t.id === v.id) === i
  );

  const degree = connectedEdges.length;

  // Construir DOM
  clearElement(sidebarContent);

  const card = createElement('div', { className: 'detail-card' });

  // Badge
  const badge = createElement('div', {
    className: 'badge-category',
    text: 'Trabalho Acadêmico',
    style: {
      background: `${node.color}22`,
      color: node.color,
      borderColor: `${node.color}44`
    }
  });
  card.appendChild(badge);

  // Título
  card.appendChild(createElement('h2', { 
    className: 'title', 
    text: node.fullTitle 
  }));

  // Autor
  card.appendChild(createElement('p', { 
    className: 'sub', 
    text: node.author 
  }));

  // Ano
  card.appendChild(createElement('p', { 
    className: 'year', 
    text: `📅 ${node.yearDisplay || '—'}` 
  }));

  // Orientador
  card.appendChild(createElement('p', { 
    className: 'advisor', 
    text: `👨‍🏫 Orientador: ${node.advisor || '—'}` 
  }));

  // Temática
  card.appendChild(createElement('p', { 
    className: 'tematica', 
    text: `✦ Temática: ${node.tematica}` 
  }));

  // Keywords
  if (node.keywords && node.keywords.length) {
    const kwContainer = createElement('div', { className: 'keywords' });
    node.keywords.forEach(kw => {
      kwContainer.appendChild(createElement('span', { text: kw }));
    });
    card.appendChild(kwContainer);
  }

  // Abstract
  const abstract = createElement('div', { 
    className: 'abstract', 
    text: generateAbstract(node) 
  });
  card.appendChild(abstract);

  // Centralidade
  card.appendChild(createElement('div', {
    className: 'section-title',
    text: '📊 Centralidade'
  }));
  card.appendChild(createElement('p', {
    style: { fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px' },
    text: `Grau: ${degree} conexões${degree > 5 ? ' ⭐ Nó central' : ''}`
  }));

  // Conexões
  card.appendChild(createElement('div', {
    className: 'section-title',
    text: '🔗 Conexões diretas'
  }));
  card.appendChild(createConnectionsList(uniqueConnections, (id) => {
    store.setState({ selectedNodeId: id });
  }));

  // Botão fechar
  const closeBtn = createElement('button', {
    className: 'sidebar-close',
    text: '✕',
    onClick: closeSidebar
  });

  sidebarContent.appendChild(closeBtn);
  sidebarContent.appendChild(card);
}

/**
 * Fecha o sidebar
 */
export function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarEmpty.style.display = 'flex';
  sidebarContent.style.display = 'none';
  store.setState({ selectedNodeId: null, ui: { ...store.getState().ui, sidebarOpen: false } });
}

// Subscrever a mudanças de seleção
store.subscribe((state, prev) => {
  if (state.selectedNodeId !== prev.selectedNodeId) {
    if (state.selectedNodeId) {
      const node = state.nodes.find(n => n.id === state.selectedNodeId);
      renderSidebar(node);
    } else {
      closeSidebar();
    }
  }
});
