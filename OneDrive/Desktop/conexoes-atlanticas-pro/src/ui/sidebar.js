/**
 * Sidebar - Layout estilo Connected Papers
 * Painel lateral com métricas, resumo e trabalhos relacionados
 */

import { store } from '../state/store.js';
import { DOC_TYPE_LABELS, DOC_TYPE_COLORS, getNodeColorByTheme } from '../config/colors.js';

const sidebar = document.getElementById('sidebar');

export function renderSidebar(node) {
  if (!node) return;

  const color = node.color || '#64748b';
  const docTypeLabel = DOC_TYPE_LABELS[node.docType] || node.docType;
  const docTypeColor = DOC_TYPE_COLORS[node.docType] || '#64748b';

  // Buscar conexões para mostrar trabalhos relacionados
  const allEdges = store.getState().edges;
  const related = [];
  allEdges.forEach(e => {
    const src = typeof e.source === 'object' ? e.source.id : e.source;
    const tgt = typeof e.target === 'object' ? e.target.id : e.target;
    if (src === node.id || tgt === node.id) {
      const otherId = src === node.id ? tgt : src;
      const otherNode = store.getState().nodes.find(n => n.id === otherId);
      if (otherNode) {
        related.push({ node: otherNode, weight: e.weight });
      }
    }
  });
  related.sort((a, b) => b.weight - a.weight);
  const topRelated = related.slice(0, 8);

  // Keywords em comum com cada relacionado
  const nodeKw = new Set((node.keywords || []).map(k => k.toLowerCase()));

  sidebar.innerHTML = `
    <button class="sidebar-close" id="sidebar-close" title="Fechar (Esc)">×</button>

    <div class="detail-card">
      <!-- Badge de tipo + temática -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">
        <span class="sidebar-doc-badge" style="color:${docTypeColor};border-color:${docTypeColor}40;">
          <span class="dot" style="background:${docTypeColor};box-shadow:0 0 8px ${docTypeColor};"></span>
          ${docTypeLabel}
        </span>
        <span class="sidebar-doc-badge" style="color:${color};border-color:${color}40;">
          <span class="dot" style="background:${color};box-shadow:0 0 8px ${color};"></span>
          ${node.tematica}
        </span>
      </div>

      <!-- Título -->
      <h2 class="sidebar-title">${escapeHtml(node.fullTitle)}</h2>

      <!-- Autor -->
      <p class="sidebar-author">${escapeHtml(node.author)}${node.yearDisplay ? ' · ' + node.yearDisplay : ''}</p>

      <!-- Métricas (estilo Connected Papers) -->
      <div class="metrics-row" style="display:flex;gap:10px;margin:18px 0;">
        <div class="metric-card" style="flex:1;text-align:center;padding:14px 8px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.05);">
          <p style="margin:0;font-size:22px;font-weight:700;color:${color};">${node.connections || 0}</p>
          <p style="margin:4px 0 0;font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.5px;">Conexões</p>
        </div>
        <div class="metric-card" style="flex:1;text-align:center;padding:14px 8px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.05);">
          <p style="margin:0;font-size:22px;font-weight:700;color:${color};">${node.keywords?.length || 0}</p>
          <p style="margin:4px 0 0;font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.5px;">Palavras-chave</p>
        </div>
        <div class="metric-card" style="flex:1;text-align:center;padding:14px 8px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.05);">
          <p style="margin:0;font-size:22px;font-weight:700;color:${color};">${topRelated.length}</p>
          <p style="margin:4px 0 0;font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.5px;">Relacionados</p>
        </div>
      </div>

      <!-- Metadados -->
      <div class="meta-grid">
        ${node.advisor && node.advisor !== '—' ? `
        <div class="meta-item">
          <span class="meta-icon">👨‍🏫</span>
          <div>
            <span class="meta-label">Orientador</span>
            <span class="meta-value">${escapeHtml(node.advisor)}</span>
          </div>
        </div>
        ` : ''}
        <div class="meta-item">
          <span class="meta-icon">📅</span>
          <div>
            <span class="meta-label">Ano</span>
            <span class="meta-value">${node.yearDisplay || 'N/A'}</span>
          </div>
        </div>
        <div class="meta-item">
          <span class="meta-icon">🏷️</span>
          <div>
            <span class="meta-label">Temática</span>
            <span class="meta-value">${node.tematica}</span>
          </div>
        </div>
        <div class="meta-item">
          <span class="meta-icon">📄</span>
          <div>
            <span class="meta-label">Tipo</span>
            <span class="meta-value">${docTypeLabel}</span>
          </div>
        </div>
      </div>

      <!-- PDF (se disponível) -->
      ${node.pdfUrl ? `
      <a href="${node.pdfUrl}" target="_blank" rel="noopener" class="pdf-button">
        <span class="pdf-icon">📑</span>
        <span>Ver documento PDF</span>
      </a>
      ` : ''}

      <!-- Resumo -->
      <div class="abstract-section">
        <h3 class="section-title">Resumo</h3>
        ${node.abstract ? `
          <p class="abstract-text">${escapeHtml(node.abstract)}</p>
        ` : `
          <p class="abstract-text abstract-placeholder">Resumo não disponível para este documento.</p>
        `}
      </div>

      <!-- Palavras-chave -->
      <div class="keywords-section">
        <h3 class="section-title">Palavras-chave</h3>
        <div class="keywords-list">
          ${(node.keywords || []).map(k => `<span class="keyword-tag">${escapeHtml(k)}</span>`).join('')}
        </div>
      </div>

      <!-- Trabalhos Relacionados (estilo Connected Papers) -->
      ${topRelated.length > 0 ? `
      <div class="connections-section">
        <h3 class="section-title">Trabalhos Relacionados</h3>
        <div class="connections-list">
          ${topRelated.map(r => {
            const rc = r.node.color || '#64748b';
            const commonKw = (r.node.keywords || []).filter(k => nodeKw.has(k.toLowerCase())).length;
            return `
            <div class="connection-item" data-node-id="${r.node.id}">
              <span class="connection-dot" style="background:${rc};box-shadow:0 0 6px ${rc};"></span>
              <div class="connection-info">
                <p class="connection-title">${escapeHtml(r.node.fullTitle.length > 50 ? r.node.fullTitle.substring(0, 48) + '...' : r.node.fullTitle)}</p>
                <p class="connection-meta">${escapeHtml(r.node.author)} · ${r.node.yearDisplay || 'N/A'}${commonKw > 0 ? ' · ' + commonKw + ' tema' + (commonKw > 1 ? 's' : '') + ' em comum' : ''}</p>
              </div>
              <span class="connection-weight">${r.weight.toFixed(1)}</span>
            </div>
            `;
          }).join('')}
        </div>
      </div>
      ` : ''}

      <!-- Rodapé -->
      <div class="sidebar-footer">
        <span class="type-icon-large" style="color:${color};">●</span>
        <span class="footer-label">${node.tematica}</span>
      </div>
    </div>
  `;

  sidebar.classList.add('open');

  // Eventos
  document.getElementById('sidebar-close')?.addEventListener('click', closeSidebar);

  // Clicar em trabalho relacionado → seleciona ele
  sidebar.querySelectorAll('.connection-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.nodeId;
      store.setState({ selectedNodeId: id });
    });
  });
}

export function closeSidebar() {
  sidebar.classList.remove('open');
  sidebar.innerHTML = `
    <div class="empty-state">
      <div class="big-icon">✦</div>
      <p>Clique em um nó para ver detalhes</p>
    </div>
  `;
  store.setState({ selectedNodeId: null });
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
