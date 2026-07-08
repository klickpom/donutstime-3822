import { useMemo, useState } from "react";
import { Plus, Check, Star, Search, X } from "lucide-react";
import { useLang, useCart, useProducts, useCategories } from "../lib/store";
import { type Product } from "../lib/data";

export function MenuSection() {
  const { t, lang } = useLang();
  const { products, loading } = useProducts();
  const cats = useCategories();
  const [active, setActive] = useState<string>("all");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    let list = active === "all" ? products : products.filter((p) => p.category === active);
    if (q) {
      list = list.filter((p) => {
        const hay = `${p.name.ar} ${p.name.en} ${p.desc.ar} ${p.desc.en}`.toLowerCase();
        return hay.includes(q);
      });
    }
    return list;
  }, [products, active, q]);

  return (
    <section
      id="menu"
      className="relative scroll-mt-20 bg-pink-tint py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Heading */}
        <div className="text-center">
          <span className="text-sm font-bold uppercase tracking-wider text-pink">
            {t("menu.eyebrow")}
          </span>
          <h2 className="font-head mt-2 text-3xl text-choco sm:text-5xl">
            {t("menu.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-ink/60">
            {t("menu.sub")}
          </p>
        </div>

        {/* Search bar — luxury */}
        <div className="mx-auto mt-9 max-w-2xl">
          <div className="group relative p-[2px]">
            {/* ambient glow halo */}
            <div className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-[radial-gradient(60%_60%_at_50%_50%,color-mix(in_srgb,var(--pink)_30%,transparent),transparent_70%)] opacity-60 blur-xl transition-opacity duration-700 group-focus-within:opacity-100" />

            {/* rotating gradient ring */}
            <div className="dt-search-ring pointer-events-none absolute inset-0 rounded-[1.5rem] opacity-70 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100" />

            {/* inner field */}
            <div className="relative flex items-center gap-3 overflow-hidden rounded-[1.4rem] border border-white/40 bg-gradient-to-b from-[var(--surface)] to-[var(--surface-2)] px-5 py-1 shadow-[0_18px_50px_-20px_rgba(58,35,24,0.45),inset_0_1px_0_rgba(255,255,255,0.6)] transition-all duration-300 group-focus-within:shadow-[0_24px_60px_-18px_rgba(255,61,127,0.5),inset_0_1px_0_rgba(255,255,255,0.6)] dark:border-white/10 dark:shadow-[0_18px_50px_-20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]">
              {/* moving shimmer sweep */}
              <div className="dt-search-shimmer pointer-events-none absolute inset-y-0 -left-1/2 w-1/2" />

              <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-pink to-pink-dark shadow-[0_8px_20px_-8px_rgba(255,61,127,0.7)] transition-transform duration-300 group-focus-within:scale-105">
                <Search size={18} className="dt-search-icon text-white" />
              </div>

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("menu.search")}
                className="relative h-14 w-full bg-transparent text-[15px] font-semibold tracking-wide text-choco placeholder:font-medium placeholder:text-ink/35 focus:outline-none"
                dir={lang === "ar" ? "rtl" : "ltr"}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label={t("menu.searchClear")}
                  className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pink-tint text-choco/60 transition-all hover:rotate-90 hover:bg-pink hover:text-white active:scale-90"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          {q && (
            <p className="mt-3 text-center text-[13px] font-semibold text-ink/55">
              {filtered.length} {t("menu.resultsCount")}
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="no-scrollbar mt-7 flex justify-start gap-2 overflow-x-auto pb-2 sm:justify-center">
          <FilterPill
            label={t("menu.all")}
            active={active === "all"}
            onClick={() => setActive("all")}
          />
          {cats.map((c) => (
            <FilterPill
              key={c.slug}
              label={c.name[lang]}
              active={active === c.slug}
              onClick={() => setActive(c.slug)}
            />
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-[1.75rem] bg-white/60"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-pink shadow-[0_10px_30px_-12px_rgba(255,61,127,0.4)]">
              <Search size={26} />
            </div>
            <p className="mt-4 text-base font-bold text-choco">
              {q
                ? t("menu.noResults")
                : lang === "ar"
                  ? "مفيش منتجات في التصنيف ده"
                  : "No products here yet"}
            </p>
            {q && (
              <button
                onClick={() => setQuery("")}
                className="mt-4 rounded-full bg-pink px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink/25 transition-transform active:scale-95"
              >
                {lang === "ar" ? "امسح البحث" : "Clear search"}
              </button>
            )}
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} query={q} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
        active
          ? "bg-pink text-white shadow-lg shadow-pink/25"
          : "bg-white text-choco/70 hover:text-pink"
      }`}
    >
      {label}
    </button>
  );
}

/* highlight matched substring inside a name */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-pink/15 px-0.5 text-pink">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function ProductCard({ product, query }: { product: Product; query: string }) {
  const { t, lang } = useLang();
  const { add, setOpen } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    add(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
    setOpen(true);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-black/[0.04] bg-[var(--surface)] shadow-[0_8px_30px_-16px_rgba(58,35,24,0.22)] transition-all duration-400 hover:-translate-y-2 hover:shadow-[0_28px_60px_-24px_rgba(255,61,127,0.5)] dark:border-white/[0.06]">
      {/* Image */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[var(--pink-tint)] to-[color-mix(in_srgb,var(--pink-soft)_55%,var(--pink-tint))] px-5 pt-6 pb-5">
        {product.popular && (
          <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink to-pink-dark px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg shadow-pink/30">
            <Star size={12} fill="currentColor" />
            {t("menu.popular")}
          </span>
        )}
        <img
          src={product.img}
          alt={product.name[lang]}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/placeholder.png";
          }}
          className="mx-auto aspect-square w-full max-w-[240px] object-contain drop-shadow-[0_18px_28px_rgba(58,35,24,0.18)] transition-transform duration-500 ease-out group-hover:scale-[1.08] group-hover:-rotate-2"
        />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5 pt-4">
        <h3 className="font-head text-[17px] leading-snug text-choco">
          <Highlight text={product.name[lang]} query={query} />
        </h3>
        <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-ink/55">
          {product.desc[lang]}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="flex items-baseline gap-1">
            <span className="font-head text-[26px] leading-none text-pink">
              {product.price}
            </span>
            <span className="text-[11px] font-bold text-muted">
              {t("cart.egp")}
            </span>
          </div>
          <button
            onClick={handleAdd}
            aria-label={t("menu.add")}
            className={`group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-2xl px-5 py-2.5 text-[13px] font-bold text-white shadow-lg transition-all duration-300 active:scale-[0.96] ${
              added
                ? "bg-emerald-500 shadow-emerald-500/30"
                : "bg-choco shadow-choco/25 hover:bg-pink hover:shadow-pink/40 dark:bg-pink dark:shadow-pink/30 dark:hover:bg-pink-dark"
            }`}
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20 transition-transform duration-300 group-hover/btn:rotate-90">
              {added ? <Check size={13} /> : <Plus size={14} />}
            </span>
            {added ? t("menu.added") : t("menu.add")}
          </button>
        </div>
      </div>
    </div>
  );
}
