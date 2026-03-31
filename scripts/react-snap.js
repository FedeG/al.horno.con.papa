const { run } = require('react-snap');
const routes = require('../src/data/routes.json');

run({
  source: 'build',
  destination: 'build',
  fallback: 'index.html',
  include: routes,
  puppeteerArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
}).then(() => {
  console.log('react-snap terminado');
}).catch(console.error);
