/**
 * Componente Sidebar - Painel de detalhes do nó selecionado
 */

import { DOC_TYPE_LABELS, DOC_TYPE_COLORS, DOC_TYPE_ICONS } from '../config/colors.js';

<<<<<<< HEAD
// Elementos do DOM
const sidebarEl = document.getElementById('sidebar');
const emptyEl = document.getElementById('sidebar-empty');
const contentEl = document.getElementById('sidebar-content');

/**
 * Fecha o sidebar
 */
export function closeSidebar() {
  if (sidebarEl) {
    sidebarEl.classList.remove('open');
  }
  if (contentEl) {
    contentEl.style.display = 'none';
  }
  if (emptyEl) {
    emptyEl.style.display = 'flex';
  }
}

/**
 * Abre o sidebar
 */
export function openSidebar() {
  if (sidebarEl) {
    sidebarEl.classList.add('open');
  }
}

/**
 * Renderiza os detalhes de um nó no sidebar
 * @param {Object|null} node 
 */
export function renderSidebar(node) {
  if (!node) {
    closeSidebar();
    return;
  }

  openSidebar();

  if (emptyEl) emptyEl.style.display = 'none';
  if (contentEl) contentEl.style.display = 'block';

  // Criar fragmento
  const frag = document.createDocumentFragment();
  const wrapper = document.createElement('div');
  wrapper.className = 'detail-card';

  // Botão fechar
  const closeBtn = document.createElement('button');
  closeBtn.className = 'sidebar-close';
  closeBtn.innerHTML = '×';
  closeBtn.setAttribute('aria-label', 'Fechar painel');
  closeBtn.addEventListener('click', closeSidebar);
  wrapper.appendChild(closeBtn);

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
  title.className = 'title';
  title.textContent = node.fullTitle || node.label;
  wrapper.appendChild(title);

  // ─── AUTOR ──────────────────────────────────────────────────────
  if (node.author) {
    const author = document.createElement('div');
    author.className = 'sub';
    author.textContent = node.author;
    wrapper.appendChild(author);
  }

  // ─── ANO ────────────────────────────────────────────────────────
  if (node.yearDisplay) {
    const year = document.createElement('div');
    year.className = 'year';
    year.textContent = `📅 ${node.yearDisplay}`;
    wrapper.appendChild(year);
  }

  // ─── ORIENTADOR ────────────────────────────────────────────────
  if (node.advisor && node.advisor !== '—') {
    const advisor = document.createElement('div');
    advisor.className = 'advisor';
    advisor.textContent = `👨‍🏫 Orientador: ${node.advisor}`;
    wrapper.appendChild(advisor);
  }

  // ─── TEMÁTICA ──────────────────────────────────────────────────
  if (node.tematica) {
    const tematica = document.createElement('div');
    tematica.className = 'tematica';
    tematica.textContent = `🏷️ ${node.tematica}`;
    wrapper.appendChild(tematica);
  }

  // ─── EDITORA/LOCAL ─────────────────────────────────────────────
  if (node.venue) {
    const venue = document.createElement('div');
    venue.className = 'year';
    venue.textContent = `📚 ${node.venue}`;
    wrapper.appendChild(venue);
  }

  // ─── PALAVRAS-CHAVE ────────────────────────────────────────────
  if (node.keywords && node.keywords.length > 0) {
    const sectionTitle = document.createElement('div');
    sectionTitle.className = 'section-title';
    sectionTitle.textContent = 'Palavras-chave';
    wrapper.appendChild(sectionTitle);

    const kwContainer = document.createElement('div');
    kwContainer.className = 'keywords';

    node.keywords.forEach(kw => {
      const tag = document.createElement('span');
      tag.textContent = kw;
      kwContainer.appendChild(tag);
    });

    wrapper.appendChild(kwContainer);
  }

  // ─── ÍCONE DO TIPO ─────────────────────────────────────────────
  const typeIcon = document.createElement('div');
  typeIcon.style.textAlign = 'center';
  typeIcon.style.marginTop = '20px';
  typeIcon.style.fontSize = '28px';
  typeIcon.style.opacity = '0.5';
  typeIcon.style.color = node.color || '#9CA3AF';
  typeIcon.textContent = DOC_TYPE_ICONS[node.docType] || '●';
  typeIcon.setAttribute('aria-hidden', 'true');
  wrapper.appendChild(typeIcon);

  frag.appendChild(wrapper);
  if (contentEl) {
    contentEl.innerHTML = '';
    contentEl.appendChild(frag);
  }
}
=======
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
>>>>>>> 4a8c95a4c1d50c35c0ad74f453a19da514262beb
