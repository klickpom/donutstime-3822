import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Package,
  Tags,
  Store,
  ReceiptText,
  Upload,
  Star,
  EyeOff,
  X,
  Check,
} from "lucide-react";
import { api } from "../lib/api";
import { authClient, clearToken } from "../lib/auth";
import { useLang } from "../lib/store";

type Tab = "products" | "categories" | "business" | "orders";

export default function Admin() {
  const { t, lang } = useLang();
  const [, navigate] = useLocation();
  const { data: session, isPending } = authClient.useSession();
  const [tab, setTab] = useState<Tab>("products");

  useEffect(() => {
    if (!isPending && !session) navigate("/sign-in");
  }, [isPending, session, navigate]);

  if (isPending || !session) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream">
        <Loader2 size={32} className="animate-spin text-pink" />
      </div>
    );
  }

  const handleLogout = async () => {
    await authClient.signOut();
    clearToken();
    navigate("/sign-in");
  };

  const TABS: { id: Tab; icon: any; label: string }[] = [
    { id: "products", icon: Package, label: t("admin.products") },
    { id: "categories", icon: Tags, label: t("admin.categoriesTab") },
    { id: "business", icon: Store, label: t("admin.business") },
    { id: "orders", icon: ReceiptText, label: t("admin.ordersTab") },
  ];

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-cream text-choco"
    >
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-pink-soft bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <img
              src="/images/logo-donut.png"
              alt="Donuts Time"
              className="h-9 w-9 object-contain"
            />
            <span className="font-head text-lg text-choco">
              {t("admin.dashboard")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="hidden rounded-full bg-pink-tint px-4 py-2 text-sm font-bold text-pink hover:bg-pink-soft sm:block"
            >
              {t("admin.backToSite")}
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-full bg-choco px-4 py-2 text-sm font-bold text-white hover:bg-pink"
            >
              <LogOut size={15} />
              {t("admin.logout")}
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="mx-auto max-w-6xl px-5 pt-6">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {TABS.map((tb) => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
                tab === tb.id
                  ? "bg-pink text-white shadow-lg shadow-pink/25"
                  : "bg-white text-choco/70 hover:text-pink"
              }`}
            >
              <tb.icon size={16} />
              {tb.label}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-5 py-7">
        {tab === "products" && <ProductsTab />}
        {tab === "categories" && <CategoriesTab />}
        {tab === "business" && <BusinessTab />}
        {tab === "orders" && <OrdersTab />}
      </main>
    </div>
  );
}

/* ============================================================
   Image upload helper
   ============================================================ */
async function uploadImage(file: File): Promise<string> {
  const res = await api.admin.upload.presign.$post({
    json: { filename: file.name, contentType: file.type },
  });
  const data = await res.json();
  if (!("url" in data)) throw new Error("presign failed");
  await fetch(data.url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  return data.publicUrl;
}

/* ============================================================
   PRODUCTS TAB
   ============================================================ */
type ProductRow = {
  id: number;
  slug: string;
  category: string;
  img: string;
  price: number;
  popular: boolean;
  hidden: boolean;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  sort: number;
};

function ProductsTab() {
  const { t, lang } = useLang();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<ProductRow> | null>(null);

  const products = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const res = await api.products.$get();
      const data = await res.json();
      return "products" in data ? (data.products as ProductRow[]) : [];
    },
  });

  const cats = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await api.categories.$get();
      const data = await res.json();
      return "categories" in data ? data.categories : [];
    },
  });

  const del = useMutation({
    mutationFn: async (id: number) => {
      await api.admin.products[":id"].$delete({ param: { id: String(id) } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-head text-2xl text-choco">{t("admin.products")}</h2>
        <button
          onClick={() =>
            setEditing({
              category: cats.data?.[0]?.slug ?? "sharqi",
              price: 0,
              popular: false,
              hidden: false,
              img: "/images/placeholder.png",
            })
          }
          className="flex items-center gap-1.5 rounded-full bg-pink px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink/25 hover:scale-105"
        >
          <Plus size={16} />
          {t("admin.addProduct")}
        </button>
      </div>

      {products.isLoading ? (
        <div className="grid place-items-center py-20">
          <Loader2 size={28} className="animate-spin text-pink" />
        </div>
      ) : products.data && products.data.length === 0 ? (
        <p className="py-16 text-center text-muted">{t("admin.noProducts")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.data?.map((p) => (
            <div
              key={p.id}
              className="flex gap-3 rounded-2xl bg-white p-3.5 shadow-[0_8px_30px_-18px_rgba(58,35,24,0.3)]"
            >
              <img
                src={p.img}
                alt={p.nameAr}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/placeholder.png";
                }}
                className="h-20 w-20 shrink-0 rounded-xl bg-pink-tint object-contain"
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-1">
                  <h3 className="truncate font-bold text-choco">
                    {lang === "ar" ? p.nameAr : p.nameEn}
                  </h3>
                  {p.popular && (
                    <Star size={14} className="shrink-0 text-pink" fill="currentColor" />
                  )}
                </div>
                <p className="text-sm font-bold text-pink">
                  {p.price} {t("cart.egp")}
                </p>
                {p.hidden && (
                  <span className="mt-0.5 inline-flex w-fit items-center gap-1 rounded-full bg-choco/10 px-2 py-0.5 text-[11px] font-bold text-choco/60">
                    <EyeOff size={11} /> {t("admin.hidden")}
                  </span>
                )}
                <div className="mt-auto flex gap-2 pt-2">
                  <button
                    onClick={() => setEditing(p)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-pink-tint py-1.5 text-xs font-bold text-pink hover:bg-pink-soft"
                  >
                    <Pencil size={13} />
                    {t("admin.edit")}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(t("admin.confirmDelete"))) del.mutate(p.id);
                    }}
                    className="flex items-center justify-center rounded-lg bg-red-50 px-2.5 py-1.5 text-red-500 hover:bg-red-100"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <ProductModal
          product={editing}
          categories={cats.data ?? []}
          onClose={() => setEditing(null)}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ["admin-products"] });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function ProductModal({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: Partial<ProductRow>;
  categories: { slug: string; nameAr: string; nameEn: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t, lang } = useLang();
  const isEdit = !!product.id;
  const [form, setForm] = useState({
    nameAr: product.nameAr ?? "",
    nameEn: product.nameEn ?? "",
    descAr: product.descAr ?? "",
    descEn: product.descEn ?? "",
    price: product.price ?? 0,
    category: product.category ?? categories[0]?.slug ?? "sharqi",
    img: product.img ?? "/images/placeholder.png",
    popular: product.popular ?? false,
    hidden: product.hidden ?? false,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleUpload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      set("img", url);
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isEdit) {
        await api.admin.products[":id"].$put({
          param: { id: String(product.id) },
          json: form,
        });
      } else {
        await api.admin.products.$post({ json: form });
      }
      onSaved();
    } catch {
      alert("Save failed");
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-choco/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[1.75rem] bg-cream p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-head text-xl text-choco">
            {isEdit ? t("admin.editProduct") : t("admin.newProduct")}
          </h3>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-white text-choco hover:bg-pink-soft"
          >
            <X size={18} />
          </button>
        </div>

        {/* Image */}
        <div className="mb-4 flex items-center gap-4">
          <img
            src={form.img}
            alt=""
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/placeholder.png";
            }}
            className="h-24 w-24 shrink-0 rounded-2xl bg-pink-tint object-contain"
          />
          <label className="flex cursor-pointer items-center gap-2 rounded-full bg-pink px-4 py-2.5 text-sm font-bold text-white hover:scale-105">
            {uploading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Upload size={15} />
            )}
            {uploading ? t("admin.uploading") : t("admin.uploadImg")}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files?.[0])}
            />
          </label>
        </div>

        <Field label={t("admin.nameAr")}>
          <input
            dir="rtl"
            value={form.nameAr}
            onChange={(e) => set("nameAr", e.target.value)}
            className="dt-input"
          />
        </Field>
        <Field label={t("admin.nameEn")}>
          <input
            dir="ltr"
            value={form.nameEn}
            onChange={(e) => set("nameEn", e.target.value)}
            className="dt-input"
          />
        </Field>
        <Field label={t("admin.descAr")}>
          <textarea
            dir="rtl"
            rows={2}
            value={form.descAr}
            onChange={(e) => set("descAr", e.target.value)}
            className="dt-input resize-none"
          />
        </Field>
        <Field label={t("admin.descEn")}>
          <textarea
            dir="ltr"
            rows={2}
            value={form.descEn}
            onChange={(e) => set("descEn", e.target.value)}
            className="dt-input resize-none"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("admin.price")}>
            <input
              type="number"
              value={form.price}
              onChange={(e) => set("price", Number(e.target.value))}
              className="dt-input"
            />
          </Field>
          <Field label={t("admin.category")}>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className="dt-input"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {lang === "ar" ? c.nameAr : c.nameEn}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mb-5 mt-2 flex flex-wrap gap-4">
          <Toggle
            checked={form.popular}
            onChange={(v) => set("popular", v)}
            label={t("admin.popular")}
          />
          <Toggle
            checked={form.hidden}
            onChange={(v) => set("hidden", v)}
            label={t("admin.hidden")}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-pink py-3.5 font-head text-base text-white shadow-lg shadow-pink/30 hover:scale-[1.02] disabled:opacity-60"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? t("admin.saving") : t("admin.save")}
          </button>
          <button
            onClick={onClose}
            className="rounded-full bg-white px-6 py-3.5 font-head text-base text-choco shadow hover:bg-pink-soft"
          >
            {t("admin.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CATEGORIES TAB
   ============================================================ */
type CatRow = { id: number; slug: string; nameAr: string; nameEn: string; sort: number };

function CategoriesTab() {
  const { t, lang } = useLang();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<CatRow> | null>(null);

  const cats = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await api.categories.$get();
      const data = await res.json();
      return "categories" in data ? (data.categories as CatRow[]) : [];
    },
  });

  const del = useMutation({
    mutationFn: async (id: number) => {
      await api.admin.categories[":id"].$delete({ param: { id: String(id) } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-categories"] }),
  });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-head text-2xl text-choco">
          {t("admin.categoriesTab")}
        </h2>
        <button
          onClick={() => setEditing({ nameAr: "", nameEn: "" })}
          className="flex items-center gap-1.5 rounded-full bg-pink px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink/25 hover:scale-105"
        >
          <Plus size={16} />
          {t("admin.addCategory")}
        </button>
      </div>

      {cats.isLoading ? (
        <div className="grid place-items-center py-20">
          <Loader2 size={28} className="animate-spin text-pink" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {cats.data?.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-[0_8px_30px_-18px_rgba(58,35,24,0.3)]"
            >
              <div>
                <p className="font-bold text-choco">
                  {lang === "ar" ? c.nameAr : c.nameEn}
                </p>
                <p className="text-xs text-muted">
                  {lang === "ar" ? c.nameEn : c.nameAr}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(c)}
                  className="flex items-center gap-1 rounded-lg bg-pink-tint px-3 py-1.5 text-xs font-bold text-pink hover:bg-pink-soft"
                >
                  <Pencil size={13} />
                  {t("admin.edit")}
                </button>
                <button
                  onClick={() => {
                    if (confirm(t("admin.confirmDelete"))) del.mutate(c.id);
                  }}
                  className="rounded-lg bg-red-50 px-2.5 py-1.5 text-red-500 hover:bg-red-100"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <CategoryModal
          cat={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ["admin-categories"] });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function CategoryModal({
  cat,
  onClose,
  onSaved,
}: {
  cat: Partial<CatRow>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useLang();
  const isEdit = !!cat.id;
  const [nameAr, setNameAr] = useState(cat.nameAr ?? "");
  const [nameEn, setNameEn] = useState(cat.nameEn ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isEdit) {
        await api.admin.categories[":id"].$put({
          param: { id: String(cat.id) },
          json: { nameAr, nameEn },
        });
      } else {
        await api.admin.categories.$post({ json: { nameAr, nameEn } });
      }
      onSaved();
    } catch {
      alert("Save failed");
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-choco/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[1.75rem] bg-cream p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-head text-xl text-choco">
            {isEdit ? t("admin.edit") : t("admin.addCategory")}
          </h3>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-white text-choco hover:bg-pink-soft"
          >
            <X size={18} />
          </button>
        </div>
        <Field label={t("admin.nameAr")}>
          <input
            dir="rtl"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            className="dt-input"
          />
        </Field>
        <Field label={t("admin.nameEn")}>
          <input
            dir="ltr"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            className="dt-input"
          />
        </Field>
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-pink py-3.5 font-head text-base text-white shadow-lg shadow-pink/30 hover:scale-[1.02] disabled:opacity-60"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? t("admin.saving") : t("admin.save")}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   BUSINESS TAB
   ============================================================ */
function BusinessTab() {
  const { t } = useLang();
  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const settings = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const res = await api.settings.$get();
      const data = await res.json();
      return "settings" in data ? data.settings : {};
    },
  });

  useEffect(() => {
    if (settings.data) setForm(settings.data as Record<string, string>);
  }, [settings.data]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.admin.settings.$put({ json: form });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const FIELDS: { key: string; label: string; dir?: "ltr" | "rtl" }[] = [
    { key: "phone", label: t("admin.phone"), dir: "ltr" },
    { key: "phone2", label: t("admin.phone2"), dir: "ltr" },
    { key: "whatsapp", label: t("admin.whatsapp"), dir: "ltr" },
    { key: "email", label: t("admin.emailBiz"), dir: "ltr" },
    { key: "addressAr", label: t("admin.addressAr"), dir: "rtl" },
    { key: "addressEn", label: t("admin.addressEn"), dir: "ltr" },
    { key: "facebook", label: t("admin.facebook"), dir: "ltr" },
  ];

  if (settings.isLoading)
    return (
      <div className="grid place-items-center py-20">
        <Loader2 size={28} className="animate-spin text-pink" />
      </div>
    );

  return (
    <div className="max-w-2xl">
      <h2 className="mb-5 font-head text-2xl text-choco">
        {t("admin.business")}
      </h2>
      <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_8px_30px_-18px_rgba(58,35,24,0.3)]">
        {FIELDS.map((f) => (
          <Field key={f.key} label={f.label}>
            <input
              dir={f.dir}
              value={form[f.key] ?? ""}
              onChange={(e) => set(f.key, e.target.value)}
              className="dt-input"
            />
          </Field>
        ))}
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-pink py-3.5 font-head text-base text-white shadow-lg shadow-pink/30 hover:scale-[1.02] disabled:opacity-60"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : saved ? (
            <Check size={18} />
          ) : null}
          {saved ? t("admin.saved") : saving ? t("admin.saving") : t("admin.save")}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   ORDERS TAB
   ============================================================ */
function OrdersTab() {
  const { t } = useLang();
  const orders = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const res = await api.admin.orders.$get();
      const data = await res.json();
      return "orders" in data ? data.orders : [];
    },
  });

  if (orders.isLoading)
    return (
      <div className="grid place-items-center py-20">
        <Loader2 size={28} className="animate-spin text-pink" />
      </div>
    );

  return (
    <div>
      <h2 className="mb-5 font-head text-2xl text-choco">
        {t("admin.ordersTab")}
      </h2>
      {orders.data && orders.data.length === 0 ? (
        <p className="py-16 text-center text-muted">{t("admin.noOrders")}</p>
      ) : (
        <div className="grid gap-3">
          {orders.data?.map((o: any) => {
            let items: any[] = [];
            try {
              items = JSON.parse(o.items);
            } catch {
              /* ignore */
            }
            return (
              <div
                key={o.id}
                className="rounded-2xl bg-white p-4 shadow-[0_8px_30px_-18px_rgba(58,35,24,0.3)]"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-muted">
                    #{o.id} · {new Date(o.createdAt).toLocaleString()}
                  </span>
                  <span className="font-head text-lg text-pink">
                    {o.total} {t("cart.egp")}
                  </span>
                </div>
                <ul className="space-y-1 text-sm text-choco/80">
                  {items.map((it, i) => (
                    <li key={i} className="flex justify-between">
                      <span>
                        {it.name} ×{it.qty}
                      </span>
                      <span className="font-bold">
                        {it.qty * it.price} {t("cart.egp")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Small shared UI
   ============================================================ */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3.5">
      <label className="mb-1.5 block text-sm font-bold text-choco">
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5"
    >
      <span
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? "bg-pink" : "bg-choco/20"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-5.5 ltr:left-5.5 rtl:right-5.5" : "left-0.5 rtl:right-0.5"
          }`}
          style={{ insetInlineStart: checked ? "1.375rem" : "0.125rem" }}
        />
      </span>
      <span className="text-sm font-bold text-choco">{label}</span>
    </button>
  );
}
