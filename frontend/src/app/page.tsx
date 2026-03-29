import { CTASection } from "@/components/landing/CTASection";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { Footer } from "@/components/landing/Footer";
import { GridDotBackground } from "@/components/landing/GridBackground";
import { HeroSection } from "@/components/landing/Hero";
import { LandingNavbar } from "@/components/landing/Navbar";
import { PricingSection } from "@/components/landing/Pricing";
import { PurposeSection } from "@/components/landing/PurposeGrid";
import { ReviewsSection } from "@/components/landing/Reviews";

export default function Home() {
  return (
    <main className="relative text-white overflow-x-hidden bg-transparent">
      {/* 
        Global green-tinted grid+dot background — fixed behind all sections.
        The Hero has its own BackgroundRippleEffect that renders on top of this
        via its z-0 stacking, so this grid won't interfere.
      */}
      <GridDotBackground />

      <LandingNavbar />
      <HeroSection />
      <PurposeSection />
      <FeaturesGrid />
      <ReviewsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
