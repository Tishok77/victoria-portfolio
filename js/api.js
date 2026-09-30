/*
 * Data access layer. Every page reads content only through these functions.
 * Today they read the static files in content/; once the backend and admin
 * panel exist, their bodies switch to fetch() calls with the same signatures,
 * and the rendering code stays untouched.
 */
window.VM = window.VM || {};

(function (VM) {
  'use strict';

  const byOrder = (a, b) => a.order - b.order;
  const content = () => VM.content || {};

  VM.api = {
    async getSite() {
      return content().site || null;
    },

    async getCases() {
      return (content().cases || []).slice().sort(byOrder);
    },

    async getCase(slug) {
      return (content().cases || []).find((item) => item.slug === slug) || null;
    },

    async getReviews() {
      return (content().reviews || []).filter((item) => item.published).sort(byOrder);
    },

    /* lead: { name, phone, message } → POST {baseUrl}/leads */
    async submitLead(lead) {
      const response = await fetch(`${VM.config.api.baseUrl}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
      });
      if (!response.ok) throw new Error(`Lead submission failed: ${response.status}`);
      return response.json();
    }
  };
})(window.VM);
