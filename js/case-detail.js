/* Renders pages/cases/case.html?slug=<slug> from the case data (schema: content/cases.js). */
(function (VM) {
  'use strict';

  const { el, image, paragraphs } = VM.dom;

  const SECTIONS = [
    { key: 'context', title: 'Контекст' },
    { key: 'task', title: 'Задача' },
    { key: 'personalContribution', title: 'Что сделала Виктория' },
    { key: 'solution', title: 'Решение' },
    { key: 'implementation', title: 'Реализация' },
    { key: 'result', title: 'Результат' }
  ];
  const PENDING_TEXT = 'Материал будет добавлен.';

  function figure(media, className) {
    const node = el('figure', className);
    node.append(image(media));
    if (media.caption) node.append(el('figcaption', null, media.caption));
    return node;
  }

  function block(title, children) {
    const section = el('section', 'case__block');
    const body = el('div', 'prose');
    body.append(...children);
    section.append(el('h2', 'case__block-title', title), body);
    return section;
  }

  function pending() {
    return el('p', 'placeholder', PENDING_TEXT);
  }

  function renderNotFound(root) {
    root.replaceChildren(
      el('h1', 'case__title', 'Кейс не найден'),
      el('p', 'case__summary', 'Возможно, ссылка устарела. Посмотрите другие кейсы на главной странице.')
    );
  }

  function renderCase(root, item) {
    // Drafts show every slot so the layout can be reviewed; published cases hide empty ones.
    const showEmpty = item.status !== 'published';
    const title = item.title || [item.industry, item.subtitle].filter(Boolean).join(' — ');
    document.title = `${title} — Виктория Мыльникова`;

    const header = el('header', 'case__header');
    header.append(el('p', 'eyebrow', `${item.industry} · ${item.category}`), el('h1', 'case__title', title));
    if (item.title && item.subtitle) header.append(el('p', 'case__summary', item.subtitle));
    if (item.tags.length) {
      const tags = el('ul', 'case__tags');
      tags.append(...item.tags.map((tag) => el('li', 'case__tag', tag)));
      header.append(tags);
    }
    const hero = item.images.hero || item.images.cover;
    if (hero) header.append(figure(hero, 'case__cover'));

    const meta = el('dl', 'case__meta');
    [
      ['Клиент', item.client],
      ['Сегмент', item.category],
      ['Направление', item.subtitle],
      ['Период', item.period],
      ['Длительность', item.duration]
    ].forEach(([term, value]) => {
      if (!value && !showEmpty) return;
      const group = el('div');
      group.append(el('dt', 'case__meta-term', term), el('dd', 'case__meta-value', value || '—'));
      meta.append(group);
    });

    const blocks = SECTIONS
      .filter(({ key }) => item[key] || showEmpty)
      .map(({ key, title: blockTitle }) => block(blockTitle, item[key] ? paragraphs(item[key]) : [pending()]));

    if (item.metrics.length || showEmpty) {
      const content = [];
      if (item.metrics.length) {
        const list = el('dl', 'case__metrics');
        list.append(...item.metrics.map(({ value, label }) => {
          const group = el('div', 'case__metric');
          group.append(el('dt', 'case__metric-value', value), el('dd', 'case__metric-label', label));
          return group;
        }));
        content.push(list);
      } else {
        content.push(pending());
      }
      blocks.push(block('Результат в цифрах', content));
    }

    if (item.gallery.length || showEmpty) {
      const gallery = el('div', 'case__gallery');
      if (item.gallery.length) gallery.append(...item.gallery.map((media) => figure(media, 'case__figure')));
      else gallery.append(pending());
      blocks.push(block('Визуальные материалы', [gallery]));
    }

    root.replaceChildren(header, meta, ...blocks);
  }

  async function init() {
    const root = document.querySelector('[data-case-detail]');
    if (!root) return;
    const slug = new URLSearchParams(window.location.search).get('slug');
    const item = slug ? await VM.api.getCase(slug) : null;
    if (item) renderCase(root, item);
    else renderNotFound(root);
  }

  init();
})(window.VM);
