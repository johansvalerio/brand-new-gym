// Descarga las ~22 imágenes faltantes de foods desde Wikimedia Commons (dominio público/CC)
// Uso: node scripts/download-food-images.mjs
import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "foods");
fs.mkdirSync(outDir, { recursive: true });

const slug = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// 22 nuevos alimentos -> query Wikimedia + fallback Unsplash via redirects
const FOODS = [
  { name: "Salmón", queries: ["Salmon fillet raw", "Salmon food"] },
  { name: "Tilapia", queries: ["Tilapia fish fillet", "Tilapia"] },
  { name: "Camarones", queries: ["Shrimp cooked food", "Camarones"] },
  { name: "Lomo de cerdo", queries: ["Pork loin raw", "Lomo de cerdo"] },
  { name: "Bistec de res", queries: ["Beef steak raw", "Bistec"] },
  { name: "Tortilla de maíz", queries: ["Corn tortilla", "Tortilla de maíz"] },
  { name: "Pan integral", queries: ["Whole wheat bread", "Pan integral"] },
  { name: "Queso fresco", queries: ["Fresh cheese queso fresco", "Queso fresco"] },
  { name: "Leche entera", queries: ["Glass of milk", "Leche entera"] },
  { name: "Claras de huevo", queries: ["Egg whites in bowl", "Claras de huevo"] },
  { name: "Quinoa cocida", queries: ["Cooked quinoa bowl", "Quinoa cocida"] },
  { name: "Frijoles negros", queries: ["Cooked black beans bowl", "Frijoles negros"] },
  { name: "Garbanzos cocidos", queries: ["Cooked chickpeas bowl", "Garbanzos cocidos"] },
  { name: "Batata", queries: ["Sweet potato", "Batata"] },
  { name: "Espinaca", queries: ["Fresh spinach leaves", "Espinaca"] },
  { name: "Manzana", queries: ["Red apple", "Manzana"] },
  { name: "Naranja", queries: ["Orange fruit", "Naranja"] },
  { name: "Fresas", queries: ["Fresh strawberries", "Fresas"] },
  { name: "Maní sin sal", queries: ["Peanuts unsalted", "Mani"] },
  { name: "Aceite de oliva", queries: ["Olive oil bottle", "Aceite de oliva"] },
  { name: "Nueces", queries: ["Walnuts", "Nueces"] },
  { name: "Proteína whey", queries: ["Whey protein powder scoop", "Proteina whey"] },
];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "gym-app/1.0" } }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on("error", reject);
  });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { "User-Agent": "gym-app/1.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close(); fs.unlinkSync(dest);
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error(`HTTP ${res.statusCode} ${url}`)); }
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
      file.on("error", reject);
    }).on("error", reject);
  });
}

async function wikimediaImageUrl(query) {
  const api = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url&iiurlwidth=600&format=json&origin=*`;
  const json = await fetchJson(api);
  const pages = json?.query?.pages;
  if (!pages) return null;
  for (const p of Object.values(pages)) {
    const info = p.imageinfo?.[0];
    const url = info?.thumburl || info?.url;
    if (url && /\.(jpe?g|png|webp)$/i.test(url)) return url;
    if (url) return url;
  }
  return null;
}

for (const food of FOODS) {
  const fileName = `${slug(food.name)}.jpg`;
  const dest = path.join(outDir, fileName);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) {
    console.log(`skip existe ${fileName} (${fs.statSync(dest).size} bytes)`);
    continue;
  }
  let url = null;
  for (const q of food.queries) {
    try { url = await wikimediaImageUrl(q); if (url) { console.log(`  wikimedia "${q}" -> ${url.slice(0,80)}...`); break; } } catch {}
  }
  if (!url) {
    // fallback: picsum con seed para no dejar hueco (placeholder determinístico)
    url = `https://picsum.photos/seed/${encodeURIComponent(slug(food.name))}/600/600`;
    console.log(`  fallback picsum para ${food.name}`);
  }
  try {
    await download(url, dest);
    console.log(`ok ${food.name} -> ${fileName} (${fs.statSync(dest).size} bytes)`);
  } catch (e) {
    console.log(`ERR ${food.name}: ${e.message}`);
    // segundo fallback picsum
    try { await download(`https://picsum.photos/seed/${encodeURIComponent(slug(food.name))}/600/600`, dest); console.log(`  picsum ok ${fileName}`); } catch {}
  }
}
console.log("descarga terminada");
