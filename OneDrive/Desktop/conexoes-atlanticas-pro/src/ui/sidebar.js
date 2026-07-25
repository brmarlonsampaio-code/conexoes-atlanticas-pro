/**
 * Componente Sidebar - Painel de detalhes acadêmicos do nó selecionado
 */

import { store } from '../state/store.js';
import { DOC_TYPE_LABELS, DOC_TYPE_ICONS } from '../config/colors.js';

const sidebarEl = document.getElementById('sidebar');
const emptyEl = document.getElementById('sidebar-empty');
const contentEl = document.getElementById('sidebar-content');

export function closeSidebar() {
  if (sidebarEl) sidebarEl.classList.remove('open');
  if (contentEl) contentEl.style.display = 'none';
  if (emptyEl) emptyEl.style.display = 'flex';
}

export function openSidebar() {
  if (sidebarEl) sidebarEl.classList.add('open');
}

/**
 * Renderiza sidebar completo com dados acadêmicos
 */
export function renderSidebar(node) {
  if (!node) { closeSidebar(); return; }

  openSidebar();
  if (emptyEl) emptyEl.style.display = 'none';
  if (contentEl) contentEl.style.display = 'block';

  const state = store.getState();
  const edges = state.edges || [];
  const allNodes = state.nodes || [];

  // Encontrar conexões do nó
  const connections = edges.filter(e => {
    const src = typeof e.source === 'object' ? e.source.id : e.source;
    const tgt = typeof e.target === 'object' ? e.target.id : e.target;
    return src === node.id || tgt === node.id;
  }).map(e => {
    const src = typeof e.source === 'object' ? e.source.id : e.source;
    const tgt = typeof e.target === 'object' ? e.target.id : e.target;
    const otherId = src === node.id ? tgt : src;
    const otherNode = allNodes.find(n => n.id === otherId);
    return { node: otherNode, weight: e.weight };
  }).filter(c => c.node).sort((a, b) => b.weight - a.weight);

  const degree = connections.length;

  // Botão de PDF
  const pdfButton = node.pdfUrl ? `
    <a href="${escapeHtml(node.pdfUrl)}" target="_blank" rel="noopener noreferrer" class="pdf-button">
      <span class="pdf-icon">📄</span>
      <span>Ver PDF do documento</span>
    </a>
  ` : '';

  const html = `
    <div class="detail-card">
      <button class="sidebar-close" aria-label="Fechar painel">×</button>

      <!-- Badge de tipo -->
      <div class="sidebar-doc-badge" style="color:${node.color};border-color:${node.color}">
        <span class="dot" style="background:${node.color};box-shadow:0 0 8px ${node.color}"></span>
        <span>${DOC_TYPE_LABELS[node.docType] || 'Documento'}</span>
      </div>

      <!-- Botão PDF (se existir) -->
      ${pdfButton}

      <!-- Título -->
      <h2 class="sidebar-title">${escapeHtml(node.fullTitle || node.label)}</h2>

      <!-- Autor -->
      ${node.author ? `<div class="sidebar-author">${escapeHtml(node.author)}</div>` : ''}

      <!-- Metadados em grid -->
      <div class="meta-grid">
        ${node.yearDisplay ? `
          <div class="meta-item">
            <span class="meta-icon">📅</span>
            <div>
              <span class="meta-label">Ano</span>
              <span class="meta-value">${escapeHtml(node.yearDisplay)}</span>
            </div>
          </div>
        ` : ''}
        ${node.advisor && node.advisor !== '—' ? `
          <div class="meta-item">
            <span class="meta-icon">👨‍🏫</span>
            <div>
              <span class="meta-label">Orientador</span>
              <span class="meta-value">${escapeHtml(node.advisor)}</span>
            </div>
          </div>
        ` : ''}
        ${node.tematica ? `
          <div class="meta-item">
            <span class="meta-icon">🏷️</span>
            <div>
              <span class="meta-label">Temática</span>
              <span class="meta-value">${escapeHtml(node.tematica)}</span>
            </div>
          </div>
        ` : ''}
        ${node.venue ? `
          <div class="meta-item">
            <span class="meta-icon">📚</span>
            <div>
              <span class="meta-label">Editora/Local</span>
              <span class="meta-value">${escapeHtml(node.venue)}</span>
            </div>
          </div>
        ` : ''}
        <div class="meta-item">
          <span class="meta-icon">🔗</span>
          <div>
            <span class="meta-label">Conexões</span>
            <span class="meta-value">${degree} documento${degree !== 1 ? 's' : ''} relacionado${degree !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      <!-- Resumo/Abstract -->
      ${node.abstract ? `
        <div class="abstract-section">
          <h3 class="section-title">Resumo</h3>
          <p class="abstract-text">${escapeHtml(node.abstract)}</p>
        </div>
      ` : `
        <div class="abstract-section">
          <h3 class="section-title">Resumo</h3>
          <p class="abstract-text abstract-placeholder">Resumo não disponível para este documento.</p>
        </div>
      `}

      <!-- Palavras-chave -->
      ${node.keywords && node.keywords.length > 0 ? `
        <div class="keywords-section">
          <h3 class="section-title">Palavras-chave</h3>
          <div class="keywords-list">
            ${node.keywords.map(kw => `<span class="keyword-tag">${escapeHtml(kw)}</span>`).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Conexões -->
      ${connections.length > 0 ? `
        <div class="connections-section">
          <h3 class="section-title">Documentos Relacionados (${connections.length})</h3>
          <div class="connections-list">
            ${connections.slice(0, 10).map(c => `
              <div class="connection-item" data-node-id="${c.node.id}">
                <span class="connection-dot" style="background:${c.node.color || '#9CA3AF'};box-shadow:0 0 6px ${c.node.color || '#9CA3AF'}"></span>
                <div class="connection-info">
                  <div class="connection-title">${escapeHtml(c.node.label)}</div>
                  <div class="connection-meta">${escapeHtml(c.node.author || '')} · ${escapeHtml(c.node.yearDisplay || '')}</div>
                </div>
                <span class="connection-weight">${c.weight.toFixed(1)}</span>
              </div>
            `).join('')}
            ${connections.length > 10 ? `<div class="connection-more">+${connections.length - 10} documentos relacionados</div>` : ''}
          </div>
        </div>
      ` : ''}

      <!-- Rodapé -->
      <div class="sidebar-footer">
        <div class="type-icon-large" style="color:${node.color || '#9CA3AF'}">
          ${DOC_TYPE_ICONS[node.docType] || '●'}
        </div>
        <div class="footer-label">${DOC_TYPE_LABELS[node.docType] || 'Documento'}</div>
      </div>
    </div>
  `;

  if (contentEl) {
    contentEl.innerHTML = html;

    const closeBtn = contentEl.querySelector('.sidebar-close');
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);

    contentEl.querySelectorAll('.connection-item').forEach(item => {
      item.addEventListener('click', () => {
        const nodeId = item.dataset.nodeId;
        if (nodeId) store.setState({ selectedNodeId: nodeId });
      });
    });
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
