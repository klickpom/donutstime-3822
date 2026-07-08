import { Hono } from "hono";
import { cors } from "hono/cors";
import { eq, asc } from "drizzle-orm";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { db } from "./database";
import * as schema from "./database/schema";
import { auth } from "./auth";
import { authMiddleware, requireAuth } from "./middleware/auth";
import { s3 } from "./lib/s3";

type Variables = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

const app = new Hono<{ Variables: Variables }>()
  .use(
    cors({
      origin: (origin) => origin ?? "*",
      credentials: true,
      exposeHeaders: ["set-auth-token"],
    }),
  )
  .on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw))
  .basePath("api")
  .use("*", authMiddleware)
  .get("/health", (c) => c.json({ status: "ok" }, 200))

  /* ---------------- Public: products ---------------- */
  .get("/products", async (c) => {
    const rows = await db
      .select()
      .from(schema.products)
      .orderBy(asc(schema.products.sort), asc(schema.products.id));
    return c.json({ products: rows }, 200);
  })

  /* ---------------- Public: categories ---------------- */
  .get("/categories", async (c) => {
    const rows = await db
      .select()
      .from(schema.categories)
      .orderBy(asc(schema.categories.sort), asc(schema.categories.id));
    return c.json({ categories: rows }, 200);
  })

  /* ---------------- Public: settings ---------------- */
  .get("/settings", async (c) => {
    const rows = await db.select().from(schema.settings);
    const settings: Record<string, string> = {};
    for (const r of rows) settings[r.key] = r.value;
    return c.json({ settings }, 200);
  })

  /* ---------------- Public: save order ---------------- */
  .post("/orders", async (c) => {
    const body = await c.req.json();
    const [order] = await db
      .insert(schema.orders)
      .values({
        items: JSON.stringify(body.items ?? []),
        total: body.total ?? 0,
        note: body.note ?? "",
      })
      .returning();
    return c.json({ order }, 201);
  })

  /* ---------------- Admin: who am I ---------------- */
  .get("/admin/me", requireAuth, (c) => {
    return c.json({ user: c.get("user") }, 200);
  })

  /* ---------------- Admin: list orders ---------------- */
  .get("/admin/orders", requireAuth, async (c) => {
    const rows = await db
      .select()
      .from(schema.orders)
      .orderBy(asc(schema.orders.id));
    return c.json({ orders: rows.reverse() }, 200);
  })

  /* ---------------- Admin: create product ---------------- */
  .post("/admin/products", requireAuth, async (c) => {
    const b = await c.req.json();
    const slug =
      b.slug?.trim() ||
      `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const [product] = await db
      .insert(schema.products)
      .values({
        slug,
        category: b.category ?? "minicakes",
        img: b.img || "/images/placeholder.png",
        price: Number(b.price) || 0,
        popular: !!b.popular,
        hidden: !!b.hidden,
        nameAr: b.nameAr ?? "",
        nameEn: b.nameEn ?? "",
        descAr: b.descAr ?? "",
        descEn: b.descEn ?? "",
        sort: Number(b.sort) || 0,
      })
      .returning();
    return c.json({ product }, 201);
  })

  /* ---------------- Admin: update product ---------------- */
  .put("/admin/products/:id", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    const b = await c.req.json();
    const patch: Record<string, unknown> = {};
    if (b.category !== undefined) patch.category = b.category;
    if (b.img !== undefined) patch.img = b.img;
    if (b.price !== undefined) patch.price = Number(b.price) || 0;
    if (b.popular !== undefined) patch.popular = !!b.popular;
    if (b.hidden !== undefined) patch.hidden = !!b.hidden;
    if (b.nameAr !== undefined) patch.nameAr = b.nameAr;
    if (b.nameEn !== undefined) patch.nameEn = b.nameEn;
    if (b.descAr !== undefined) patch.descAr = b.descAr;
    if (b.descEn !== undefined) patch.descEn = b.descEn;
    if (b.sort !== undefined) patch.sort = Number(b.sort) || 0;
    const [product] = await db
      .update(schema.products)
      .set(patch)
      .where(eq(schema.products.id, id))
      .returning();
    return c.json({ product }, 200);
  })

  /* ---------------- Admin: delete product ---------------- */
  .delete("/admin/products/:id", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    await db.delete(schema.products).where(eq(schema.products.id, id));
    return c.json({ ok: true }, 200);
  })

  /* ---------------- Admin: create category ---------------- */
  .post("/admin/categories", requireAuth, async (c) => {
    const b = await c.req.json();
    const slug =
      b.slug?.trim() ||
      `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const [category] = await db
      .insert(schema.categories)
      .values({
        slug,
        nameAr: b.nameAr ?? "",
        nameEn: b.nameEn ?? "",
        sort: Number(b.sort) || 0,
      })
      .returning();
    return c.json({ category }, 201);
  })

  /* ---------------- Admin: update category ---------------- */
  .put("/admin/categories/:id", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    const b = await c.req.json();
    const patch: Record<string, unknown> = {};
    if (b.nameAr !== undefined) patch.nameAr = b.nameAr;
    if (b.nameEn !== undefined) patch.nameEn = b.nameEn;
    if (b.sort !== undefined) patch.sort = Number(b.sort) || 0;
    const [category] = await db
      .update(schema.categories)
      .set(patch)
      .where(eq(schema.categories.id, id))
      .returning();
    return c.json({ category }, 200);
  })

  /* ---------------- Admin: delete category ---------------- */
  .delete("/admin/categories/:id", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    await db.delete(schema.categories).where(eq(schema.categories.id, id));
    return c.json({ ok: true }, 200);
  })

  /* ---------------- Admin: update settings (bulk) ---------------- */
  .put("/admin/settings", requireAuth, async (c) => {
    const b = (await c.req.json()) as Record<string, string>;
    for (const [key, value] of Object.entries(b)) {
      await db
        .insert(schema.settings)
        .values({ key, value: String(value ?? "") })
        .onConflictDoUpdate({
          target: schema.settings.key,
          set: { value: String(value ?? "") },
        });
    }
    return c.json({ ok: true }, 200);
  })

  /* ---------------- Admin: upload presign ---------------- */
  .post("/admin/upload/presign", requireAuth, async (c) => {
    const { filename, contentType } = await c.req.json();
    const safe = String(filename || "file").replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `donuts/${Date.now()}-${safe}`;
    const url = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: 600 },
    );
    // Served back through our own public proxy route (bucket is private).
    const publicUrl = `/api/images/${encodeURIComponent(key)}`;
    return c.json({ url, key, publicUrl }, 200);
  })

  /* ---------------- Public: image proxy (private bucket) ---------------- */
  .get("/images/:key{.+}", async (c) => {
    const key = c.req.param("key");
    try {
      const obj = await s3.send(
        new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }),
      );
      if (!obj.Body) return c.notFound();
      const body = obj.Body as ReadableStream;
      return new Response(body, {
        headers: {
          "Content-Type": obj.ContentType ?? "application/octet-stream",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      return c.notFound();
    }
  });

export type AppType = typeof app;
export default app;
