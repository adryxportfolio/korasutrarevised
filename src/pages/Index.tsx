import { Helmet } from 'react-helmet-async';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { CollectionsSection } from '@/components/CollectionsSection';
import { ShopifyProducts } from '@/components/ShopifyProducts';
import { AboutSection } from '@/components/AboutSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { NewsletterSection } from '@/components/NewsletterSection';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Kora Sutra - Handcrafted Luxury Sarees | Premium Indian Textiles</title>
        <meta 
          name="description" 
          content="Discover Kora Sutra's exquisite collection of handcrafted sarees. Premium silk, cotton, and Banarasi sarees celebrating India's rich textile heritage." 
        />
        <meta name="keywords" content="sarees, silk sarees, handcrafted sarees, Indian textiles, luxury sarees, Banarasi, Kora Sutra" />
        <link rel="canonical" href="https://korasutra.com" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Kora Sutra",
            "description": "Premium handcrafted sarees celebrating India's textile heritage",
            "url": "https://korasutra.com",
            "logo": "https://korasutra.com/logo.png"
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
