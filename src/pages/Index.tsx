import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { CollectionsSection } from "@/components/CollectionsSection";
import { ShopifyProducts } from "@/components/ShopifyProducts";
import { AboutSection } from "@/components/AboutSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { NewsletterSection } from "@/components/NewsletterSection";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>KoraSutra - Handcrafted Luxury Sarees | Premium Indian Textiles</title>
        <meta
          name="description"
          content="Discover KoraSutra's exquisite collection of handcrafted sarees. Premium silk,tussar, muslin, and linen sarees celebrating Bengal's rich textile heritage."
        />
        <meta
          name="keywords"
          content="KoraSutra, sarees, silk sarees, handcrafted sarees, Indian textiles,Muslin, Linen, Silk, Handloom luxury sarees, Kora Sutra"
        />
        <link rel="canonical" href="https://korasutra.com" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Kora Sutra",
            description: "Premium handcrafted sarees celebrating bengal's textile heritage",
            url: "https://korasutra.com",
            logo: "https://korasutra.com/logo.png",
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <HeroSection />
          <CollectionsSection />
          <ShopifyProducts />
          <AboutSection />
          <TestimonialsSection />
          <NewsletterSection />
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    </>
  );
};

export default Index;
