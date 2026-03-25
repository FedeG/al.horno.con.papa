const sharp = require('sharp');
const { globSync } = require('glob');
const path = require('path');
const fs = require('fs');

// Buscamos las imágenes
const files = globSync("public/images/**/*.{jpg,png,jpeg}");

const conversions = files.map(file => {
  const extension = path.extname(file);
  const out = file.replace(extension, ".webp");

  // Verificar si el archivo WebP ya existe
  if (fs.existsSync(out)) {
    console.log(`⏭️  Ya existe: ${out}`);
    return Promise.resolve();
  }

  return sharp(file)
    .webp({ quality: 80 })
    .toFile(out)
    .then(() => {
      console.log(`✅ Convertida: ${out}`);
    })
    .catch(err => {
      console.error(`❌ Error en ${file}:`, err);
      throw err;
    });
});

Promise.all(conversions)
  .catch(() => {
    // Al menos una conversión falló: marcar el proceso como fallido
    process.exitCode = 1;
  });
