window.VM = window.VM || {};

(function () {
  'use strict';

  // Site root, derived from this file's URL (…/js/dom.js), so content paths
  // like 'assets/images/…' resolve the same from index.html and pages/cases/.
  const script = document.currentScript;
  const root = new URL('../', script ? script.src : window.location.href);

  window.VM.dom = {
    /* Creates an element; text is always set via textContent, never as HTML. */
    el(tag, className, text) {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text != null) node.textContent = text;
      return node;
    },

    /* Text = string | string[] → array of <p>. */
    paragraphs(text, className) {
      const list = Array.isArray(text) ? text : [text];
      return list.filter(Boolean).map((item) => window.VM.dom.el('p', className, item));
    },

    /* Content path (relative to the site root) → absolute URL. */
    asset(path) {
      return new URL(path, root).href;
    },

    /* Image = { src, alt } → <img>. */
    image({ src, alt }, className) {
      const img = window.VM.dom.el('img', className);
      img.src = window.VM.dom.asset(src);
      img.alt = alt || '';
      img.loading = 'lazy';
      img.decoding = 'async';
      return img;
    },

    /* Russian typography: glue short words to the next one and dashes to the previous. */
    nbsp(text) {
      return text
        .replace(/ (—|–)/g, ' $1')
        .replace(/(^|[\s ])([а-яёa-z]{1,2}) /gi, '$1$2 ');
    }
  };
})();
