const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');

const app = express();
const PORT = 3002;
const DEV_PORT = 3000;

const buildDir = path.join(__dirname, '..', 'build');

app.use('/images', express.static(path.join(buildDir, 'images')));
app.use('/favicon.ico', express.static(path.join(buildDir, 'favicon.ico')));

app.use('/static/js', (req, res) => {
  const jsFile = path.basename(req.path);
  const devUrl = `http://localhost:${DEV_PORT}/static/js/bundle.js`;
  
  http.get(devUrl, (proxyRes) => {
    res.set({
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache'
    });
    res.status(proxyRes.statusCode);
    proxyRes.pipe(res);
  }).on('error', (err) => {
    console.error(`Proxy error: ${err.message}`);
    res.status(500).send('Proxy error');
  });
});

app.use('/static/css', express.static(path.join(buildDir, 'static', 'css')));

app.get('/', (req, res) => {
  const indexHtml = fs.readFileSync(path.join(buildDir, 'index.html'), 'utf8');
  const modifiedHtml = indexHtml
    .replace(`/static/js/main.`, `http://localhost:${PORT}/static/js/`)
    .replace(`/static/css/main.`, `http://localhost:${PORT}/static/css/`);
  res.send(modifiedHtml);
});

app.get('/recipe/:id/', (req, res) => {
  const recipePath = path.join(buildDir, 'recipe', req.params.id, 'index.html');
  if (fs.existsSync(recipePath)) {
    let recipeHtml = fs.readFileSync(recipePath, 'utf8');
    recipeHtml = recipeHtml
      .replace(`/static/js/main.`, `http://localhost:${PORT}/static/js/`)
      .replace(`/static/css/main.`, `http://localhost:${PORT}/static/css/`);
    res.send(recipeHtml);
  } else {
    res.redirect('/');
  }
});

app.listen(PORT, () => {
  console.log('\n🔍 Debug de Hidratación');
  console.log('========================');
  console.log(`Dev server debe estar en puerto ${DEV_PORT}`);
  console.log(`Abrí: http://localhost:${PORT}`);
  console.log('');
  console.log('Ahora usa el bundle.js del dev server (NO minificado)');
  console.log('');
});