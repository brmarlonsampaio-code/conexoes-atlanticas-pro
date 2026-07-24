/**
 * Sistema de tooltips
 */

import { escapeHTML } from '../utils/dom.js';

const tooltip = document.getElementById('tooltip');

/**
 * Mostra tooltip
 * @param {MouseEvent} event 
 * @param {Object} node 
 */
export function showTooltip(event, node) {
  if (!tooltip) return;

  const venueText = node.venue ? ` · ${node.venue}` : '';
  const citText = node.citations > 0 ? ` · ${node.citations} citações` : '';

  tooltip.innerHTML = `
    <strong>${escapeHTML(node.fullTitle)}</strong>
    <div class="tooltip-sub">
      ${escapeHTML(node.author)} · ${escapeHTML(node.yearDisplay)} · ${escapeHTML(node.tematica)}${venueText}${citText}
    </div>
  `;

  tooltip.style.display = 'block';
  positionTooltip(event);
}

/**
 * Posiciona tooltip
 * @param {MouseEvent} event 
 */
export function positionTooltip(event) {
  if (!tooltip) return;
  tooltip.style.left = `${event.clientX + 12}px`;
  tooltip.style.top = `${event.clientY - 10}px`;
}

/**
 * Esconde tooltip
 */
export function hideTooltip() {
  if (!tooltip) return;
  tooltip.style.display = 'none';
}
