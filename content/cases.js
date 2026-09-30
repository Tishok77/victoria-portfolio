/*
 * Cases. Only the known directions are filled in; all case copy, results,
 * metrics and visuals will come from the client — never invent them.
 * Rendered by renderCases() in js/main.js (cards) and js/case-detail.js (page).
 *
 * Case shape:
 *   slug                  string   URL id: pages/cases/case.html?slug=<slug>
 *   order                 number   position in the list
 *   status                'draft' | 'published'   drafts are listed but not linked
 *   category              'B2B' | 'B2C'
 *   industry              string   отрасль; card heading until `title` is set
 *   title                 string | null   заголовок кейса
 *   subtitle              string | null   направление / короткая подпись
 *   client                string | null   клиент (только с согласия клиента)
 *   period                string | null   период, например «2022–2023»
 *   duration              string | null   длительность, например «8 месяцев»
 *   context               Text | null     контекст
 *   task                  Text | null     задача
 *   personalContribution  Text | null     что сделала Виктория лично
 *   solution              Text | null     решение
 *   implementation        Text | null     реализация
 *   result                Text | null     результат
 *   metrics               Array<{ value, label }>   подтверждённые цифры, например { value: '+40%', label: 'заявок' }
 *   images                { cover: Image | null, hero: Image | null }
 *                           cover — карточка на главной (4:3), hero — верх страницы кейса
 *   gallery               Array<Image & { caption? }>   визуальные материалы
 *   tags                  string[]
 *
 * Text  = string | string[] (one string per paragraph).
 * Image = { src, alt }; src is relative to the site root:
 *         assets/images/cases/<slug>/cover.jpg
 */
window.VM = window.VM || {};
window.VM.content = window.VM.content || {};

window.VM.content.cases = [
  {
    slug: 'auto-dealers',
    order: 1,
    status: 'draft',
    category: 'B2C',
    industry: 'Автосалоны',
    title: null,
    subtitle: 'Параллельный импорт',
    client: null,
    period: null,
    duration: null,
    context: null,
    task: null,
    personalContribution: null,
    solution: null,
    implementation: null,
    result: null,
    metrics: [],
    images: { cover: null, hero: null },
    gallery: [],
    tags: []
  },
  {
    slug: 'logistics',
    order: 2,
    status: 'draft',
    category: 'B2B',
    industry: 'Логистика',
    title: null,
    subtitle: 'Международные перевозки',
    client: null,
    period: null,
    duration: null,
    context: null,
    task: null,
    personalContribution: null,
    solution: null,
    implementation: null,
    result: null,
    metrics: [],
    images: { cover: null, hero: null },
    gallery: [],
    tags: []
  },
  {
    slug: 'fuel-additives',
    order: 3,
    status: 'draft',
    category: 'B2B',
    industry: 'Топливные присадки',
    title: null,
    subtitle: 'Нефтехимия',
    client: null,
    period: null,
    duration: null,
    context: null,
    task: null,
    personalContribution: null,
    solution: null,
    implementation: null,
    result: null,
    metrics: [],
    images: { cover: null, hero: null },
    gallery: [],
    tags: []
  },
  {
    slug: 'kids-fashion',
    order: 4,
    status: 'draft',
    category: 'B2C',
    industry: 'Fashion',
    title: null,
    subtitle: 'Детская одежда',
    client: null,
    period: null,
    duration: null,
    context: null,
    task: null,
    personalContribution: null,
    solution: null,
    implementation: null,
    result: null,
    metrics: [],
    images: { cover: null, hero: null },
    gallery: [],
    tags: []
  }
];
