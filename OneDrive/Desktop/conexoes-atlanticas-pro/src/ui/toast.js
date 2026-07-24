/**
 * Sistema de notificações não-bloqueantes
 */

const TOAST_DURATION = 3000;
const TOAST_CONTAINER_ID = 'toast-container';

function getContainer() {
  let container = document.getElementById(TOAST_CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = TOAST_CONTAINER_ID;
    container.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Exibe uma notificação toast
 * @param {string} message 
 * @param {'info'|'success'|'error'|'loading'} type 
 * @param {number} duration 
 */
export function showToast(message, type = 'info', duration = TOAST_DURATION) {
  const container = getContainer();

  const icons = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    loading: '⏳'
  };

  const colors = {
    info: 'rgba(100, 149, 237, 0.9)',
    success: 'rgba(46, 139, 87, 0.9)',
    error: 'rgba(178, 34, 34, 0.9)',
    loading: 'rgba(212, 168, 83, 0.9)'
  };

  const toast = document.createElement('div');
  toast.style.cssText = `
    background: ${colors[type]};
    color: #fff;
    padding: 10px 20px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 400;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    opacity: 0;
    transform: translateY(10px);
    transition: all 300ms ease;
    pointer-events: auto;
    white-space: nowrap;
  `;
  toast.textContent = `${icons[type]} ${message}`;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  if (type !== 'loading') {
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  return toast;
}

/**
 * Remove um toast específico
 * @param {HTMLElement} toast 
 */
export function hideToast(toast) {
  if (!toast) return;
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(10px)';
  setTimeout(() => toast.remove(), 300);
}
