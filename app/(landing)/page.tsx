import Hero from "@/components/landing/hero";
import Features from "@/components/landing/features";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import Pricing from "@/components/landing/pricing";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <Footer />
    </main>
  );
}
