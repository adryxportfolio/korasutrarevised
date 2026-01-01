import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-heading font-light mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground font-body mb-6">Last updated: January 2025</p>
          
          <div className="prose prose-lg max-w-none font-body text-foreground">
            <section className="mb-8">
              <h2 className="text-2xl font-heading mb-4">1. Information We Collect</h2>
              <p className="text-muted-foreground mb-4">
                We collect information you voluntarily provide, such as your phone number when subscribing to our newsletter. We may also collect basic analytics data to improve our website experience.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading mb-4">2. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">
                Your information is used to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Send you updates about new collections and offers</li>
                <li>Improve our website and services</li>
                <li>Respond to your inquiries</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading mb-4">3. Data Protection</h2>
              <p className="text-muted-foreground mb-4">
                We implement appropriate security measures to protect your personal information. We do not sell, trade, or transfer your information to third parties without your consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading mb-4">4. Purchase Data</h2>
              <p className="text-muted-foreground mb-4">
                All purchases are processed through our official Dukaan store. Please refer to Dukaan's privacy policy for information on how purchase data is handled.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading mb-4">5. Your Rights</h2>
              <p className="text-muted-foreground mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Access your personal data</li>
                <li>Request correction of your data</li>
                <li>Request deletion of your data</li>
                <li>Unsubscribe from communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading mb-4">6. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                For privacy-related inquiries, contact us at korasutra.official@gmail.com or call +91 79958 62266.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
