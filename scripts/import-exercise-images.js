// Import de imágenes de ejercicios desde FreeExerciseDB (Unlicense, dominio público).
// Baja la primera imagen de cada ejercicio mapeado a public/exercises/<slug>.jpg
// y deja en la DB la ruta local via scripts/update-exercise-images.sql (SQL manual, sin auto-run).
const fs = require("fs");
const path = require("path");
const https = require("https");

const datasetPath = path.join(__dirname, "_fexdb.json");
const outDir = path.join(__dirname, "..", "public", "exercises");

// id de la DB -> nombre EXACTO en el dataset FreeExerciseDB
const MAP = {
  1: "Barbell Squat",
  2: "Leg Press",
  3: "Hack Squat",
  4: "Barbell Deadlift",
  5: "Barbell Bench Press - Medium Grip",
  6: "Incline Dumbbell Press",
  7: "Standing Military Press",
  8: "Side Lateral Raise",
  9: "Bent Over Barbell Row",
  10: "Chin-Up",
  11: "Wide-Grip Lat Pulldown",
  12: "Face Pull",
  13: "Barbell Curl",
  14: "Hammer Curls",
  15: "Triceps Pushdown",
  16: "Parallel Bar Dip",
  17: "Dumbbell Lunges",
  18: "Standing Dumbbell Calf Raise",
  19: "Plank",
  20: "Ab Roller",
  22: "Leg Extensions",
  23: "Lying Leg Curls",
  24: "Barbell Hip Thrust",
  25: "Romanian Deadlift",
  26: "Dumbbell Flyes",
  27: "Barbell Incline Bench Press - Medium Grip",
  28: "Seated Dumbbell Press",
  29: "Front Dumbbell Raise",
  30: "One-Arm Dumbbell Row",
  31: "EZ-Bar Skullcrusher",
};

fs.mkdirSync(outDir, { recursive: true });
const data = JSON.parse(fs.readFileSync(datasetPath, "utf8"));
const byName = new Map(data.map((e) => [e.name.toLowerCase(), e]));

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode} para ${url}`));
        }
        const ws = fs.createWriteStream(dest);
        res.pipe(ws);
        ws.on("finish", () => ws.close(resolve));
        ws.on("error", reject);
      })
      .on("error", reject);
  });
}

const rows = Object.entries(MAP)
  .map(([id, name]) => {
    const ex = byName.get(name.toLowerCase());
    if (!ex || !ex.images?.length) {
      console.log(`-- sin imagen en dataset: id ${id} "${name}"`);
      return null;
    }
    return { id: Number(id), name, imagePath: ex.images[0] };
  })
  .filter(Boolean);

const slug = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

(async () => {
  const updates = [];
  const base = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";
  for (const row of rows) {
    const fileName = `${slug(row.name)}.jpg`;
    const dest = path.join(outDir, fileName);
    try {
      await download(base + row.imagePath, dest);
      updates.push(`update public.exercises set image_url = '/exercises/${fileName}' where id = ${row.id};`);
      console.log(`ok  id ${row.id} "${row.name}" -> ${fileName}`);
    } catch (err) {
      console.log(`ERR id ${row.id} "${row.name}": ${err.message}`);
    }
  }
  const sqlPath = path.join(__dirname, "update-exercise-images.sql");
  fs.writeFileSync(sqlPath, `-- Generado por import-exercise-images.js (${new Date().toISOString()})\n` + updates.join("\n") + "\n");
  console.log(`\nSQL de updates: ${updates.length} líneas -> ${sqlPath}`);
})();