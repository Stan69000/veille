import type { FastifyPluginAsync } from 'fastify';

function renderShell(title: string, body: string, extraScript = ''): string {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      :root {
        --bg: #f4f6f8;
        --card: #ffffff;
        --ink: #111827;
        --muted: #6b7280;
        --line: #d1d5db;
        --brand: #0f766e;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Avenir Next", "Segoe UI", sans-serif;
        color: var(--ink);
        background: radial-gradient(1200px 600px at 20% -20%, #dbeafe 0%, transparent 60%), var(--bg);
      }
      .wrap { max-width: 980px; margin: 0 auto; padding: 24px; }
      .top { display: flex; gap: 12px; align-items: center; justify-content: space-between; margin-bottom: 18px; }
      .brand { color: var(--ink); text-decoration: none; font-weight: 800; letter-spacing: .2px; }
      .sub { color: var(--muted); margin: 0 0 24px; }
      .themes { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
      .theme {
        display: inline-flex; align-items: center; gap: 6px;
        border: 1px solid var(--line); border-radius: 999px; padding: 7px 12px;
        text-decoration: none; color: var(--ink); background: #fff;
      }
      .cards { display: grid; gap: 12px; }
      .card {
        background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 16px;
      }
      .card h3 { margin: 0 0 8px; font-size: 20px; }
      .card p { margin: 0 0 10px; color: var(--muted); line-height: 1.5; }
      .meta { color: var(--muted); font-size: 13px; }
      .link { color: var(--brand); text-decoration: none; font-weight: 600; }
      .empty { color: var(--muted); padding: 28px; text-align: center; border: 1px dashed var(--line); border-radius: 12px; }
    </style>
  </head>
  <body>
    <div class="wrap">${body}</div>
    ${extraScript}
  </body>
</html>`;
}

export const siteRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (_request, reply) => {
    const html = renderShell(
      'Veille Platform · Actualités',
      `
        <header class="top">
          <a href="/" class="brand">Veille Platform</a>
          <a href="/docs" class="link">API Docs</a>
        </header>
        <p class="sub">Actualités publiées, triées par thèmes.</p>
        <div id="themes" class="themes"></div>
        <section id="news" class="cards"></section>
      `,
      `
      <script>
        (async () => {
          const [themesRes, newsRes] = await Promise.all([
            fetch('/api/v1/themes?limit=12'),
            fetch('/api/v1/news?limit=20')
          ]);
          const themes = (await themesRes.json()).data || [];
          const news = (await newsRes.json()).data || [];

          document.getElementById('themes').innerHTML = themes
            .map((t) => '<a class="theme" href="/actu/' + encodeURIComponent(t.slug) + '">' + t.label + ' · ' + t.count + '</a>')
            .join('');

          document.getElementById('news').innerHTML = news.length
            ? news.map((n) =>
                '<article class="card">' +
                  '<h3><a class="link" href="/news/' + encodeURIComponent(n.slug) + '">' + n.title + '</a></h3>' +
                  '<p>' + (n.summary || 'Sans résumé.') + '</p>' +
                  '<div class="meta">' + (n.publishedAt ? new Date(n.publishedAt).toLocaleString('fr-FR') : 'Date inconnue') + '</div>' +
                '</article>'
              ).join('')
            : '<div class="empty">Aucune actualité publiée.</div>';
        })();
      </script>
      `
    );
    reply.type('text/html; charset=utf-8').send(html);
  });

  app.get('/actu/:theme', async (request, reply) => {
    const theme = (request.params as { theme: string }).theme;
    const html = renderShell(
      `Actu ${theme}`,
      `
        <header class="top">
          <a href="/" class="brand">Veille Platform</a>
          <a href="/" class="link">← Tous les thèmes</a>
        </header>
        <h1>Actu ${theme}</h1>
        <p class="sub">Page thématique alimentée par l’API publique.</p>
        <section id="news" class="cards"></section>
      `,
      `
      <script>
        (async () => {
          const theme = ${JSON.stringify(theme)};
          const res = await fetch('/api/v1/news?theme=' + encodeURIComponent(theme) + '&limit=40');
          const payload = await res.json();
          const news = payload.data || [];

          document.getElementById('news').innerHTML = news.length
            ? news.map((n) =>
                '<article class="card">' +
                  '<h3><a class="link" href="/news/' + encodeURIComponent(n.slug) + '">' + n.title + '</a></h3>' +
                  '<p>' + (n.summary || 'Sans résumé.') + '</p>' +
                  '<div class="meta">' + (n.publishedAt ? new Date(n.publishedAt).toLocaleString('fr-FR') : 'Date inconnue') + '</div>' +
                '</article>'
              ).join('')
            : '<div class="empty">Aucune news pour ce thème.</div>';
        })();
      </script>
      `
    );
    reply.type('text/html; charset=utf-8').send(html);
  });

  app.get('/news/:slug', async (request, reply) => {
    const slug = (request.params as { slug: string }).slug;
    const html = renderShell(
      'Actualité',
      `
        <header class="top">
          <a href="/" class="brand">Veille Platform</a>
          <a href="javascript:history.back()" class="link">← Retour</a>
        </header>
        <article class="card">
          <h1 id="title">Chargement...</h1>
          <p id="summary" class="sub"></p>
          <div id="meta" class="meta"></div>
          <div id="content"></div>
        </article>
      `,
      `
      <script>
        (async () => {
          const slug = ${JSON.stringify(slug)};
          const res = await fetch('/api/v1/news/' + encodeURIComponent(slug));
          const payload = await res.json();
          if (!payload.success) {
            document.getElementById('title').innerText = 'News introuvable';
            return;
          }
          const data = payload.data;
          document.getElementById('title').innerText = data.title;
          document.getElementById('summary').innerText = data.summary || '';
          document.getElementById('meta').innerText = data.publishedAt ? new Date(data.publishedAt).toLocaleString('fr-FR') : '';
          document.getElementById('content').innerHTML = data.content
            ? '<p>' + data.content.replace(/\\n/g, '</p><p>') + '</p>'
            : '<p class="sub">Contenu détaillé non disponible.</p>';
        })();
      </script>
      `
    );
    reply.type('text/html; charset=utf-8').send(html);
  });
};
