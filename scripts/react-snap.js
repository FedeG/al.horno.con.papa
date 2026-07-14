const { run } = require('react-snap');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const routes = require('../src/data/routes.json');

// ─── Chrome setup for headless environments (Cloudflare Pages) ───
// Puppeteer 1.x bundled Chromium (2019) needs X11 libraries that don't
// exist on Cloudflare. We download a modern Chrome (headless, no X11).

const CHROME_DIR = '/opt/buildhome/.chrome';
const CHROME_BIN = path.join(CHROME_DIR, 'chrome-linux64', 'chrome');

async function ensureChrome() {
  // 1. Already set via env var
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return true;
  }

  // 2. Cached from previous build
  if (fs.existsSync(CHROME_BIN)) {
    console.log(`🔍 Chrome (cacheado) en: ${CHROME_BIN}`);
    process.env.PUPPETEER_EXECUTABLE_PATH = CHROME_BIN;
    return true;
  }

  // 3. System Chrome (unlikely in Cloudflare, but check)
  const systemPaths = [
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/opt/google/chrome/chrome',
  ];
  for (const cp of systemPaths) {
    if (fs.existsSync(cp)) {
      console.log(`🔍 Chrome (sistema) en: ${cp}`);
      process.env.PUPPETEER_EXECUTABLE_PATH = cp;
      return true;
    }
  }

  // 4. Download Chrome for Testing (headless, no X11 needed, Chrome 120+)
  console.log('📥 Descargando Chrome headless para Cloudflare Pages...');
  fs.mkdirSync(CHROME_DIR, { recursive: true });

  try {
    const jsonUrl = 'https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json';
    const resp = await fetch(jsonUrl);
    const data = await resp.json();
    const version = data.channels.Stable.version;
    const dl = data.channels.Stable.downloads.chrome?.find(d => d.platform === 'linux64');

    if (!dl) throw new Error('No linux64 download found');
    console.log(`   Versión: ${version}`);

    const zipPath = path.join(CHROME_DIR, 'chrome.zip');
    const zipResp = await fetch(dl.url);
    const buf = Buffer.from(await zipResp.arrayBuffer());
    fs.writeFileSync(zipPath, buf);

    console.log('   Extrayendo...');
    execSync(`unzip -o -q "${zipPath}" -d "${CHROME_DIR}"`, { stdio: 'pipe' });
    fs.unlinkSync(zipPath);
    fs.chmodSync(CHROME_BIN, 0o755);

    if (!fs.existsSync(CHROME_BIN)) throw new Error('Chrome binary not found after extraction');
    console.log(`✅ Chrome listo en: ${CHROME_BIN}`);
    process.env.PUPPETEER_EXECUTABLE_PATH = CHROME_BIN;
    return true;
  } catch (err) {
    console.warn('⚠️ No se pudo instalar Chrome headless:', err.message);
    return false;
  }
}

// ─── Main ───
console.log(`📸 React-snap: pre-renderizando ${routes.length} rutas...`);

(async () => {
  const chromeOk = await ensureChrome();

  const puppeteerArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--headless=new',
  ];

  try {
    await run({
      source: 'build',
      destination: 'build',
      fallback: 'index.html',
      include: routes,
      puppeteerArgs,
      minifyHtml: false,
    });
    console.log('✅ React-snap completado exitosamente.');
  } catch (err) {
    console.warn('⚠️ React-snap no completó todas las rutas (parcial ok):', err.message);
    console.warn('   Las páginas pre-renderizadas hasta el error ya están en build/.');
  }
})();
