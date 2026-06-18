import { Agentation } from "agentation";

import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { SearchRealtime } from "@/components/search-realtime";
import { AgentSection } from "@/components/agent-section";
import { Integrations } from "@/components/integrations";
import { Comparison } from "@/components/comparison";
import { Security } from "@/components/security";
import { Testimonials } from "@/components/testimonials";
import { Pricing } from "@/components/pricing";
import { FAQ } from "@/components/faq";
import { CTA } from "@/components/cta";
import { Footer } from "@/components/footer";

export default function UnigentLanding() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />

      {/* Trust Strip */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-y border-border">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-muted-foreground text-sm">
            Built on Unigent — the AI agent layer powering hundreds of automated
            workflows.
          </p>
        </div>
      </section>

      <Features />
      <KeyboardShortcuts />
      <SearchRealtime />
      <AgentSection />
      <Integrations />
      <Comparison />
      <Security />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
      {process.env.NODE_ENV === "development" && <Agentation />}
    </div>
  );
}
