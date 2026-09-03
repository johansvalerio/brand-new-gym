// Import de imágenes de alimentos: fotos en public/foods/<slug>.jpg (Unsplash/Wikimedia, licencia libre)
// Este script ESM genera el SQL update para apuntar foods.image_url a la ruta local
// Uso: node scripts/import-food-images.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const foodsDir = path.join(__dirname, "..", "public", "foods");

const files = fs.readdirSync(foodsDir).filter((f) => f.endsWith(".jpg"));

const fix = {
  brocoli: "Brocoli",
  "carne-molida-90": "Carne molida 90%",
  "arroz-blanco-cocido": "Arroz blanco cocido",
  "atun-en-agua": "Atún en agua",
  "pollo-pechuga": "Pollo pechuga",
  "yogur-natural": "Yogur natural",
  "lentejas-cocidas": "Lentejas cocidas",
  // 22 nuevos
  salmon: "Salmón",
  tilapia: "Tilapia",
  camarones: "Camarones",
  "lomo-de-cerdo": "Lomo de cerdo",
  "bistec-de-res": "Bistec de res",
  "tortilla-de-maiz": "Tortilla de maíz",
  "pan-integral": "Pan integral",
  "queso-fresco": "Queso fresco",
  "leche-entera": "Leche entera",
  "claras-de-huevo": "Claras de huevo",
  "quinoa-cocida": "Quinoa cocida",
  "frijoles-negros": "Frijoles negros",
  "garbanzos-cocidos": "Garbanzos cocidos",
  batata: "Batata",
  espinaca: "Espinaca",
  manzana: "Manzana",
  naranja: "Naranja",
  fresas: "Fresas",
  "mani-sin-sal": "Maní sin sal",
  "aceite-de-oliva": "Aceite de oliva",
  nueces: "Nueces",
  "proteina-whey": "Proteína whey",
};

const simple = `-- Generado por import-food-images.mjs (${new Date().toISOString()})
${files
  .map((file) => {
    const slugKey = file.replace(/\.jpg$/, "");
    const dbName = fix[slugKey] ?? slugKey.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
    // fallback title-case para slugs no mapeados
    const finalName = fix[slugKey] ? dbName : dbName.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    return `update public.foods set image_url = '/foods/${file}' where name = '${finalName.replace(/'/g, "''")}';`;
  })
  .join("\n")}
`;

const out = path.join(__dirname, "update-food-images.sql");
fs.writeFileSync(out, simple);
console.log(`SQL generado: ${files.length} updates -> ${out}`);
files.forEach((f) => console.log(" ok", f));
