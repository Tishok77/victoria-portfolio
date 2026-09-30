/*
 * Runtime configuration. Public values only — secrets (AI keys, SMTP, admin
 * credentials) belong on the server, see server/README.md.
 */
window.VM = window.VM || {};

window.VM.config = {
  api: {
    // Same origin as the site: the backend serves both / and /api (server/app/main.py).
    baseUrl: '/api'
  },
  features: {
    // Lead form posts to POST /api/leads. false = validate only, suggest Telegram.
    leadForm: true,
    // Future AI assistant, mounted into [data-assistant-root].
    assistant: false
  }
};
