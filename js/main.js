/*
 * Shared page behaviour: header, navigation, reveal motion, lead form and
 * rendering of content/ (hero, about, expertise, cases, approach, reviews, contacts).
 * Flow: content/*.js → js/api.js → renderers below → DOM.
 */
(function (VM) {
  'use strict';

  const { el, image, nbsp, paragraphs } = VM.dom;
  const pad = (number) => String(number).padStart(2, '0');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Keep in sync with the header breakpoint in css/style.css.
  const desktopNav = window.matchMedia('(min-width: 1024px)');

  /* ---- Reveal on scroll: CSS hides [data-reveal] until .is-visible ---- */

  const revealObserver = !reducedMotion.matches && 'IntersectionObserver' in window
    ? new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' })
    : null;

  // Call right after the nodes are inserted (same task), so they never flash.
  function reveal(nodes, { step = 0, delay = 0 } = {}) {
    Array.from(nodes).forEach((node, index) => {
      node.setAttribute('data-reveal', '');
      if (step || delay) node.style.setProperty('--reveal-delay', `${delay + index * step}ms`);
      if (revealObserver) revealObserver.observe(node);
      else node.classList.add('is-visible');
    });
  }

  /* ---- Header & navigation ---- */

  function initHeader() {
    const header = document.querySelector('[data-header]');
    if (!header) return;
    const update = () => header.toggleAttribute('data-scrolled', window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function initNav() {
    const header = document.querySelector('[data-header]');
    const toggle = document.querySelector('[data-nav-toggle]');
    if (!header || !toggle) return;
    const label = toggle.querySelector('.visually-hidden');
    const outside = document.querySelectorAll('main, .site-footer');

    const setOpen = (open) => {
      header.toggleAttribute('data-nav-open', open);
      document.documentElement.toggleAttribute('data-nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? 'Закрыть меню' : 'Меню';
      outside.forEach((node) => { node.inert = open; });
    };

    toggle.addEventListener('click', () => setOpen(!header.hasAttribute('data-nav-open')));
    header.querySelectorAll('[data-nav] a').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !header.hasAttribute('data-nav-open')) return;
      setOpen(false);
      toggle.focus();
    });
    desktopNav.addEventListener('change', () => setOpen(false));
  }

  /* ---- Start position & in-page links ---- */

  // A plain visit or a reload always starts at the hero: the browser's own
  // scroll restoration is off, and in-page links (below) never write a #hash
  // into the address, so a later reload cannot land on a section. A URL that
  // is opened with an explicit #hash (a shared link, «← Все кейсы» on a case
  // page) still lands on that section.
  function initScrollStart() {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const entry = performance.getEntriesByType('navigation')[0];
    const type = entry ? entry.type : 'navigate';
    if (window.location.hash && type === 'navigate') return;
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    // Repeat once on load (fonts and rendered content change the layout), but
    // never pull the page back once the visitor has started scrolling.
    let touched = false;
    ['wheel', 'touchstart', 'keydown'].forEach((name) => {
      window.addEventListener(name, () => { touched = true; }, { once: true, passive: true });
    });
    const toTop = () => {
      if (!touched) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };
    toTop();
    window.addEventListener('load', toTop, { once: true });
  }

  // In-page links scroll to their section without adding #hash to the URL.
  // Focus moves to the section, as with native anchor navigation.
  function initInPageLinks() {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link || event.defaultPrevented || event.button !== 0
        || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const id = decodeURIComponent(link.getAttribute('href').slice(1));
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  }

  /* ---- Current section indicator ---- */

  // The marker of the section being read («01 ─ ОБО МНЕ ───») turns Emerald
  // and a step bolder (CSS: .section-header.is-current). The current section
  // is the last one whose top has passed a reading line at 40% of the
  // viewport height — measured from the real section boxes on every frame of
  // scrolling, so it works the same on desktop, tablet and phone. A switch
  // needs the boundary to be crossed by HYSTERESIS px, so resting right on
  // the border between two sections never flickers. At the very bottom of
  // the page the last section is current. In the hero, none is.
  function initSectionIndicator() {
    const sections = [...document.querySelectorAll('main > section')]
      .filter((section) => section.querySelector('.section-header'));
    if (!sections.length) return;
    const headers = sections.map((section) => section.querySelector('.section-header'));
    const HYSTERESIS = 24;
    let current = -1;
    let frame = 0;

    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      const tops = sections.map((section) => section.getBoundingClientRect().top);
      let next = -1;
      tops.forEach((top, index) => {
        if (top <= line) next = index;
      });
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) next = sections.length - 1;
      if (next === current) return;
      if (!atBottom) {
        const crossed = next > current
          ? tops[next] <= line - HYSTERESIS
          : tops[current] > line + HYSTERESIS;
        if (!crossed) return;
      }
      current = next;
      headers.forEach((header, index) => header.classList.toggle('is-current', index === current));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('load', schedule, { once: true });
  }

  /* ---- Site content ---- */

  function renderContacts(contacts) {
    if (!contacts) return;
    const { email, telegram, phone, phoneE164 } = contacts;
    const items = [
      { label: 'Telegram', value: `@${telegram}`, href: `https://t.me/${telegram}` },
      { label: 'Телефон', value: phone, href: `tel:${phoneE164}` },
      { label: 'Email', value: email, href: `mailto:${email}` }
    ];
    const external = (link) => {
      link.target = '_blank';
      link.rel = 'noopener';
    };

    document.querySelectorAll('[data-contact-list]').forEach((list) => {
      list.replaceChildren(...items.map((item) => {
        const li = el('li', 'contact-list__item');
        const link = el('a', 'contact-list__value', item.value);
        link.href = item.href;
        if (item.href.startsWith('https:')) external(link);
        li.append(el('span', 'contact-list__label', item.label), link);
        return li;
      }));
    });

    document.querySelectorAll('[data-telegram-link]').forEach((link) => {
      link.href = `https://t.me/${telegram}`;
      external(link);
    });
  }

  const SVG_NS = 'http://www.w3.org/2000/svg';

  // Emerald brush stroke under the headline accent (.mark in the CSS): a filled
  // shape — tapered start, fuller body, ragged bristle end, a thin dry streak.
  // Keep in sync with the no-JS fallback in index.html.
  const BRUSH_PATH = 'M1.5 12C18 10.1 46 8.2 82 7.3C118 6.4 158 6.2 189 6.8L194.5 5.6L192.4 7.6'
    + 'L199.5 8.2L193.6 9.3L197.8 11.2L190.2 10.9C160 10.8 120 11 84 11.6C52 12.2 24 13.3 4.5 14.6'
    + 'C2.3 14.8 .5 13.1 1.5 12ZM118 8.5C143 8.1 166 8.1 184 8.4L184 8.8C166 8.6 143 8.7 118 8.9Z'
    + 'M150 9.9C168 9.7 180 9.8 189 10.1L189 10.4C180 10.2 168 10.2 150 10.3Z';

  function markStroke() {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'mark__stroke');
    svg.setAttribute('viewBox', '0 0 200 16');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('fill-rule', 'evenodd');
    path.setAttribute('d', BRUSH_PATH);
    svg.append(path);
    return svg;
  }

  // The hero markup is a no-JS fallback; content/site.js is the source of truth.
  function renderHero(hero) {
    if (!hero) return;
    const find = (selector) => document.querySelector(selector);

    const role = find('[data-hero-role]');
    if (role && hero.role) {
      // «A / B»: B stays on one line, so a wrap never strands half of it.
      const [first, ...rest] = hero.role.split(' / ');
      role.replaceChildren(rest.length ? `${first} / ` : first);
      if (rest.length) role.append(el('span', 'nowrap', rest.join(' / ')));
    }

    const name = find('[data-hero-name]');
    if (name && hero.name) {
      const [first, ...rest] = hero.name.split(' ');
      name.replaceChildren(el('span', 'hero__name-line', first));
      if (rest.length) name.append(' ', el('span', 'hero__name-line hero__name-line--offset', rest.join(' ')));
    }

    const headline = find('[data-hero-headline]');
    if (headline && hero.headline) {
      const text = nbsp(hero.headline);
      const accent = hero.headlineAccent;
      const at = accent ? text.indexOf(accent) : -1;
      if (at < 0) {
        headline.replaceChildren(text);
      } else {
        const mark = el('span', 'mark', accent);
        mark.append(markStroke());
        headline.replaceChildren(text.slice(0, at), mark, text.slice(at + accent.length));
      }
    }

    [['primary', hero.ctaPrimary], ['secondary', hero.ctaSecondary]].forEach(([kind, cta]) => {
      const link = find(`[data-hero-cta="${kind}"]`);
      if (!link || !cta) return;
      const arrow = link.querySelector('.button__arrow');
      link.href = cta.href;
      link.replaceChildren(cta.label);
      if (arrow) link.append(' ', arrow);
    });

    const tagline = find('[data-hero-tagline]');
    if (tagline) {
      tagline.textContent = hero.tagline || '';
      tagline.hidden = !hero.tagline;
    }

    const portrait = find('[data-portrait]');
    if (portrait && hero.portrait) {
      const img = image(hero.portrait, 'portrait__image');
      img.loading = 'eager';
      img.fetchPriority = 'high';
      portrait.querySelector('.portrait__frame').replaceChildren(img);
    }

    const facts = find('[data-hero-facts]');
    if (facts && hero.facts) {
      facts.replaceChildren(...hero.facts.map((fact) => el('li', 'hero__fact', fact)));
      reveal(facts.children, { step: 90, delay: 420 });
    }
  }

  // Keeps the markup placeholder until the client's text or photo arrives.
  function renderAbout(about) {
    if (!about) return;

    const statement = document.querySelector('[data-about-statement]');
    if (statement && about.statement && about.statement.length) {
      const last = about.statement.length - 1;
      const words = about.statement.map((word, index) =>
        el('span', index === last ? 'about__word about__word--accent' : 'about__word', nbsp(word)));
      statement.replaceChildren(...words.flatMap((word, index) => (index ? [' ', word] : [word])));
      reveal(words, { step: 90 });
    }

    const aside = document.querySelector('[data-about-text]');
    const { intro, mainText, secondaryText, photo } = about;
    if (!aside || !(intro || mainText || secondaryText || photo)) return;

    const children = [];
    if (photo) {
      const figure = el('figure', 'about__photo');
      figure.append(image(photo));
      children.push(figure);
    }
    if (intro) children.push(...paragraphs(intro, 'about__intro'));
    if (mainText) children.push(...paragraphs(mainText));
    if (secondaryText) children.push(...paragraphs(secondaryText, 'about__secondary'));
    aside.classList.replace('placeholder', 'about__text');
    aside.replaceChildren(...children);
  }

  // Handwritten aside: letters are «written» one by one when the block first
  // appears (CSS: .special.is-visible .special__letter). Screen readers get the
  // plain sentence; words never break across lines.
  function handwritten(text, className) {
    const node = el('p', className);
    const letters = el('span', `${className}-ink`);
    letters.setAttribute('aria-hidden', 'true');
    let index = 0;
    text.split(' ').forEach((word, wordIndex) => {
      if (wordIndex) letters.append(' ');
      const wordNode = el('span', `${className}-word`);
      [...word].forEach((char) => {
        const letter = el('span', 'special__letter', char);
        letter.style.setProperty('--i', index++);
        wordNode.append(letter);
      });
      letters.append(wordNode);
    });
    node.append(el('span', 'visually-hidden', text), letters);
    return node;
  }

  function renderExpertise(expertise) {
    if (!expertise) return;

    const intro = document.querySelector('[data-expertise-intro]');
    if (intro) {
      intro.textContent = expertise.intro ? nbsp(expertise.intro) : '';
      intro.hidden = !expertise.intro;
    }

    const list = document.querySelector('[data-expertise-list]');
    if (list) {
      list.replaceChildren(...expertise.items.map((item, index) => {
        const li = el('li', 'expertise__item');
        li.append(
          el('span', 'expertise__index', item.number || pad(index + 1)),
          el('h3', 'expertise__title', item.title),
          el('p', 'expertise__text', item.description)
        );
        return li;
      }));
      reveal(list.children, { step: 60 });
    }

    const special = document.querySelector('[data-expertise-special]');
    if (special && expertise.special) {
      const { label, title, description, note } = expertise.special;
      special.replaceChildren(
        el('p', 'special__label', label),
        el('h3', 'special__title', title),
        el('p', 'special__text', description)
      );
      if (note) special.append(handwritten(note, 'special__note'));
      special.hidden = false;
      reveal([special]);
    }
  }

  // Steps light up one by one as they cross the middle of the viewport.
  function renderApproach(steps) {
    const list = document.querySelector('[data-approach-list]');
    if (!list || !steps) return;

    const items = steps.map((step, index) => {
      const li = el('li', 'approach__step');
      li.style.setProperty('--step', index);
      li.append(el('span', 'approach__index', step.number || pad(index + 1)), el('span', 'approach__title', step.title));
      if (step.text) li.append(...paragraphs(step.text, 'approach__text'));
      return li;
    });
    list.replaceChildren(...items);
    list.setAttribute('data-interactive', '');

    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.6;
      let current = -1;
      items.forEach((item, index) => {
        if (item.getBoundingClientRect().top < line) current = index;
      });
      items.forEach((item, index) => {
        item.classList.toggle('is-lit', index <= current);
        item.classList.toggle('is-current', index === current);
      });
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
  }

  async function renderSiteContent() {
    const site = await VM.api.getSite();
    if (!site) return;
    renderContacts(site.contacts);
    renderHero(site.hero);
    renderAbout(site.about);
    renderExpertise(site.expertise);
    renderApproach(site.approach);
  }

  /* ---- Cases ---- */

  function caseMedia(item) {
    const media = el('div', 'case-card__media');
    const cover = item.images && (item.images.cover || item.images.hero);
    if (cover) {
      media.append(image(cover));
    } else {
      const placeholder = el('div', 'case-card__placeholder');
      placeholder.setAttribute('aria-hidden', 'true');
      placeholder.append(
        el('span', 'case-card__initial', item.industry.charAt(0)),
        el('span', 'case-card__placeholder-label', 'Визуал кейса')
      );
      media.append(placeholder);
    }
    return media;
  }

  function caseCard(item, index) {
    const isPublished = item.status === 'published';
    const card = el(isPublished ? 'a' : 'article', 'case-card');
    card.dataset.status = isPublished ? 'published' : 'draft';
    if (isPublished) card.href = `pages/cases/case.html?slug=${encodeURIComponent(item.slug)}`;

    const top = el('div', 'case-card__top');
    top.append(el('span', 'case-card__index', pad(index + 1)), el('span', 'case-card__category', item.category));

    const body = el('div', 'case-card__body');
    body.append(top, el('h3', 'case-card__title', item.title || item.industry));
    // Once a title is set, the industry moves into the caption.
    const caption = [item.title && item.industry, item.subtitle].filter(Boolean).join(' · ');
    if (caption) body.append(el('p', 'case-card__caption', caption));
    body.append(el('p', 'case-card__status', isPublished ? 'Смотреть кейс →' : 'Кейс готовится к публикации'));

    card.append(caseMedia(item), body);
    return card;
  }

  async function renderCases() {
    const root = document.querySelector('[data-cases-list]');
    if (!root) return;
    const cases = await VM.api.getCases();
    root.replaceChildren(...cases.map(caseCard));
    reveal(root.children, { step: 80 });
  }

  /* ---- Reviews ---- */

  function review(item) {
    const figure = el('figure', 'review');
    const mark = el('span', 'review__mark', '“');
    mark.setAttribute('aria-hidden', 'true');
    figure.append(mark, el('blockquote', 'review__text', item.text));

    const author = el('figcaption', 'review__author');
    if (item.photo) author.append(image(item.photo, 'review__photo'));
    const who = el('span', 'review__who');
    who.append(el('span', 'review__name', item.author));
    const position = [item.position, item.company].filter(Boolean).join(', ');
    if (position) who.append(el('span', 'review__position', position));
    if (item.source) {
      const source = el(item.source.url ? 'a' : 'span', 'review__source', item.source.label);
      if (item.source.url) {
        source.href = item.source.url;
        source.target = '_blank';
        source.rel = 'noopener';
      }
      who.append(source);
    }
    author.append(who);
    figure.append(author);
    return figure;
  }

  async function renderReviews() {
    const root = document.querySelector('[data-reviews-list]');
    if (!root) return;
    const reviews = await VM.api.getReviews();
    if (!reviews.length) return; // keep the placeholder from the markup
    root.replaceChildren(...reviews.map(review));
    reveal(root.children, { step: 80 });
  }

  /* ---- Lead form ---- */

  const leadValidators = {
    name: (value) => (value ? '' : 'Укажите имя'),
    phone: (value) => {
      if (!value) return 'Укажите телефон';
      const digits = value.replace(/\D/g, '');
      return digits.length >= 10 && digits.length <= 15 ? '' : 'Проверьте номер телефона';
    },
    message: (value) => (value ? '' : 'Опишите задачу')
  };

  function initLeadForm() {
    const form = document.querySelector('[data-contact-form]');
    if (!form) return;
    const status = form.querySelector('[data-form-status]');
    const submit = form.querySelector('[type="submit"]');

    const validateField = (input) => {
      const error = leadValidators[input.name](input.value.trim());
      input.setAttribute('aria-invalid', String(Boolean(error)));
      form.querySelector(`[data-field-error="${input.name}"]`).textContent = error;
      return !error;
    };

    const fields = Object.keys(leadValidators).map((name) => form.elements[name]);
    fields.forEach((input) => {
      input.addEventListener('blur', () => {
        if (input.value) validateField(input);
      });
      input.addEventListener('input', () => {
        if (input.getAttribute('aria-invalid') === 'true') validateField(input);
      });
    });

    let sending = false;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (sending) return; // one action → one request, even on a double click or Enter
      const invalid = fields.filter((input) => !validateField(input));
      if (invalid.length) {
        invalid[0].focus();
        return;
      }

      if (!VM.config.features.leadForm) {
        status.textContent = 'Онлайн-отправка заявок скоро заработает. Пока быстрее всего написать в Telegram — контакты рядом';
        return;
      }

      const lead = Object.fromEntries(fields.map((input) => [input.name, input.value.trim()]));
      sending = true;
      submit.disabled = true;
      form.setAttribute('aria-busy', 'true');
      status.textContent = 'Отправляем…';
      try {
        await VM.api.submitLead(lead);
        form.reset();
        fields.forEach((input) => input.removeAttribute('aria-invalid'));
        status.textContent = 'Спасибо! Сообщение отправлено';
      } catch (error) {
        console.warn('Lead submission failed:', error.message);
        status.textContent = 'Не удалось отправить сообщение. Попробуйте ещё раз или свяжитесь со мной напрямую';
      } finally {
        sending = false;
        submit.disabled = false;
        form.removeAttribute('aria-busy');
      }
    });
  }

  function setCurrentYear() {
    document.querySelectorAll('[data-current-year]').forEach((node) => {
      node.textContent = String(new Date().getFullYear());
    });
  }

  initScrollStart();
  initInPageLinks();
  initHeader();
  initNav();
  setCurrentYear();
  initLeadForm();
  reveal(document.querySelectorAll('[data-reveal]'));
  renderSiteContent();
  renderCases();
  renderReviews();
  initSectionIndicator();
})(window.VM);
