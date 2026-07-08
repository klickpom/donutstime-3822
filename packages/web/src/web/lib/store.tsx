import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Lang } from "./i18n";
import { STRINGS } from "./i18n";
import {
  PRODUCTS as STATIC_PRODUCTS,
  CATEGORIES as STATIC_CATEGORIES,
  BIZ as STATIC_BIZ,
  type Product,
  type CategoryItem,
} from "./data";
import { api } from "./api";

/* ---------------- Products (from API) ---------------- */
interface ProductsCtx {
  products: Product[];
  loading: boolean;
}
const ProductsContext = createContext<ProductsCtx | null>(null);

type ApiProduct = {
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
};

function mapProduct(p: ApiProduct): Product {
  return {
    id: p.slug || String(p.id),
    category: p.category,
    img: p.img,
    price: p.price,
    popular: p.popular,
    hidden: p.hidden,
    name: { ar: p.nameAr, en: p.nameEn },
    desc: { ar: p.descAr, en: p.descEn },
  };
}

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(STATIC_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.products.$get();
        const data = await res.json();
        if (alive && "products" in data) {
          setProducts(
            (data.products as ApiProduct[])
              .filter((p) => !p.hidden)
              .map(mapProduct),
          );
        }
      } catch {
        /* keep static fallback */
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <ProductsContext.Provider value={{ products, loading }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}

/* ---------------- Categories (from API) ---------------- */
const CategoriesContext = createContext<CategoryItem[]>(STATIC_CATEGORIES);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [cats, setCats] = useState<CategoryItem[]>(STATIC_CATEGORIES);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.categories.$get();
        const data = await res.json();
        if (alive && "categories" in data && data.categories.length > 0) {
          setCats(
            data.categories.map((c: any) => ({
              slug: c.slug,
              name: { ar: c.nameAr, en: c.nameEn },
            })),
          );
        }
      } catch {
        /* keep static */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);
  return (
    <CategoriesContext.Provider value={cats}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  return useContext(CategoriesContext);
}

/* ---------------- Settings (business info from API) ---------------- */
export type Biz = typeof STATIC_BIZ;
const BizContext = createContext<Biz>(STATIC_BIZ);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [biz, setBiz] = useState<Biz>(STATIC_BIZ);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.settings.$get();
        const data = await res.json();
        const s = "settings" in data ? data.settings : {};
        if (alive && Object.keys(s).length > 0) {
          setBiz({ ...STATIC_BIZ, ...s });
        }
      } catch {
        /* keep static */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);
  return <BizContext.Provider value={biz}>{children}</BizContext.Provider>;
}

export function useBiz() {
  return useContext(BizContext);
}

/* ---------------- Theme (light / dark) ---------------- */
type Theme = "light" | "dark";
interface ThemeCtx {
  theme: Theme;
  toggleTheme: () => void;
}
const ThemeContext = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem("dt_theme") as Theme | null;
    if (saved) return saved;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    localStorage.setItem("dt_theme", theme);
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  const value = useMemo<ThemeCtx>(
    () => ({
      theme,
      toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

/* ---------------- Language ---------------- */
interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (path: string) => string;
}
const LangContext = createContext<LangCtx | null>(null);

function getNested(path: string, lang: Lang): string {
  const parts = path.split(".");
  let cur: any = STRINGS;
  for (const p of parts) cur = cur?.[p];
  if (cur && typeof cur === "object" && lang in cur) return cur[lang];
  return path;
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "ar";
    return (localStorage.getItem("dt_lang") as Lang) || "ar";
  });

  useEffect(() => {
    localStorage.setItem("dt_lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const value = useMemo<LangCtx>(
    () => ({
      lang,
      setLang: setLangState,
      toggle: () => setLangState((l) => (l === "ar" ? "en" : "ar")),
      t: (path: string) => getNested(path, lang),
    }),
    [lang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}

/* ---------------- Cart ---------------- */
export interface CartItem {
  product: Product;
  qty: number;
}
interface CartCtx {
  items: CartItem[];
  count: number;
  total: number;
  open: boolean;
  setOpen: (o: boolean) => void;
  add: (p: Product) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}
const CartContext = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { products } = useProducts();
  const [items, setItems] = useState<CartItem[]>([]);

  // hydrate from localStorage once products are loaded
  useEffect(() => {
    if (products.length === 0) return;
    try {
      const raw = localStorage.getItem("dt_cart");
      if (!raw) return;
      const ids: { id: string; qty: number }[] = JSON.parse(raw);
      const next = ids
        .map((x) => {
          const product = products.find((p) => p.id === x.id);
          return product ? { product, qty: x.qty } : null;
        })
        .filter(Boolean) as CartItem[];
      setItems((prev) => (prev.length === 0 ? next : prev));
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length]);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      "dt_cart",
      JSON.stringify(items.map((i) => ({ id: i.product.id, qty: i.qty }))),
    );
  }, [items]);

  const add = (p: Product) =>
    setItems((prev) => {
      const found = prev.find((i) => i.product.id === p.id);
      if (found)
        return prev.map((i) =>
          i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i,
        );
      return [...prev, { product: p, qty: 1 }];
    });
  const inc = (id: string) =>
    setItems((prev) =>
      prev.map((i) => (i.product.id === id ? { ...i, qty: i.qty + 1 } : i)),
    );
  const dec = (id: string) =>
    setItems((prev) =>
      prev
        .map((i) => (i.product.id === id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0),
    );
  const remove = (id: string) =>
    setItems((prev) => prev.filter((i) => i.product.id !== id));
  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.product.price, 0);

  const value: CartCtx = {
    items,
    count,
    total,
    open,
    setOpen,
    add,
    inc,
    dec,
    remove,
    clear,
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

/* ---------------- WhatsApp order link ---------------- */
export function buildWhatsAppOrder(
  items: CartItem[],
  total: number,
  lang: Lang,
  whatsapp: string = STATIC_BIZ.whatsapp,
): string {
  const intro = lang === "ar" ? STRINGS.order.intro.ar : STRINGS.order.intro.en;
  const totalLbl =
    lang === "ar" ? STRINGS.order.total.ar : STRINGS.order.total.en;
  const egp = lang === "ar" ? "ج.م" : "EGP";
  const lines = items.map(
    (i) =>
      `• ${i.product.name[lang]} ×${i.qty} — ${i.qty * i.product.price} ${egp}`,
  );
  const msg = `${intro}\n${lines.join("\n")}\n\n${totalLbl}: ${total} ${egp}`;
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`;
}

export function buildSingleOrder(
  p: Product,
  lang: Lang,
  whatsapp: string = STATIC_BIZ.whatsapp,
): string {
  const intro = lang === "ar" ? STRINGS.order.one.ar : STRINGS.order.one.en;
  const egp = lang === "ar" ? "ج.م" : "EGP";
  const msg = `${intro}\n• ${p.name[lang]} — ${p.price} ${egp}`;
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`;
}
