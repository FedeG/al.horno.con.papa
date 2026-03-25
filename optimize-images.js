const sharp = require('sharp');
const { globSync } = require('glob'); // Usamos la versión sincrónica para que sea más simple
const path = require('path');

// Buscamos las imágenes
const files = globSync("public/images/**/*.{jpg,png,jpeg}");

files.forEach(file => {
  const extension = path.extname(file);
  const out = file.replace(extension, ".webp");
  
  sharp(file)
    .webp({ quality: 80 })
    .toFile(out)
    .then(() => console.log(`✅ Convertida: ${out}`))
    .catch(err => console.error(`❌ Error en ${file}:`, err));
});

