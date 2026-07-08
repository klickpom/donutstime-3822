import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useLang } from "../lib/store";

export function Hero() {
  const { t, lang } = useLang();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  return (
    <section
      id="home"
      className="relative overflow-hidden pt-[72px]"
    >
      {/* soft gradient bg */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_85%_10%,#ffe3ee_0%,#fff5f8_45%,#fffbf7_100%)]" />
      {/* sprinkle dots */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <span className="absolute left-[12%] top-[28%] h-3 w-3 rounded-full bg-pink/40" />
        <span className="absolute left-[22%] top-[60%] h-2 w-2 rounded-full bg-gold/50" />
        <span className="absolute right-[18%] top-[18%] h-2.5 w-2.5 rounded-full bg-pink/30" />
        <span className="absolute right-[8%] bottom-[20%] h-3 w-3 rounded-full bg-gold/40" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 md:py-16 lg:grid-cols-2 lg:gap-6 lg:py-20">
        {/* Image side */}
        <div className="relative order-1 mx-auto w-full max-w-[440px] lg:order-none lg:max-w-none">
          <div className="absolute inset-0 m-auto h-[88%] w-[88%] animate-blob rounded-full bg-gradient-to-br from-pink-soft to-pink/25 blur-[2px]" />
          <img
            src="/images/hero.png"
            alt="Donuts Time"
            className="animate-float relative z-10 mx-auto w-[86%] rounded-[2rem] object-cover shadow-2xl shadow-pink/20"
          />
        </div>

        {/* Text side */}
        <div
          className={`order-2 text-center lg:order-none ${
            lang === "ar" ? "lg:text-right" : "lg:text-left"
          }`}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-4 py-1.5 text-sm font-bold text-pink shadow-sm ring-1 ring-pink/15">
            <Sparkles size={15} />
            {t("hero.badge")}
          </span>

          <h1 className="font-head mt-5 text-[2.6rem] leading-[1.1] text-choco sm:text-6xl">
            <span className="text-pink">{t("hero.title1")}</span>
            <br />
            {t("hero.title2")}
          </h1>

          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-ink/70 lg:mx-0 sm:text-lg">
            {t("hero.sub")}
          </p>

          <div
            className={`mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center ${
              lang === "ar" ? "lg:justify-end" : "lg:justify-start"
            }`}
          >
            <a
              href="#menu"
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-pink px-8 py-4 font-head text-base text-white shadow-xl shadow-pink/30 transition-transform hover:scale-105 active:scale-95 sm:w-auto"
            >
              {t("hero.orderNow")}
              <Arrow
                size={18}
                className="transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1"
              />
            </a>
            <a
              href="#menu"
              className="flex w-full items-center justify-center rounded-full bg-white px-8 py-4 font-head text-base text-choco shadow-md ring-1 ring-choco/5 transition-transform hover:scale-105 active:scale-95 sm:w-auto"
            >
              {t("hero.seeMenu")}
            </a>
          </div>

          {/* Stats */}
          <div
            className={`mt-10 flex items-center justify-center gap-8 ${
              lang === "ar" ? "lg:justify-end" : "lg:justify-start"
            }`}
          >
            {[
              { v: t("hero.stat1v"), l: t("hero.stat1") },
              { v: t("hero.stat2v"), l: t("hero.stat2") },
              { v: t("hero.stat3v"), l: t("hero.stat3") },
            ].map((s, idx) => (
              <div key={idx} className="text-center">
                <div className="font-head text-3xl text-pink">{s.v}</div>
                <div className="mt-0.5 text-xs font-semibold text-muted">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
