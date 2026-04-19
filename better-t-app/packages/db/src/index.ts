import { env } from "@better-t-app/env/server";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import * as schema from "./schema";

const client = createClient({
  url: env.DATABASE_URL,
});

export const db = drizzle({ client, schema });

export async function runMigrations() {
  // MIGRATIONS_FOLDER 環境変数があれば優先（本番Docker環境）、なければソースの隣のフォルダを使用
  const migrationsFolder =
    process.env.MIGRATIONS_FOLDER ??
    resolve(fileURLToPath(import.meta.url), "../../migrations");

  console.log(`🗃️  Running migrations from: ${migrationsFolder}`);
  await migrate(db, { migrationsFolder });
  console.log("✅ Migrations completed");
}

export async function runSeed() {
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

  const SPORTS = [
    { id: "sport_001", name: "チェスボクシング", nameEn: "Chess Boxing", description: "チェスとボクシングを交互に行うハイブリッドスポーツ。知力と体力の両方が求められる究極の競技。", rules: "チェスのラウンドとボクシングのラウンドを交互に繰り返す。チェスでの詰み、またはボクシングでのKOで勝利。", history: "2003年にオランダのアーティスト、Iepe Rubingh によって考案された。", originCountry: "オランダ", foundedYear: 2003, playerCount: "1対1", difficulty: 5, categoryId: "cat_6", status: "published" as const, viewCount: 120 },
    { id: "sport_002", name: "ボッチャ", nameEn: "Boccia", description: "ヨーロッパ発祥のパラリンピック正式種目。ジャックボールに向かってボールを投げ、最も近づいた方が勝ち。", rules: "白いジャックボールに向かって赤・青のボールを投げる。より近くに集めた側が得点を獲得。", history: "古代ギリシャ・ローマの遊びに起源を持ち、現代のルールはヨーロッパで発展した。", originCountry: "ヨーロッパ", foundedYear: 1984, playerCount: "1対1、または団体", difficulty: 2, categoryId: "cat_7", status: "published" as const, viewCount: 95 },
    { id: "sport_003", name: "カバディ", nameEn: "Kabaddi", description: "南アジア発祥の伝統的な接触スポーツ。息を止めながら「カバディ」と唱えつつ相手陣地に侵入し、タッチして戻る。", rules: "レイダーが相手陣地に侵入し「カバディ」と繰り返し唱えながら相手にタッチして戻れば得点。捕まえれば守備側が得点。", history: "4000年以上の歴史を持つインド発祥の競技。アジア競技大会の正式種目。", originCountry: "インド", foundedYear: -2000, playerCount: "7対7", difficulty: 4, categoryId: "cat_8", status: "published" as const, viewCount: 200 },
    { id: "sport_004", name: "フィンスイミング", nameEn: "Finswimming", description: "モノフィンまたはバイフィンを装着して行う競泳。通常の競泳よりも高速で泳ぐことができる。", rules: "プールや海洋でのタイムレース。水面、水中、アプネア（息こらえ）など複数の種目がある。", history: "1950年代にヨーロッパで発展し、現在は世界選手権が開催されている。", originCountry: "イタリア", foundedYear: 1954, playerCount: "個人", difficulty: 4, categoryId: "cat_2", status: "published" as const, viewCount: 78 },
    { id: "sport_005", name: "ポロ", nameEn: "Polo", description: "馬に乗りながらマレットでボールを打ち合うチームスポーツ。世界最古のチームスポーツの一つ。", rules: "馬上からマレットでボールをゴールに打ち込む。試合はチャッカーと呼ばれる7分間のピリオドで構成。", history: "紀元前6世紀のペルシャに起源を持ち、英国を経由して世界に広まった。", originCountry: "ペルシャ（現イラン）", foundedYear: -600, playerCount: "4対4", difficulty: 5, categoryId: "cat_5", status: "published" as const, viewCount: 150 },
    { id: "sport_006", name: "クリケット", nameEn: "Cricket", description: "イギリス発祥のバットとボールを使う球技。世界で2番目に人気のあるスポーツとも言われる。", rules: "バッティングチームが得点（ラン）を積み重ね、ボウリングチームがアウトを取り合う。", history: "16世紀にイングランドで発祥し、大英帝国の拡大とともに世界各地へ広まった。", originCountry: "イギリス", foundedYear: 1550, playerCount: "11対11", difficulty: 3, categoryId: "cat_8", status: "published" as const, viewCount: 310 },
    { id: "sport_007", name: "アーチェリー", nameEn: "Archery", description: "弓を使って矢を射り、的の中心に当てることを競うスポーツ。オリンピックの正式種目。", rules: "70m先の的（直径122cm）を射る。10点ゾーンへの命中が最高得点。", history: "狩猟・戦争の手段として数千年の歴史を持ち、近代オリンピックの初期から採用されている。", originCountry: "古代", foundedYear: -10000, playerCount: "個人または団体", difficulty: 3, categoryId: "cat_4", status: "published" as const, viewCount: 180 },
    { id: "sport_008", name: "ムエタイ", nameEn: "Muay Thai", description: "タイ発祥の格闘技。両手・両足・両肘・両膝の8つの武器を使うことから「八肢の芸術」とも呼ばれる。", rules: "パンチ、キック、肘打ち、膝蹴りによって得点を獲得。KOまたは判定で勝敗を決する。", history: "タイの国技として数百年の歴史を持つ。近年はMMAの普及とともに世界的に人気が高まっている。", originCountry: "タイ", foundedYear: 1560, playerCount: "1対1", difficulty: 5, categoryId: "cat_1", status: "published" as const, viewCount: 420 },
    { id: "sport_009", name: "オリエンテーリング", nameEn: "Orienteering", description: "地図とコンパスを使って山野を走り、コントロールポイントを正確に回るタイムレース。", rules: "地図上の指定されたコントロールポイントを順番に通過し、最短時間でゴールを目指す。", history: "19世紀末のノルウェーで軍の訓練として始まり、1960年代に国際的なスポーツとして発展。", originCountry: "ノルウェー", foundedYear: 1897, playerCount: "個人または団体", difficulty: 4, categoryId: "cat_3", status: "published" as const, viewCount: 65 },
    { id: "sport_010", name: "バスク・ペロタ", nameEn: "Basque Pelota", description: "スペイン・バスク地方発祥の壁打ちボール競技。素手や道具でボールを壁に打ち返し合う。", rules: "フロントン（競技場）の壁に向かってボールを打ち合う。相手が返球できなければ得点。", history: "バスク地方に数百年前から伝わる伝統競技で、多くのバリエーションが存在する。", originCountry: "スペイン", foundedYear: 1700, playerCount: "1対1、または2対2", difficulty: 4, categoryId: "cat_8", status: "published" as const, viewCount: 45 },
  ];

  const SPORT_TAGS: { sportId: string; tags: string[] }[] = [
    { sportId: "sport_001", tags: ["頭脳", "格闘", "ハイブリッド"] },
    { sportId: "sport_002", tags: ["パラリンピック", "団体", "精度"] },
    { sportId: "sport_003", tags: ["伝統", "接触", "アジア"] },
    { sportId: "sport_004", tags: ["水泳", "スピード", "フィン"] },
    { sportId: "sport_005", tags: ["馬術", "チーム", "伝統"] },
    { sportId: "sport_006", tags: ["球技", "チーム", "英国"] },
    { sportId: "sport_007", tags: ["精度", "オリンピック", "弓"] },
    { sportId: "sport_008", tags: ["格闘", "タイ", "打撃"] },
    { sportId: "sport_009", tags: ["アウトドア", "ナビゲーション", "走"] },
    { sportId: "sport_010", tags: ["伝統", "壁打ち", "バスク"] },
  ];

  console.log("🌱 Seeding categories...");
  for (const cat of CATEGORIES) {
    await db.insert(schema.category).values(cat).onConflictDoNothing();
  }
  console.log(`✅ Inserted ${CATEGORIES.length} categories`);

  console.log("🌱 Seeding sports...");
  for (const s of SPORTS) {
    await db.insert(schema.sport).values(s).onConflictDoNothing();
  }
  console.log(`✅ Inserted ${SPORTS.length} sports`);

  console.log("🌱 Seeding sport tags...");
  for (const { sportId, tags } of SPORT_TAGS) {
    for (const tag of tags) {
      await db
        .insert(schema.sportTag)
        .values({ id: crypto.randomUUID().replace(/-/g, "").slice(0, 24), sportId, tag })
        .onConflictDoNothing();
    }
  }
  console.log("✅ Inserted sport tags");
}
