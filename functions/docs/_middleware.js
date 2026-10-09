export async function onRequest(context) {
  const kvStore = context.env.AG2C_DOCS_BINDING;
  if (!kvStore) {
    return new Response("Error: KV storage binding ('AG2C_DOCS_BINDING') missing in settings.", { status: 500 });
  }
  const url = new URL(context.request.url);
  const targetedFile = url.searchParams.get('file');
  if (targetedFile) {
    const base64Data = await kvStore.get(targetedFile);
    if (!base64Data) {
      return new Response("Requested documentation not found.", { status: 404 });
    }
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Response(byteArray, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${targetedFile}"`
      }
    });
  }
  const fileList = await kvStore.list();
  let htmlOutput = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AG2C Developers Documentation</title>
      <style>
          :root {
            --bg: #060e14;
            --card-bg: rgba(12, 23, 34, 0.75);
            --card-border: rgba(6, 182, 212, 0.15);
            --text-main: #f0f9ff;
            --text-muted: #7dd3fc;
            --accent-1: #06b6d4;
            --accent-2: #3b82f6;
            --accent-gradient: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
            --glow: rgba(6, 182, 212, 0.18);
            --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            --font-mono: 'JetBrains Mono', monospace;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: var(--bg);
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(6, 182, 212, 0.25);
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: var(--accent-1);
          }
          body {
            font-family: var(--font-sans);
            background-color: var(--bg);
            color: var(--text-main);
            line-height: 1.6;
            min-height: 100vh;
            overflow-x: hidden;
            position: relative;
            background-image: 
              radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.08) 0%, transparent 70%),
              linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
            background-size: 100% 100%, 40px 40px, 40px 40px;
          }
          .bg-glow-1, .bg-glow-2 {
            position: absolute;
            width: 450px;
            height: 450px;
            border-radius: 50%;
            filter: blur(140px);
            z-index: -1;
            opacity: 0.35;
            animation: float 12s ease-in-out infinite alternate;
          }
          .bg-glow-1 {
            background: var(--accent-1);
            top: -120px;
            left: -100px;
          }
          .bg-glow-2 {
            background: var(--accent-2);
            top: 400px;
            right: -100px;
            animation-delay: -6s;
          }
          @keyframes float {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(40px, 60px) scale(1.15); }
          }
          .container {
            max-width: 960px;
            margin: 0 auto;
            padding: 3.5rem 1.5rem;
          }
          .glass {
            background: var(--card-bg);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid var(--card-border);
            border-radius: 20px;
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
            padding: 2.5rem;
          }
          h1 {
            font-size: 2.2rem;
            font-weight: 800;
            letter-spacing: -0.03em;
            background: var(--accent-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.6rem;
          }
          h1::before {
            content: '>';
            font-family: var(--font-mono);
            color: var(--accent-1);
            font-weight: 700;
            -webkit-text-fill-color: var(--accent-1);
          }
          hr {
            border: 0;
            border-top: 1px solid var(--card-border);
            margin: 20px 0;
          }
          pre {
            font-family: var(--font-mono);
            font-size: 1rem;
            background: rgba(6, 182, 212, 0.02);
            padding: 20px;
            border-radius: 12px;
            border: 1px solid rgba(6, 182, 212, 0.08);
            overflow-x: auto;
            color: var(--text-main);
          }
          a {
            color: var(--text-muted);
            text-decoration: none;
            transition: all 0.2s ease;
          }
          a:hover {
            color: var(--text-main);
            text-shadow: 0 0 10px var(--accent-1);
          }
          .parent-link {
            font-family: var(--font-mono);
            font-size: 0.9rem;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
            color: var(--text-muted);
          }
          .footer-info {
            font-family: var(--font-mono);
            font-size: 0.8rem;
            color: rgba(125, 211, 252, 0.4);
            margin-top: 20px;
            text-align: right;
          }
      </style>
  </head>
  <body>
      <div class="bg-glow-1"></div>
      <div class="bg-glow-2"></div>
      <div class="container">
          <div class="glass">
              <h1>Documentations</h1>
              <a href="../" class="parent-link"> Back to website.</a>
              <hr>
              <pre>.
`;
  if (fileList.keys.length === 0) {
    htmlOutput += `└── (No docs made yet. Come back later on!)`;
  } else {
    fileList.keys.forEach((file, index) => {
      const isLast = index === fileList.keys.length - 1;
      const treeBranch = isLast ? '└── ' : '├── ';
      htmlOutput += `${treeBranch}<a href="/docs?file=${encodeURIComponent(file.name)}">${file.name}</a>\n`;
    });
  }
  htmlOutput += `</pre>
              <hr>
              <div class="footer-info">Cloudflare Pages Free Serverless KV Engine</div>
          </div>
      </div>
  </body>
  </html>
  `;
  return new Response(htmlOutput, {
    headers: { "Content-Type": "text/html;charset=UTF-8" }
  });
}
