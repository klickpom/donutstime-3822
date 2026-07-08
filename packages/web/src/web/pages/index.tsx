import { Navbar } from "../components/navbar";
import { Hero } from "../components/hero";
import { MenuSection } from "../components/menu-section";
import { Features, About, Contact } from "../components/sections";
import { Footer } from "../components/footer";
import { CartPanel } from "../components/cart-panel";

export default function Index() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-cream text-choco">
      <Navbar />
      <main>
        <Hero />
        <MenuSection />
        <Features />
        <About />
        <Contact />
      </main>
      <Footer />
      <CartPanel />
    </div>
  );
}
