import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/* ---------------- Categories ---------------- */
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  sort: integer("sort").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/* ---------------- Products ---------------- */
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  img: text("img").notNull().default("/images/placeholder.png"),
  price: integer("price").notNull().default(0),
  popular: integer("popular", { mode: "boolean" }).notNull().default(false),
  hidden: integer("hidden", { mode: "boolean" }).notNull().default(false),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  descAr: text("desc_ar").notNull().default(""),
  descEn: text("desc_en").notNull().default(""),
  sort: integer("sort").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/* ---------------- Settings (business info, key/value) ---------------- */
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
});

/* ---------------- Orders (saved when user checks out) ---------------- */
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  items: text("items").notNull(), // JSON string
  total: integer("total").notNull().default(0),
  note: text("note").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export * from "./auth-schema";
