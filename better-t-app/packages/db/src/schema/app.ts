import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

import { user } from "./auth";

// ─── category ──────────────────────────────────────────────────────────────
export const category = sqliteTable("category", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  emoji: text("emoji").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
});

// ─── sport ──────────────────────────────────────────────────────────────────
export const sport = sqliteTable(
  "sport",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    nameEn: text("name_en"),
    description: text("description").notNull(),
    rules: text("rules"),
    history: text("history"),
    originCountry: text("origin_country"),
    foundedYear: integer("founded_year"),
    playerCount: text("player_count"),
    difficulty: integer("difficulty"), // 1〜5
    categoryId: text("category_id")
      .notNull()
      .references(() => category.id),
    imageUrl: text("image_url"),
    videoUrl: text("video_url"),
    viewCount: integer("view_count").notNull().default(0),
    status: text("status", { enum: ["pending", "published", "rejected"] })
      .notNull()
      .default("pending"),
    submittedById: text("submitted_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    rejectionReason: text("rejection_reason"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("sport_category_id_idx").on(table.categoryId),
    index("sport_status_idx").on(table.status),
    index("sport_submitted_by_idx").on(table.submittedById),
    index("sport_view_count_idx").on(table.viewCount),
  ],
);

// ─── sport_tag ──────────────────────────────────────────────────────────────
export const sportTag = sqliteTable(
  "sport_tag",
  {
    id: text("id").primaryKey(),
    sportId: text("sport_id")
      .notNull()
      .references(() => sport.id, { onDelete: "cascade" }),
    tag: text("tag").notNull(),
  },
  (table) => [
    index("sport_tag_sport_id_idx").on(table.sportId),
    index("sport_tag_tag_idx").on(table.tag),
  ],
);

// ─── favorite ───────────────────────────────────────────────────────────────
export const favorite = sqliteTable(
  "favorite",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    sportId: text("sport_id")
      .notNull()
      .references(() => sport.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    unique("favorite_user_sport_unique").on(table.userId, table.sportId),
    index("favorite_user_id_idx").on(table.userId),
    index("favorite_sport_id_idx").on(table.sportId),
  ],
);

// ─── pickup ─────────────────────────────────────────────────────────────────
export const pickup = sqliteTable("pickup", {
  id: text("id").primaryKey(),
  mainSportId: text("main_sport_id")
    .notNull()
    .references(() => sport.id),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});

// ─── pickup_side_card ────────────────────────────────────────────────────────
export const pickupSideCard = sqliteTable("pickup_side_card", {
  id: text("id").primaryKey(),
  pickupId: text("pickup_id")
    .notNull()
    .references(() => pickup.id, { onDelete: "cascade" }),
  sportId: text("sport_id")
    .notNull()
    .references(() => sport.id),
  label: text("label", { enum: ["注目", "急上昇", "新着"] }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

// ─── Relations ──────────────────────────────────────────────────────────────
export const categoryRelations = relations(category, ({ many }) => ({
  sports: many(sport),
}));

export const sportRelations = relations(sport, ({ one, many }) => ({
  category: one(category, {
    fields: [sport.categoryId],
    references: [category.id],
  }),
  submittedBy: one(user, {
    fields: [sport.submittedById],
    references: [user.id],
  }),
  tags: many(sportTag),
  favorites: many(favorite),
  pickups: many(pickup, { relationName: "mainSport" }),
  pickupSideCards: many(pickupSideCard),
}));

export const sportTagRelations = relations(sportTag, ({ one }) => ({
  sport: one(sport, {
    fields: [sportTag.sportId],
    references: [sport.id],
  }),
}));

export const favoriteRelations = relations(favorite, ({ one }) => ({
  user: one(user, {
    fields: [favorite.userId],
    references: [user.id],
  }),
  sport: one(sport, {
    fields: [favorite.sportId],
    references: [sport.id],
  }),
}));

export const pickupRelations = relations(pickup, ({ one, many }) => ({
  mainSport: one(sport, {
    fields: [pickup.mainSportId],
    references: [sport.id],
    relationName: "mainSport",
  }),
  createdBy: one(user, {
    fields: [pickup.createdById],
    references: [user.id],
  }),
  sideCards: many(pickupSideCard),
}));

export const pickupSideCardRelations = relations(pickupSideCard, ({ one }) => ({
  pickup: one(pickup, {
    fields: [pickupSideCard.pickupId],
    references: [pickup.id],
  }),
  sport: one(sport, {
    fields: [pickupSideCard.sportId],
    references: [sport.id],
  }),
}));
