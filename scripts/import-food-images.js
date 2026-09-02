// Import de imágenes de alimentos: las fotos YA viven en public/foods/<slug>.jpg
// (bajadas de Unsplash, licencia libre uso comercial). Este script solo genera
// el SQL update para apuntar foods.image_url a la ruta local — mismo patrón
// que import-exercise-images.js
const fs = require("fs");
const path = require("path");

const foodsDir = path.join(__dirname, "..", "public", "foods");

const slug = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Lee los archivos que existen de verdad en public/foods
const files = fs.readdirSync(foodsDir).filter((f) => f.endsWith(".jpg"));

// Versión simple y portable: un UPDATE por nombre del seed
const simple = `-- Generado por import-food-images.js (${new Date().toISOString()})
${files
  .map((file) => {
    // traducimos slug -> nombre original del seed
    const n = file.replace(/\.jpg$/, "").replace(/-/g, " ");
    // casos especiales de capitalización del seed
    const fix = { "brocoli": "Brocoli", "carne molida 90": "Carne molida 90%", "arroz blanco cocido": "Arroz blanco cocido", "atun en agua": "Atún en agua", "pollo pechuga": "Pollo pechuga", "yogur natural": "Yogur natural", "lentejas cocidas": "Lentejas cocidas" };
    const dbName = fix[n] ?? n.charAt(0).toUpperCase() + n.slice(1);
    return `update public.foods set image_url = '/foods/${file}' where name = '${dbName}';`;
  })
  .join("\n")}
`;

const out = path.join(__dirname, "update-food-images.sql");
fs.writeFileSync(out, simple);
console.log(`SQL generado: ${files.length} updates -> ${out}`);
files.forEach((f) => console.log(" ok", f));
