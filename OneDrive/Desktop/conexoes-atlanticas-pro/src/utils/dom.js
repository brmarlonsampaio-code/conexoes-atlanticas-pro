/**
 * Utilitários DOM seguros
 */

/**
 * Escapa caracteres HTML perigosos
 * @param {string} str 
 * @returns {string}
 */
export function escapeHTML(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Cria um elemento DOM com atributos e filhos
 * @param {string} tag 
 * @param {Object} options 
 * @returns {HTMLElement}
 */
export function createElement(tag, options = {}) {
  const el = document.createElement(tag);

  if (options.className) el.className = options.className;
  if (options.id) el.id = options.id;
  if (options.text !== undefined) el.textContent = options.text;
  if (options.html) el.innerHTML = options.html; // use com cuidado
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([key, val]) => el.setAttribute(key, val));
  }
  if (options.style) {
    Object.entries(options.style).forEach(([key, val]) => el.style[key] = val);
  }
  if (options.children) {
    options.children.forEach(child => el.appendChild(child));
  }
  if (options.onClick) {
    el.addEventListener('click', options.onClick);
  }

  return el;
}

/**
 * Limpa o conteúdo de um elemento
 * @param {HTMLElement} element 
 */
export function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Template tag para HTML seguro
 */
export function safeHTML(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const value = values[i] || '';
    return result + str + escapeHTML(value);
  }, '');
}
