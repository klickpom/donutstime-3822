import { MapPin, Phone, Mail, Clock, Facebook, Heart } from "lucide-react";
import { useLang } from "../lib/store";
import { useBiz } from "../lib/store";

const NAV = [
  { id: "home", href: "#home" },
  { id: "menu", href: "#menu" },
  { id: "about", href: "#about" },
  { id: "contact", href: "#contact" },
];

export function Footer() {
  const { t, lang } = useLang();
  const BIZ = useBiz();
  const addr = lang === "ar" ? BIZ.addressAr : BIZ.addressEn;

  return (
    <footer className="relative bg-[#2a1812] text-cream">
      {/* pink top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-pink/0 via-pink to-pink/0" />
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-2 lg:grid-cols-4">
        {/* brand */}
        <div className="lg:col-span-1">
          <div className="flex items-center">
            <img
              src="/images/logo-full-dark.png"
              alt="Donuts Time"
              className="h-14 w-auto object-contain"
            />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            {t("footer.tagline")}
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href={BIZ.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-pink"
              aria-label="facebook"
            >
              <Facebook size={18} />
            </a>
            <a
              href={`https://wa.me/${BIZ.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-pink"
              aria-label="whatsapp"
            >
              <Phone size={18} />
            </a>
          </div>
        </div>

        {/* quick links */}
        <div>
          <h4 className="font-head text-base text-white">{t("footer.quick")}</h4>
          <ul className="mt-4 space-y-2.5">
            {NAV.map((l) => (
              <li key={l.id}>
                <a
                  href={l.href}
                  className="text-sm text-white/70 transition-colors hover:text-pink"
                >
                  {t(`nav.${l.id}`)}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* contact */}
        <div>
          <h4 className="font-head text-base text-white">
            {t("footer.contact")}
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            <li className="flex items-start gap-2.5">
              <MapPin size={17} className="mt-0.5 shrink-0 text-pink" />
              <span>{addr}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={17} className="shrink-0 text-pink" />
              <a href={`tel:+2${BIZ.phone}`} className="hover:text-pink" dir="ltr">
                {BIZ.phone}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={17} className="shrink-0 text-pink" />
              <a href={`mailto:${BIZ.email}`} className="hover:text-pink">
                {BIZ.email}
              </a>
            </li>
          </ul>
        </div>

        {/* hours */}
        <div>
          <h4 className="font-head text-base text-white">{t("footer.hours")}</h4>
          <div className="mt-4 flex items-center gap-2.5 text-sm text-white/70">
            <Clock size={17} className="shrink-0 text-pink" />
            <span>{t("contact.hoursVal")}</span>
          </div>
        </div>
      </div>

      {/* bottom bar */}
      <div className="border-t border-white/[0.08] bg-black/15">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-white/55 sm:flex-row sm:px-8">
          <span>
            © {new Date().getFullYear()} Donuts Time. {t("footer.rights")}.
          </span>
          <span className="flex items-center gap-1.5">
            {t("footer.made")}{" "}
            <Heart size={13} className="text-pink" fill="currentColor" /> — عين شمس
          </span>
        </div>
      </div>
    </footer>
  );
}
