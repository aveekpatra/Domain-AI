import NavbarLight from "@/components/NavbarLight";
import BackgroundTop from "@/components/BackgroundTop";
import Hero from "@/components/Hero";
import FeatureTiles from "@/components/FeatureTiles";
import DarkShowcase from "@/components/DarkShowcase";
import FAQAccordion from "@/components/FAQAccordion";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-page-bg text-page-text">
      <NavbarLight />
      <BackgroundTop />
      <main className="relative z-10">
        <Hero />
        <FeatureTiles />
        <DarkShowcase />
        <FAQAccordion />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
