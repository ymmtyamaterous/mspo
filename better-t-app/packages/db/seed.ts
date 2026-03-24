import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./src/schema";

const client = createClient({
  url: process.env.DATABASE_URL || "file:../../local.db",
});

const db = drizzle({ client, schema });

const CATEGORIES = [
  { id: "cat_1", name: "格闘系", emoji: "⚔️", description: "武道・格闘技", sortOrder: 1 },
  { id: "cat_2", name: "水上・水中", emoji: "🌊", description: "水泳・ボート・潜水", sortOrder: 2 },
  { id: "cat_3", name: "アウトドア", emoji: "🏔️", description: "山岳・自然・野外", sortOrder: 3 },
  { id: "cat_4", name: "的当て・投擲", emoji: "🎯", description: "アーチェリー・ダーツ", sortOrder: 4 },
  { id: "cat_5", name: "動物・乗馬", emoji: "🐎", description: "馬術・動物競技", sortOrder: 5 },
  { id: "cat_6", name: "頭脳×身体", emoji: "🧠", description: "チェスボクシング等", sortOrder: 6 },
  { id: "cat_7", name: "パラスポーツ", emoji: "♿", description: "全ての人のために", sortOrder: 7 },
  { id: "cat_8", name: "民族・伝統", emoji: "🌏", description: "各地の伝統競技", sortOrder: 8 },
];

async function seed() {
  console.log("🌱 Seeding categories...");
  for (const cat of CATEGORIES) {
    await db
      .insert(schema.category)
      .values(cat)
      .onConflictDoNothing();
  }
  console.log(`✅ Inserted ${CATEGORIES.length} categories`);
}

seed()
  .then(() => {
    console.log("✅ Seed completed");
    process.exit(0);
  })
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  });
