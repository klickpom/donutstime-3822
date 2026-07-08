import { useState } from "react";
import { useLocation } from "wouter";
import { Lock, Mail, Loader2 } from "lucide-react";
import { authClient, captureToken } from "../lib/auth";
import { useLang } from "../lib/store";

export default function SignIn() {
  const { t, lang } = useLang();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authClient.signIn.email(
        { email, password },
        { onSuccess: captureToken },
      );
      if (res.error) {
        setError(t("admin.wrong"));
        setLoading(false);
        return;
      }
      navigate("/admin");
    } catch {
      setError(t("admin.wrong"));
      setLoading(false);
    }
  };

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="grid min-h-screen place-items-center bg-[radial-gradient(120%_90%_at_85%_10%,#ffe3ee_0%,#fff5f8_45%,#fffbf7_100%)] px-5"
    >
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <img
            src="/images/logo-donut.png"
            alt="Donuts Time"
            className="h-16 w-16 object-contain drop-shadow"
          />
          <h1 className="font-head mt-4 text-2xl text-choco">
            {t("admin.signinTitle")}
          </h1>
          <p className="mt-1 text-sm text-muted">{t("admin.signinSub")}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] bg-white p-7 shadow-[0_20px_60px_-30px_rgba(255,61,127,0.5)]"
        >
          <label className="mb-1.5 block text-sm font-bold text-choco">
            {t("admin.email")}
          </label>
          <div className="mb-4 flex items-center gap-2 rounded-2xl border-2 border-pink-soft bg-pink-tint px-4 focus-within:border-pink">
            <Mail size={18} className="text-pink" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
              placeholder="admin@donutstime.com"
              className="w-full bg-transparent py-3.5 text-[15px] text-choco outline-none placeholder:text-muted/60"
            />
          </div>

          <label className="mb-1.5 block text-sm font-bold text-choco">
            {t("admin.password")}
          </label>
          <div className="mb-5 flex items-center gap-2 rounded-2xl border-2 border-pink-soft bg-pink-tint px-4 focus-within:border-pink">
            <Lock size={18} className="text-pink" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
              placeholder="••••••••"
              className="w-full bg-transparent py-3.5 text-[15px] text-choco outline-none placeholder:text-muted/60"
            />
          </div>

          {error && (
            <p className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-center text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-pink py-4 font-head text-base text-white shadow-lg shadow-pink/30 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? t("admin.loggingIn") : t("admin.login")}
          </button>

          <a
            href="/"
            className="mt-4 block text-center text-sm font-semibold text-muted hover:text-pink"
          >
            {t("admin.backToSite")}
          </a>
        </form>
      </div>
    </div>
  );
}
