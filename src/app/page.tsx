import { Agentation } from "agentation";

import { Nav } from "@/client/components/nav";
import { Hero } from "@/client/components/hero";
import { Features } from "@/client/components/features";
import { KeyboardShortcuts } from "@/client/components/keyboard-shortcuts";
import { SearchRealtime } from "@/client/components/search-realtime";
import { AgentSection } from "@/client/components/agent-section";
import { Integrations } from "@/client/components/integrations";
import { Comparison } from "@/client/components/comparison";
import { Security } from "@/client/components/security";
import { Testimonials } from "@/client/components/testimonials";
import { Pricing } from "@/client/components/pricing";
import { FAQ } from "@/client/components/faq";
import { CTA } from "@/client/components/cta";
import { Footer } from "@/client/components/footer";

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
