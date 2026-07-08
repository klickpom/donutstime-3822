import {
  Croissant,
  Truck,
  BadgePercent,
  Leaf,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useLang } from "../lib/store";
import { useBiz } from "../lib/store";

/* ---------------- Features ---------------- */
export function Features() {
  const { t } = useLang();
  const items = [
    { icon: Croissant, t: t("features.f1t"), d: t("features.f1d") },
    { icon: Truck, t: t("features.f2t"), d: t("features.f2d") },
    { icon: BadgePercent, t: t("features.f3t"), d: t("features.f3d") },
  ];
  return (
    <section className="bg-cream py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <h2 className="font-head text-center text-3xl text-choco sm:text-5xl">
          {t("features.title")}
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((f, i) => (
            <div
              key={i}
              className="group rounded-[1.75rem] bg-white p-8 text-center shadow-[0_10px_40px_-22px_rgba(58,35,24,0.25)] transition-transform hover:-translate-y-1.5"
            >
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-pink-soft text-pink transition-colors group-hover:bg-pink group-hover:text-white">
                <f.icon size={28} />
              </div>
              <h3 className="font-head mt-5 text-xl text-choco">{f.t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink/55">
                {f.d}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- About ---------------- */
export function About() {
  const { t, lang } = useLang();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  return (
    <section id="about" className="scroll-mt-20 bg-pink-tint py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        {/* image */}
        <div className="relative">
          <div className="absolute -inset-3 -z-10 rounded-[2.5rem] bg-gradient-to-br from-pink-soft to-pink/20" />
          <img
            src="/images/about.png"
            alt="Donuts Time"
            className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-2xl shadow-pink/20"
          />
        </div>
        {/* text */}
        <div className={lang === "ar" ? "lg:text-right" : "lg:text-left"}>
          <span className="text-sm font-bold uppercase tracking-wider text-pink">
            {t("about.eyebrow")}
          </span>
          <h2 className="font-head mt-2 text-3xl text-choco sm:text-5xl">
            {t("about.title")}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink/65 sm:text-lg">
            {t("about.body")}
          </p>
          <ul className="mt-6 space-y-3">
            {[t("about.p1"), t("about.p2"), t("about.p3")].map((p, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pink-soft text-pink">
                  <Leaf size={16} />
                </span>
                <span className="font-semibold text-choco">{p}</span>
              </li>
            ))}
          </ul>
          <a
            href="#menu"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-pink px-8 py-4 font-head text-base text-white shadow-xl shadow-pink/30 transition-transform hover:scale-105 active:scale-95"
          >
            {t("about.cta")}
            <Arrow
              size={18}
              className="transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1"
            />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Contact ---------------- */
export function Contact() {
  const { t, lang } = useLang();
  const BIZ = useBiz();
  const addr = lang === "ar" ? BIZ.addressAr : BIZ.addressEn;
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    BIZ.mapsQuery,
  )}&output=embed`;
  const waLink = `https://wa.me/${BIZ.whatsapp}`;

  const rows = [
    { icon: MapPin, label: t("contact.address"), value: addr },
    { icon: Phone, label: t("contact.phone"), value: `${BIZ.phone} • ${BIZ.phone2}` },
    { icon: Mail, label: t("contact.email"), value: BIZ.email },
    { icon: Clock, label: t("contact.hours"), value: t("contact.hoursVal") },
  ];

  return (
    <section id="contact" className="scroll-mt-20 bg-cream py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="text-center">
          <span className="text-sm font-bold uppercase tracking-wider text-pink">
            {t("contact.eyebrow")}
          </span>
          <h2 className="font-head mt-2 text-3xl text-choco sm:text-5xl">
            {t("contact.title")}
          </h2>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {/* info */}
          <div className="rounded-[2rem] bg-white p-7 shadow-[0_10px_40px_-22px_rgba(58,35,24,0.25)] sm:p-9">
            <h3 className="font-head text-xl text-choco">{t("contact.branch")}</h3>
            <div className="mt-6 space-y-5">
              {rows.map((r, i) => (
                <div key={i} className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-pink-soft text-pink">
                    <r.icon size={20} />
                  </span>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-muted">
                      {r.label}
                    </div>
                    <div className="mt-0.5 font-semibold leading-snug text-choco">
                      {r.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-pink py-3.5 font-head text-sm text-white shadow-lg shadow-pink/25 transition-transform hover:scale-[1.02] active:scale-95"
              >
                {t("contact.whatsappBtn")}
              </a>
              <a
                href={`tel:+2${BIZ.phone}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-choco py-3.5 font-head text-sm text-white transition-transform hover:scale-[1.02] active:scale-95"
              >
                {t("contact.callBtn")}
              </a>
            </div>
          </div>

          {/* map */}
          <div className="overflow-hidden rounded-[2rem] shadow-[0_10px_40px_-22px_rgba(58,35,24,0.25)] min-h-[320px]">
            <iframe
              title="Donuts Time map"
              src={mapSrc}
              className="h-full min-h-[320px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
