/*
 * Site-wide editable content. Kept out of the markup so a future admin panel /
 * CMS can own it; js/api.js is the only reader, js/main.js renders it.
 * index.html keeps the same hero copy as a no-JS / SEO fallback — this file wins.
 *
 * Only facts confirmed by the client belong here — never invent them.
 *
 * Text  = string | string[] (one string per paragraph).
 * Image = { src, alt }; src is relative to the site root (assets/images/...).
 *
 *   contacts            { email, telegram, phone, phoneE164 }
 *   hero.name           string   split into two lines at the first space
 *   hero.role           string   «A / B» — B never breaks inside
 *   hero.headline       string
 *   hero.headlineAccent string | null   word from the headline underlined by hand
 *   hero.tagline        string | null   caption under the portrait
 *   hero.facts          string[]
 *   hero.ctaPrimary     { label, href }
 *   hero.ctaSecondary   { label, href }
 *   hero.portrait       Image | null    vertical 4:5, e.g. assets/images/portrait.jpg
 *   about.statement     string[]        big typographic line, joined with spaces; the last part is italic
 *   about.intro         Text | null     короткий вводный текст
 *   about.mainText      Text | null     основной текст
 *   about.secondaryText Text | null     дополнительный текст (необязательно)
 *   about.photo         Image | null    e.g. assets/images/about.jpg
 *   expertise.intro     string | null   lead-in line above the list
 *   expertise.items     Array<{ number, title, description }>
 *   expertise.special   { label, title, description, note } | null   separate block;
 *                       note — handwritten aside, «written» on first view
 *   approach            Array<{ number, title, text }>   text: Text | null (pending)
 */
window.VM = window.VM || {};
window.VM.content = window.VM.content || {};

window.VM.content.site = {
  contacts: {
    email: 'Mylnikova.Viktoria.job@yandex.ru',
    telegram: 'vi_myl',
    phone: '8-916-030-45-43',
    phoneE164: '+79160304543'
  },

  hero: {
    name: 'Виктория Мыльникова',
    role: 'Креативный маркетолог / Marketing Director',
    headline: 'Придумываю маркетинг, который хочется заметить — и который работает на бизнес',
    headlineAccent: 'заметить',
    tagline: 'Маркетинг без скучных решений.',
    facts: [
      '15+ лет в маркетинге',
      'B2B и B2C',
      'Стратегия → креатив → реализация → результат',
      'Управление командами и подрядчиками'
    ],
    ctaPrimary: { label: 'Обсудить задачу', href: '#contact' },
    ctaSecondary: { label: 'Смотреть кейсы', href: '#cases' },
    portrait: null
  },

  about: {
    // Joined with spaces: «От бизнес-задачи — к идее, от идеи — к результату.»
    statement: ['От бизнес-задачи —', 'к идее,', 'от идеи —', 'к результату.'],
    intro: null,
    mainText: null,
    secondaryText: null,
    photo: null
  },

  expertise: {
    intro: 'Маркетинг работает сильнее, когда стратегия, креатив и реализация смотрят в одну сторону.',
    items: [
      {
        number: '01',
        title: 'Креативный маркетинг',
        description: 'Идеи, которые не просто красиво выглядят, а решают бизнес-задачи.'
      },
      {
        number: '02',
        title: 'Продвижение и развитие бренда',
        description: 'Позиционирование, стратегия, коммуникации, узнаваемость и рост.'
      },
      {
        number: '03',
        title: 'Маркетинговый консалтинг',
        description: 'Аудит, стратегия, поиск точек роста, антикризисные решения, маркетинговая система.'
      },
      {
        number: '04',
        title: 'PR и коммуникации',
        description: 'Репутация, инфоповоды, СМИ, мероприятия, личный бренд, внешние и внутренние коммуникации.'
      },
      {
        number: '05',
        title: 'Управление маркетингом',
        description: 'Команда, подрядчики, бюджеты, процессы, KPI и реализация стратегии.'
      },
      {
        number: '06',
        title: 'Обучение и наставничество',
        description: 'Практический маркетинг для команд, специалистов, предпринимателей и студентов.'
      }
    ],
    special: {
      label: 'Отдельное направление',
      title: 'Креативные спецпроекты',
      description: 'Мероприятия, нестандартные рекламные кампании, коллаборации, визуальные концепции, спецпроекты.',
      note: 'Иногда лучший маркетинговый инструмент — это идея, которой до тебя никто не додумался'
    }
  },

  approach: [
    { number: '01', title: 'Проблема', text: null },
    { number: '02', title: 'Идея', text: null },
    { number: '03', title: 'Люди', text: null },
    { number: '04', title: 'Реализация', text: null },
    { number: '05', title: 'Результат', text: null }
  ]
};
