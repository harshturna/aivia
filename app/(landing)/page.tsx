import Hero from "@/components/landing/hero";
import FeatureCards from "@/components/landing/feature-cards";
import Features from "@/components/landing/features";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <FeatureCards />
      <Features />
      <Footer />
    </main>
  );
}
