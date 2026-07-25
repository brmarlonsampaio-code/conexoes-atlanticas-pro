/**
 * Componente Sidebar - Painel de detalhes do nó selecionado
 */

import { DOC_TYPE_LABELS, DOC_TYPE_ICONS } from '../config/colors.js';

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
