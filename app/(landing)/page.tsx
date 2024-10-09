import Hero from "@/components/landing/hero";
import FeatureCards from "@/components/landing/feature-cards";
import Features from "@/components/landing/features";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import Pricing from "@/components/landing/pricing";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <FeatureCards />
      <Features />
      <Pricing />
      <Footer />
    </main>
  );
}
