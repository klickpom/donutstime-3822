import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Search, X, ShoppingBag, Check, Sparkles, ArrowRight, Plus } from "lucide-react";
import { useLang, useCart, useProducts } from "../lib/store";
import type { Product } from "../lib/data";

/* ------------------------------------------------------------------ */
/*  Helpers                                                              */
/* ------------------------------------------------------------------ */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-pink/20 px-0.5 text-pink not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Single result row                                                    */
/* ------------------------------------------------------------------ */
function ResultRow({
  product,
  query,
  onClose,
}: {
  product: Product;
  query: string;
  onClose: () => void;
}) {
  const { t, lang } = useLang();
  const { add, setOpen: setCartOpen } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    add(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const handleGoToMenu = () => {
    onClose();
    setTimeout(() => {
      document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
    }, 250);
  };

  return (
    <div
      onClick={handleGoToMenu}
      className="group flex cursor-pointer items-center gap-4 rounded-2xl p-3 transition-all duration-200 hover:bg-pink-tint dark:hover:bg-[var(--surface-2)]"
    >
      {/* thumbnail */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-pink-soft to-pink-tint shadow-sm">
        <img
          src={product.img}
          alt={product.name[lang]}
          className="h-full w-full object-contain p-1 transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/placeholder.png";
          }}
        />
        {product.popular && (
          <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-pink shadow-md shadow-pink/40 ring-2 ring-white" />
        )}
      </div>

      {/* info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold text-choco leading-snug">
          <Highlight text={product.name[lang]} query={query} />
        </p>
        <p className="mt-0.5 truncate text-[12px] text-muted">
          {product.desc[lang]}
        </p>
        <p className="mt-1 text-[13px] font-extrabold text-pink">
          {product.price} {t("cart.egp")}
        </p>
      </div>

      {/* add button */}
      <button
        onClick={handleAdd}
        aria-label={t("menu.add")}
        className={`shrink-0 grid h-9 w-9 place-items-center rounded-xl text-white shadow-lg transition-all duration-300 active:scale-90 ${
          added
            ? "bg-emerald-500 shadow-emerald-400/40"
            : "bg-choco shadow-choco/20 hover:bg-pink hover:shadow-pink/40 dark:bg-pink"
        }`}
      >
        {added ? <Check size={15} /> : <Plus size={16} />}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main modal                                                           */
/* ------------------------------------------------------------------ */
export function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t, lang } = useLang();
  const { products } = useProducts();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return [];
    return products
      .filter((p) => !p.hidden)
      .filter((p) => {
        const hay = `${p.name.ar} ${p.name.en} ${p.desc.ar} ${p.desc.en}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 8);
  }, [products, q]);

  const popular = useMemo(
    () => products.filter((p) => p.popular && !p.hidden).slice(0, 4),
    [products]
  );

  /* focus input when modal opens */
  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  /* close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  /* lock body scroll */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* ── backdrop ── */}
      <div
        onClick={onClose}
        aria-hidden
        className={`fixed inset-0 z-[80] bg-choco/40 backdrop-blur-md transition-all duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* ── panel ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={lang === "ar" ? "البحث" : "Search"}
        className={`fixed inset-x-0 top-0 z-[90] flex justify-center px-4 pt-[5vh] sm:pt-[8vh] transition-all duration-300 ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-6 pointer-events-none"
        }`}
      >
        <div className="dt-search-modal w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/40 bg-[var(--surface)] shadow-[0_40px_120px_-20px_rgba(58,35,24,0.5),0_0_0_1px_rgba(255,61,127,0.07)] dark:border-white/10 dark:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.7)]">

          {/* ── glowing top edge ── */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink/60 to-transparent" />

          {/* ── search field ── */}
          <div className="relative flex items-center gap-3 border-b border-[var(--pink-soft)] px-5 py-4 dark:border-white/10">
            {/* animated icon */}
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-pink to-pink-dark shadow-[0_8px_20px_-8px_rgba(255,61,127,0.7)]">
              <Search size={18} className="text-white dt-search-icon" />
            </div>

            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === "ar" ? "دوّر على أي منتج..." : "Search any product..."}
              dir={lang === "ar" ? "rtl" : "ltr"}
              className="h-12 w-full bg-transparent text-[16px] font-semibold text-choco placeholder:text-muted/60 focus:outline-none"
            />

            <div className="flex items-center gap-2 shrink-0">
              {/* Ctrl+K badge */}
              <kbd className="hidden rounded-lg border border-[var(--pink-soft)] bg-pink-tint px-2 py-1 text-[11px] font-bold text-muted sm:block dark:border-white/10 dark:bg-[var(--surface-2)]">
                ESC
              </kbd>
              <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-full bg-pink-tint text-muted transition-all hover:rotate-90 hover:bg-pink hover:text-white active:scale-90 dark:bg-[var(--surface-2)]"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* ── results area ── */}
          <div className="max-h-[55vh] overflow-y-auto overscroll-contain p-3 no-scrollbar">
            {/* state: typed but no results */}
            {q && results.length === 0 && (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-pink-tint text-pink">
                  <Search size={26} />
                </div>
                <p className="mt-4 text-base font-bold text-choco">
                  {lang === "ar" ? "مفيش نتايج" : "No results found"}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {lang === "ar" ? `مفيش منتج بـ "${query}"` : `Nothing matched "${query}"`}
                </p>
              </div>
            )}

            {/* state: has results */}
            {q && results.length > 0 && (
              <div>
                <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-widest text-muted/70">
                  {lang === "ar"
                    ? `${results.length} نتيجة`
                    : `${results.length} result${results.length !== 1 ? "s" : ""}`}
                </p>
                <div className="space-y-1">
                  {results.map((p) => (
                    <ResultRow key={p.id} product={p} query={query} onClose={onClose} />
                  ))}
                </div>
              </div>
            )}

            {/* state: empty — show popular */}
            {!q && (
              <div>
                <div className="flex items-center gap-2 px-3 pb-3 pt-1">
                  <Sparkles size={14} className="text-pink" />
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted/70">
                    {lang === "ar" ? "الأكثر طلباً" : "Popular"}
                  </p>
                </div>
                <div className="space-y-1">
                  {popular.map((p) => (
                    <ResultRow key={p.id} product={p} query="" onClose={onClose} />
                  ))}
                </div>

                {/* go to menu CTA */}
                <button
                  onClick={() => {
                    onClose();
                    setTimeout(() => {
                      document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
                    }, 250);
                  }}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--pink-soft)] bg-pink-tint py-3 text-[13px] font-bold text-pink transition-all hover:bg-pink hover:text-white dark:border-white/10 dark:bg-[var(--surface-2)] dark:text-pink dark:hover:bg-pink dark:hover:text-white"
                >
                  {lang === "ar" ? "شوف المنيو كله" : "Browse full menu"}
                  <ArrowRight size={15} className={lang === "ar" ? "rotate-180" : ""} />
                </button>
              </div>
            )}
          </div>

          {/* ── footer hint ── */}
          <div className="border-t border-[var(--pink-soft)] px-5 py-3 dark:border-white/10">
            <p className="text-[11px] text-muted/60 text-center">
              {lang === "ar"
                ? "اضغط Enter أو اختار من القايمة • ESC للإغلاق"
                : "Select a result • ESC to close"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Trigger button (used in Navbar)                                      */
/* ------------------------------------------------------------------ */
export function SearchTrigger({ onClick }: { onClick: () => void }) {
  const { lang } = useLang();

  return (
    <button
      onClick={onClick}
      aria-label={lang === "ar" ? "بحث" : "Search"}
      className="dt-search-trigger group relative hidden items-center gap-2.5 overflow-hidden rounded-full border border-pink/20 bg-white px-4 py-2 text-sm font-semibold text-muted shadow-sm transition-all duration-300 hover:border-pink/50 hover:shadow-[0_4px_20px_-8px_rgba(255,61,127,0.45)] lg:flex dark:bg-[var(--surface)] dark:text-muted"
    >
      {/* shimmer on hover */}
      <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-pink/10 to-transparent transition-transform duration-500 group-hover:translate-x-[400%]" />
      <Search size={14} className="text-pink transition-transform duration-300 group-hover:scale-110" />
      <span className="hidden xl:block">
        {lang === "ar" ? "دوّر على منتج..." : "Search products..."}
      </span>
      <kbd className="hidden rounded-md border border-pink/15 bg-pink-tint px-1.5 py-0.5 text-[10px] font-bold text-pink/70 xl:block dark:bg-[var(--surface-2)]">
        ⌘K
      </kbd>
    </button>
  );
}
