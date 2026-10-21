import type { Metadata } from "next";
import CTASection from "@/components/site/CTASection";
import FAQSection from "@/components/site/Faqsection";
import FeaturesSection from "@/components/site/FeaturesSection";
import Footer from "@/components/site/Footer";
import HeroSection from "@/components/site/HeroSection";
import HowItWorks from "@/components/site/HowItWorks";
import LiquidityProvidersSection from "@/components/site/LiquidityProvidersSection";
import Navbar from "@/components/site/Navbar";
import StatsSection from "@/components/site/StatsSection";
// import TeamSection from "@/components/site/TeamSection";
import TradersSection from "@/components/site/TradersSecion";
import TrustSection from "@/components/site/TrustSection";
import WhatYouCanCopy from "@/components/site/WhatYouCanCopy";
import WhyChooseUs from "@/components/site/WhyChooseUs";
import PagePreloader from "@/components/PagePreloader";

export const metadata: Metadata = {
  title: "Copy Futures, Options & Contracts with Precision",
  description:
    "TradeVerdify lets you mirror real-time stock, futures, and options trades from top-performing experts. AutoGuard™ protection, AI signals, zero commission — start copy trading today.",
  alternates: { canonical: "https://tradeverdify.com" },
  openGraph: {
    title: "TradeVerdify — Copy Futures, Options & Contracts with Precision",
    description:
      "Mirror real-time trades from top experts. AutoGuard™ risk management, AI signals, zero commission.",
    url: "https://tradeverdify.com",
    images: [{ url: "https://tradeverdify.com/opengraph-image.png", width: 1200, height: 630, alt: "TradeVerdify Copy Trading Platform" }],
  },
};

export default function Home() {
  return (
    <PagePreloader>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://tradeverdify.com/#organization",
                name: "TradeVerdify",
                url: "https://tradeverdify.com",
                logo: {
                  "@type": "ImageObject",
                  url: "https://tradeverdify.com/android-chrome-512x512.png",
                },
                sameAs: [],
                description:
                  "TradeVerdify is a copy trading platform for futures, options, and contracts. Mirror trades from top-performing experts with real-time precision.",
              },
              {
                "@type": "WebSite",
                "@id": "https://tradeverdify.com/#website",
                url: "https://tradeverdify.com",
                name: "TradeVerdify",
                publisher: { "@id": "https://tradeverdify.com/#organization" },
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: "https://tradeverdify.com/explore-traders?q={search_term_string}",
                  },
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@type": "WebPage",
                "@id": "https://tradeverdify.com/#webpage",
                url: "https://tradeverdify.com",
                name: "TradeVerdify — Copy Futures, Options & Contracts with Precision",
                isPartOf: { "@id": "https://tradeverdify.com/#website" },
                about: { "@id": "https://tradeverdify.com/#organization" },
                description:
                  "Mirror real-time stock and options trades from top-performing traders. Precision, flexibility, and transparency — straight to your fingertips.",
              },
              {
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "What is TradeVerdify?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "TradeVerdify is a copy trading platform that lets you mirror real-time trades from top-performing expert traders across futures, options, and contracts.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "How does copy trading work on TradeVerdify?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Sign up, choose an expert trader, set your investment amount, and TradeVerdify automatically mirrors every trade they make in your portfolio in real time.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "What is AutoGuard™?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "AutoGuard™ is TradeVerdify's proprietary risk management system that applies automatic stop-loss, trailing stops, and position-size limits to every copied trade.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Does TradeVerdify charge commission?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "No. TradeVerdify charges zero commission on US equity trades. There are no per-trade fees and no hidden charges.",
                    },
                  },
                ],
              },
            ],
          }),
        }}
      />
      <Navbar />
      <main className="pt-16 lg:pt-20">
        <HeroSection />
        <StatsSection />
        <HowItWorks />
        <WhyChooseUs />
        <TradersSection />
        <FeaturesSection />
        <WhatYouCanCopy />
        <FAQSection />
        {/* <TeamSection /> */}
        <TrustSection />
        <CTASection />
        <LiquidityProvidersSection />
        <Footer />
      </main>
    </PagePreloader>
  );
}
