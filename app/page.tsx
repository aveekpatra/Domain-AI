import NavbarLight from "@/components/NavbarLight";
import BackgroundTop from "@/components/BackgroundTop";
import Hero from "@/components/Hero";
import FeatureTiles from "@/components/FeatureTiles";
import DarkShowcase from "@/components/DarkShowcase";
import UseCases from "@/components/UseCases";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900">
      <NavbarLight />
      <BackgroundTop />
      <main className="relative z-10">
        <Hero />
        <FeatureTiles />
        <DarkShowcase />
        <UseCases />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
