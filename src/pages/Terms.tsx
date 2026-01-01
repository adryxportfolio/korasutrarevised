import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-heading font-light mb-8">Terms & Conditions</h1>
          <p className="text-muted-foreground font-body mb-6">Last updated: January 2025</p>
          
          <div className="prose prose-lg max-w-none font-body text-foreground">
            <section className="mb-8">
              <h2 className="text-2xl font-heading mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground mb-4">
                By accessing and using the Kora Sutra website, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading mb-4">2. Use of Website</h2>
              <p className="text-muted-foreground mb-4">
                This website is for informational and brand discovery purposes. All purchases are processed through our official Dukaan store at mydukaan.io/korasutra.
              </p>
              <p className="text-muted-foreground mb-4">
                You agree to use this website only for lawful purposes and in a way that does not infringe on the rights of others or restrict their use of the website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading mb-4">3. Intellectual Property</h2>
              <p className="text-muted-foreground mb-4">
                All content on this website, including text, images, logos, and designs, is the property of Kora Sutra and is protected by copyright and intellectual property laws. You may not reproduce, distribute, or use any content without our prior written consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading mb-4">4. Product Information</h2>
              <p className="text-muted-foreground mb-4">
                We strive to display our products accurately. However, slight variations in color may occur due to screen settings. For accurate product details and availability, please visit our official store.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading mb-4">5. External Links</h2>
              <p className="text-muted-foreground mb-4">
                This website contains links to our official Dukaan store. We are not responsible for the content or practices of any third-party websites.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading mb-4">6. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4">
                Kora Sutra shall not be liable for any indirect, incidental, or consequential damages arising from your use of this website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading mb-4">7. Changes to Terms</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on this website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading mb-4">8. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                For questions about these Terms & Conditions, please contact us at korasutra.official@gmail.com or call +91 79958 62266.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
