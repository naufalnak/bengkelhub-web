"use client";

// app/page.tsx

import { useQuery } from "@tanstack/react-query";
import { workshopApi } from "@/lib/api";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturedWorkshops } from "@/components/landing/featured-workshops";
import { Features } from "@/components/landing/features";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  const { data: workshops = [] } = useQuery({
    queryKey: ["workshops-public"],
    queryFn: workshopApi.list,
    staleTime: 1000 * 60 * 5,
  });

  const activeWorkshops = workshops.filter((w) => w.is_active);

  return (
    <main className="min-h-screen">
      <LandingNavbar />
      <Hero totalWorkshops={workshops.length} />
      <HowItWorks />
      <FeaturedWorkshops workshops={activeWorkshops} />
      <Features />
      <CTA />
      <Footer />
    </main>
  );
}
