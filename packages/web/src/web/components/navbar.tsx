import { useEffect, useState, useCallback } from "react";
import { ShoppingBag, Menu as MenuIcon, X, Sun, Moon, Search } from "lucide-react";
import { useLang, useCart, useTheme } from "../lib/store";
import { SearchModal, SearchTrigger } from "./search-modal";

const LINKS = [
  { id: "home", href: "#home" },
  { id: "menu", href: "#menu" },
  { id: "about", href: "#about" },
  { id: "contact", href: "#contact" },
];

export function Navbar() {
  const { t, lang, toggle } = useLang();
  const { theme, toggleTheme } = useTheme();
  const { count, setOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  /* Ctrl+K / Cmd+K shortcut */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/85 backdrop-blur-xl shadow-[0_6px_24px_-12px_rgba(255,61,127,0.35)]"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        {/* Logo */}
        <a href="#home" className="flex items-center shrink-0" aria-label="Donuts Time">
          {/* Full logo on desktop (light + dark variants) */}
          <picture className="hidden sm:block">
            <img
              src="/images/logo-full.png"
              alt="Donuts Time"
              className="block dark:hidden h-14 w-auto object-contain drop-shadow-sm"
            />
            <img
              src="/images/logo-full-dark.png"
              alt="Donuts Time"
              className="hidden dark:block h-14 w-auto object-contain drop-shadow-sm"
            />
          </picture>
          {/* Donut mark only on small screens */}
          <img
            src="/images/logo-donut.png"
            alt="Donuts Time"
            className="block sm:hidden h-11 w-11 object-contain drop-shadow-sm"
          />
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.id}
              href={l.href}
              className="rounded-full px-4 py-2 text-[15px] font-semibold text-ink/80 transition-colors hover:text-pink"
            >
              {t(`nav.${l.id}`)}
            </a>
          ))}
        </div>

        {/* Search trigger — desktop */}
        <SearchTrigger onClick={openSearch} />

        {/* Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Search — mobile icon */}
          <button
            onClick={openSearch}
            className="grid h-10 w-10 place-items-center rounded-full border-2 border-pink/20 bg-white text-pink transition-all hover:border-pink lg:hidden"
            aria-label={lang === "ar" ? "بحث" : "Search"}
          >
            <Search size={18} />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="grid h-10 w-10 place-items-center rounded-full border-2 border-pink/20 bg-white text-pink transition-all hover:border-pink hover:rotate-12 active:scale-90"
            aria-label="toggle theme"
            title={theme === "dark" ? "الوضع النهاري" : "الوضع الليلي"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={toggle}
            className="grid h-10 min-w-10 place-items-center rounded-full border-2 border-pink/20 bg-white px-3 text-sm font-bold text-pink transition-colors hover:border-pink"
            aria-label="toggle language"
          >
            {lang === "ar" ? "EN" : "ع"}
          </button>

          <button
            onClick={() => setOpen(true)}
            className="relative grid h-11 w-11 place-items-center rounded-full bg-pink text-white shadow-lg shadow-pink/30 transition-transform hover:scale-105 active:scale-95"
            aria-label="cart"
          >
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-choco px-1 text-[11px] font-bold text-white ring-2 ring-white">
                {count}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="grid h-11 w-11 place-items-center rounded-full bg-white/80 text-choco lg:hidden"
            aria-label="menu"
          >
            {mobileOpen ? <X size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden">
          <div className="mx-4 mb-3 rounded-3xl bg-white p-3 shadow-xl shadow-pink/10">
            {LINKS.map((l) => (
              <a
                key={l.id}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-2xl px-4 py-3 text-base font-semibold text-ink/90 transition-colors hover:bg-pink-tint hover:text-pink"
              >
                {t(`nav.${l.id}`)}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Global search modal */}
      <SearchModal open={searchOpen} onClose={closeSearch} />
    </header>
  );
}
