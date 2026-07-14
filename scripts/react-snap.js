const { run } = require('react-snap');
const routes = require('../src/data/routes.json');

console.log(`📸 React-snap: pre-renderizando ${routes.length} rutas...`);

run({
  source: 'build',
  destination: 'build',
  fallback: 'index.html',
  include: routes,
  puppeteerArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
}).then(() => {
  console.log('✅ React-snap completado exitosamente.');
}).catch(err => {
  // Puppeteer 1.x puede crashear con Chromium nuevo (Navigation failed, etc.)
  // pero las páginas que alcanzó a pre-renderizar ya están guardadas.
  // No rompemos el build por esto — Googlebot ya renderiza JS.
  console.warn('⚠️ React-snap no completó todas las rutas (parcial ok):', err.message);
  console.warn('   Las páginas pre-renderizadas hasta el error ya están en build/.');
});
