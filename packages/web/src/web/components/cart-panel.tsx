import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useLang, useCart, useBiz, buildWhatsAppOrder } from "../lib/store";
import { api } from "../lib/api";

export function CartPanel() {
  const { t, lang } = useLang();
  const { items, total, open, setOpen, inc, dec, remove } = useCart();
  const biz = useBiz();
  const egp = t("cart.egp");

  const handleCheckout = () => {
    // Save order to DB (fire-and-forget) so admin sees it, then WhatsApp opens via href
    try {
      api.orders.$post({
        json: {
          items: items.map((i) => ({
            name: i.product.name.ar,
            nameEn: i.product.name.en,
            qty: i.qty,
            price: i.product.price,
          })),
          total,
          note: "",
        },
      });
    } catch {
      /* non-blocking */
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[60] bg-choco/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        className={`fixed top-0 z-[70] flex h-full w-[88vw] max-w-[420px] flex-col bg-cream shadow-2xl transition-transform duration-300 ${
          lang === "ar" ? "left-0" : "right-0"
        } ${
          open
            ? "translate-x-0"
            : lang === "ar"
              ? "-translate-x-full"
              : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-pink-soft px-5 py-5">
          <h2 className="font-head text-xl text-choco flex items-center gap-2">
            <ShoppingBag size={20} className="text-pink" />
            {t("cart.title")}
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-full bg-white text-choco transition-colors hover:bg-pink-soft"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-pink-soft">
                <ShoppingBag size={32} className="text-pink" />
              </div>
              <p className="mt-4 font-head text-lg text-choco">
                {t("cart.empty")}
              </p>
              <p className="mt-1 text-sm text-muted">{t("cart.emptyHint")}</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((i) => (
                <li
                  key={i.product.id}
                  className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm"
                >
                  <img
                    src={i.product.img}
                    alt={i.product.name[lang]}
                    className="h-20 w-20 shrink-0 rounded-xl bg-pink-tint object-contain"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold leading-tight text-choco text-[15px]">
                        {i.product.name[lang]}
                      </h3>
                      <button
                        onClick={() => remove(i.product.id)}
                        className="text-muted transition-colors hover:text-pink"
                        aria-label="remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="mt-0.5 text-sm font-bold text-pink">
                      {i.product.price} {egp}
                    </p>
                    <div className="mt-auto flex items-center gap-2">
                      <button
                        onClick={() => dec(i.product.id)}
                        className="grid h-7 w-7 place-items-center rounded-full bg-pink-soft text-pink transition-colors hover:bg-pink hover:text-white"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center font-bold text-choco">
                        {i.qty}
                      </span>
                      <button
                        onClick={() => inc(i.product.id)}
                        className="grid h-7 w-7 place-items-center rounded-full bg-pink-soft text-pink transition-colors hover:bg-pink hover:text-white"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-pink-soft bg-white px-5 py-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-head text-lg text-choco">
                {t("cart.total")}
              </span>
              <span className="font-head text-2xl text-pink">
                {total} {egp}
              </span>
            </div>
            <a
              href={buildWhatsAppOrder(items, total, lang, biz.whatsapp)}
              onClick={handleCheckout}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-pink py-4 font-head text-base text-white shadow-lg shadow-pink/30 transition-transform hover:scale-[1.02] active:scale-95"
            >
              <WhatsAppIcon />
              {t("cart.checkout")}
            </a>
          </div>
        )}
      </aside>
    </>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}
