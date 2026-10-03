export async function onRequest(context) {
  const bucket = context.env.AG2C_ARCHIVES;
  if (!bucket) {
    return new Response("Error: R2 storage bucket mapping ('AG2C_ARCHIVES') missing in settings.", { status: 500 });
  }
  const url = new URL(context.request.url);
  const targetedFile = url.searchParams.get('file');
  if (targetedFile) {
    const fileObject = await bucket.get(targetedFile);
    if (!fileObject) {
      return new Response("Requested archive item not found.", { status: 404 });
    }
    return new Response(fileObject.body, {
      headers: {
        "Content-Type": fileObject.httpMetadata?.contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${targetedFile}"`
      }
    });
  }
  const fileList = await bucket.list();
  let htmlOutput = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Index of /archives/</title>
      <style>
          body { font-family: monospace; background-color: #ffffff; color: #000000; padding: 30px; font-size: 15px; line-height: 1.5; }
          h1 { font-size: 1.6em; margin-bottom: 5px; }
          hr { border: 0; border-top: 1px solid #ddd; margin: 15px 0; }
          pre { background: #fafafa; padding: 15px; border: 1px solid #eaeaea; border-radius: 4px; overflow-x: auto; }
          a { color: #0066cc; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .footer-info { font-size: 0.9em; color: #777; margin-top: 15px; }
      </style>
  </head>
  <body>
  <h1>Index of /archives/</h1>
  <a href="../">../ (Up to parent directory)</a>
  <hr>
  <pre>
  .
  `;
  if (fileList.objects.length === 0) {
    htmlOutput += `└── (No files uploaded to the archive yet)`;
  } else {
    fileList.objects.forEach((file, index) => {
      const isLast = index === fileList.objects.length - 1;
      const treeBranch = isLast ? '└── ' : '├── ';
      htmlOutput += `${treeBranch}<a href="/archives?file=${encodeURIComponent(file.key)}">${file.key}</a>\n`;
    });
  }
  htmlOutput += `
  </pre>
  <hr>
  <div class="footer-info">Cloudflare Pages Serverless Engine</div>
  </body>
  </html>
  `;
  return new Response(htmlOutput, {
    headers: { "Content-Type": "text/html;charset=UTF-8" }
  });
}
