// tools/pickExercises.cjs
const fs = require("fs");

const raw = JSON.parse(
  fs.readFileSync("convex/external-exercises.json", "utf8")
);

function mapMuscle(m) {
  const x = m.toLowerCase();
  if (x.includes("chest") || x.includes("pector")) return "chest";
  if (x.includes("back") || x.includes("lat") || x.includes("trap")) return "back";
  if (x.includes("leg") || x.includes("glute") || x.includes("thigh") || x.includes("calf"))
    return "legs";
  if (x.includes("shoulder") || x.includes("deltoid")) return "shoulders";
  if (x.includes("arm") || x.includes("bicep") || x.includes("tricep") || x.includes("forearm"))
    return "arms";
  if (x.includes("waist") || x.includes("abdom") || x.includes("core"))
    return "core";
  return null;
}

const buckets = {
  chest: [],
  back: [],
  legs: [],
  shoulders: [],
  arms: [],
  core: [],
};

for (const ex of raw) {
  const m = ex.primaryMuscles && ex.primaryMuscles[0];
  if (!m) continue;
  const bucket = mapMuscle(m);
  if (!bucket) continue;
  if (buckets[bucket].length < 20) {
    buckets[bucket].push(ex);
  }
}

const picked = [];
for (const key of Object.keys(buckets)) {
  picked.push(...buckets[key].slice(0, 10));
}

console.log("Picked:", picked.length, "exercises");
fs.writeFileSync(
  "convex/picked-exercises.json",
  JSON.stringify(picked, null, 2)
);
