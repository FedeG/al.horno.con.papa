const { run } = require('react-snap');
const routes = require('../src/data/routes.json');

run({
  source: 'build',
  destination: 'build',
  fallback: 'index.html',
  include: routes,
  puppeteerArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
}).then(() => {
  console.log('✅ React-snap completado exitosamente.');
}).catch(err => {
  console.error('❌ Error durante la ejecución de react-snap:', err);
  process.exit(1);
});
