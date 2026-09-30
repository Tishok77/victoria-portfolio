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
 */
window.VM = window.VM || {};
window.VM.content = window.VM.content || {};

window.VM.content.reviews = [];
