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

  // Hand-drawn emerald stroke under the headline accent (.mark in the CSS).
  function markStroke() {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'mark__stroke');
    svg.setAttribute('viewBox', '0 0 200 14');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', 'M3 10C46 4.5 104 3 197 7');
    path.setAttribute('pathLength', '1');
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
        el('span', index === last ? 'about__word about__word--accent' : 'about__word', word));
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

  function renderExpertise(expertise) {
    if (!expertise) return;

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
      const { label, title, description } = expertise.special;
      special.replaceChildren(
        el('p', 'special__label', label),
        el('h3', 'special__title', title),
        el('p', 'special__text', description)
      );
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
        status.textContent = 'Онлайн-отправка заявок скоро заработает. Пока быстрее всего написать в Telegram — контакты рядом.';
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
        status.textContent = 'Спасибо! Сообщение отправлено.';
      } catch (error) {
        console.warn('Lead submission failed:', error.message);
        status.textContent = 'Не удалось отправить сообщение. Попробуйте ещё раз или свяжитесь со мной напрямую.';
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

  initHeader();
  initNav();
  setCurrentYear();
  initLeadForm();
  reveal(document.querySelectorAll('[data-reveal]'));
  renderSiteContent();
  renderCases();
  renderReviews();
})(window.VM);
