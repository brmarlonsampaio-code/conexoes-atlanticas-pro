/**
 * Componente Sidebar - Painel de detalhes do nó selecionado
 */

import { DOC_TYPE_LABELS, DOC_TYPE_COLORS, DOC_TYPE_ICONS } from '../config/colors.js';

export class Sidebar {
  constructor() {
    this.emptyEl = document.getElementById('sidebar-empty');
    this.contentEl = document.getElementById('sidebar-content');
  }

  /**
   * Renderiza os detalhes de um nó
   * @param {Object|null} node 
   */
  render(node) {
    if (!node) {
      this.emptyEl.style.display = 'flex';
      this.contentEl.style.display = 'none';
      this.contentEl.innerHTML = '';
      return;
    }

    this.emptyEl.style.display = 'none';
    this.contentEl.style.display = 'block';

    // Criar fragmento para evitar múltiplos reflows
    const frag = document.createDocumentFragment();
    const wrapper = document.createElement('div');
    wrapper.className = 'sidebar-detail';

    // ─── BADGE DE TIPO DE DOCUMENTO ─────────────────────────────────
    const badge = document.createElement('div');
    badge.className = 'sidebar-doc-badge';
    badge.style.color = node.color || '#9CA3AF';
    badge.style.borderColor = node.color || '#9CA3AF';

    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.style.backgroundColor = node.color || '#9CA3AF';

    const badgeLabel = document.createElement('span');
    badgeLabel.textContent = DOC_TYPE_LABELS[node.docType] || 'Documento';

    badge.appendChild(dot);
    badge.appendChild(badgeLabel);
    wrapper.appendChild(badge);

    // ─── TÍTULO ─────────────────────────────────────────────────────
    const title = document.createElement('h2');
    title.className = 'sidebar-title';
    title.textContent = node.fullTitle || node.label;
    wrapper.appendChild(title);

    // ─── METADADOS ──────────────────────────────────────────────────
    const meta = document.createElement('div');
    meta.className = 'sidebar-meta';

    const fields = [
      { label: 'Autor', value: node.author },
      { label: 'Orientador', value: node.advisor },
      { label: 'Ano', value: node.yearDisplay },
      { label: 'Temática', value: node.tematica },
    ];

    // Só mostra editora se existir (referências bibliográficas)
    if (node.venue) {
      fields.push({ label: 'Editora/Local', value: node.venue });
    }

    fields.forEach(field => {
      if (!field.value || field.value === '—') return;
      const row = document.createElement('div');
      row.className = 'meta-row';

      const lbl = document.createElement('span');
      lbl.className = 'meta-label';
      lbl.textContent = field.label;

      const val = document.createElement('span');
      val.className = 'meta-value';
      val.textContent = field.value;

      row.appendChild(lbl);
      row.appendChild(val);
      meta.appendChild(row);
    });

    wrapper.appendChild(meta);

    // ─── PALAVRAS-CHAVE ────────────────────────────────────────────
    if (node.keywords && node.keywords.length > 0) {
      const kwSection = document.createElement('div');
      kwSection.className = 'sidebar-keywords';

      const kwTitle = document.createElement('h3');
      kwTitle.textContent = 'Palavras-chave';
      kwSection.appendChild(kwTitle);

      const kwList = document.createElement('div');
      kwList.className = 'keyword-list';

      node.keywords.forEach(kw => {
        const tag = document.createElement('span');
        tag.className = 'keyword-tag';
        tag.textContent = kw;
        kwList.appendChild(tag);
      });

      kwSection.appendChild(kwList);
      wrapper.appendChild(kwSection);
    }

    // ─── ÍCONE E LINKS ────────────────────────────────────────────
    const actions = document.createElement('div');
    actions.className = 'sidebar-actions';

    const typeIcon = document.createElement('div');
    typeIcon.className = 'type-icon-large';
    typeIcon.style.color = node.color || '#9CA3AF';
    typeIcon.textContent = DOC_TYPE_ICONS[node.docType] || '●';
    typeIcon.setAttribute('aria-hidden', 'true');
    actions.appendChild(typeIcon);

    wrapper.appendChild(actions);

    frag.appendChild(wrapper);
    this.contentEl.innerHTML = '';
    this.contentEl.appendChild(frag);
  }

  /**
   * Limpa o sidebar
   */
  clear() {
    this.render(null);
  }
}

export const sidebar = new Sidebar();
