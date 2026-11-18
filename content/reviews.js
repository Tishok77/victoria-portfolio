/*
 * Reviews. Empty until the client provides real ones — never invent them.
 * Rendered by renderReviews() in js/main.js; only `published: true` items show.
 *
 * Review shape:
 *   id         string
 *   order      number
 *   published  boolean
 *   text       string
 *   author     string                  имя автора
 *   position   string | null           должность
 *   company    string | null           компания
 *   photo      { src, alt } | null     фото: assets/images/reviews/<id>.jpg
 *   source     { label, url } | null   источник отзыва; url может быть null
 *   date       string | null           дата из предоставленного материала
 */
window.VM = window.VM || {};
window.VM.content = window.VM.content || {};

window.VM.content.reviews = [
  {
    id: 'oliver-berger',
    order: 1,
    published: true,
    text: 'Victoria has an eye for detail, she is very reliable and brings projects to a conclusion.',
    author: 'Oliver Berger',
    position: 'Equity Partner',
    company: 'Witena Executive Search',
    photo: null,
    date: '18 декабря 2013 г.'
  },
  {
    id: 'fedor-tokarev',
    order: 2,
    published: true,
    text: 'Мне посчастливилось работать с Викторией в компании Kuehne + Nagel в морском подразделении, где Виктория вела document processing и проявила себя как настоящий труженик, с энтузиазмом, профессиональным подходом к делу и поддержкой в коллективе хорошего, положительного настроения.',
    author: 'Fedor Tokarev',
    position: 'National Sea Logistics Intermodal Manager',
    company: 'Russia and CIS cluster · Kuehne + Nagel',
    photo: null,
    date: '5 мая 2015 г.'
  },
  {
    id: 'hendrik-wehlen',
    order: 3,
    published: true,
    text: 'Mrs. Mylnikova is always performing her tasks to my fullest satisfaction, with great vigor and commitment. I have to know and appreciate her as an independently thinking, responsible and always reliable colleague.\n\nMrs. Mylnikova enjoys an excellent reputation among her colleagues and customers to this day. Her numerous constructive proposals for solution of problems were always useful. In addition to the professional qualifications, Mrs. Mylnikova is characterized by optimism, friendliness and team spirit.\n\nKind Regards,\nHendrik Wehlen',
    author: 'Hendrik Wehlen',
    position: null,
    company: null,
    photo: null,
    date: '22 марта 2019 г.'
  },
  {
    id: 'martin-fuchs',
    order: 4,
    published: true,
    text: 'Victoria is great to work with! She’s fun, super enthusiastic and she has a great deal of knowledge on marketing. She is also taking very good care of her team and she is a role model with regards to work ethic and reliability.',
    author: 'Martin Fuchs',
    position: 'Managing Director',
    company: 'IEC Inter Expo Consult GmbH',
    photo: null,
    date: '30 апреля 2020 г.'
  },
  {
    id: 'carsten-pottharst',
    order: 5,
    published: true,
    text: 'Viktoria is one of those people you have to like right from the first meeting. Open, imaginative and enthusiastic. We worked together for InterRail and it was always a pleasure to get things done with her. Never a „this is not possible“ and always a very charming way of communication. Creativity and style are also to of her absolute highlight. All the best to you Viktoria.',
    author: 'Carsten Pottharst',
    position: 'Logistik in allen Facetten',
    company: null,
    photo: null,
    date: '31 декабря 2022 г.'
  },
  {
    id: 'rizwan-safdar',
    order: 6,
    published: true,
    text: 'I had the pleasure to work with Viktoria in 2016/17 while I was at Militzer & Munch. She is professional, knowledgeable, dependable, and highly motivated to achieve consolidated success for the department and the organization. She is someone I could trust and count on to prepare necessary marketing material for important exhibitions and conferences worldwide. I have been asked to represent our company at a major conference in the middle east on very short notice but thanks to Viktoria’s dedication we manage to present and deliver our company business message to all the business partners and participants in the conference. I highly recommend Viktoria for her professional credentials and positive business attitude',
    author: 'Rizwan Safdar',
    position: 'Global Logistics, Procurement, Customer Services, Category Management and E2E Supply Chain',
    company: null,
    photo: null,
    date: '13 января 2023 г.'
  },
  {
    id: 'ghazal-esmaili',
    order: 7,
    published: true,
    text: 'I worked with Viktoria when I was preparing to present our group in an exhibition and she was assigned from the local team to assist me. The scope of work was from design of the booth remotely a month ahead to showcasing and hosting at the exhibition for 4days. Viktoria is very thorough and plans everything ahead and she goes the extra mile without hesitation. She is extremely pleasant to work with. She is ready to revise design and documents 10 times over and she does it with a smile. She is creative and always ready to throw in new ideas or accept ideas from others. She was resourceful and a problem-solver throughout the process of planning, designing and execution of the booth and during the event as well. She was the first to arrive and last to leave and she made it her mission to check that everything was perfect day-in day-out for the length of the exhibition. In short I can say that after few days of working together remotely; I could trust her 100% and be sure that the part assigned to her will be done immaculately, she made our life easy and made our exhibit a success!',
    author: 'Ghazal Esmaili',
    position: 'Air Cargo & Multimodal Logistics Leader | Global Key Accounts | Commercial Strategy',
    company: null,
    photo: null,
    date: '8 июля 2023 г.'
  }
];
