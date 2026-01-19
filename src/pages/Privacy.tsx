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
                We collect information you voluntarily provide, such as your name, email address, phone number, and shipping address when you make a purchase or subscribe to our newsletter. We may also collect basic analytics data to improve our website experience.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading mb-4">2. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">
                Your information is used to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Process and fulfill your orders</li>
                <li>Send you updates about new collections and offers</li>
                <li>Improve our website and services</li>
                <li>Respond to your inquiries</li>
                <li>Provide customer support</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading mb-4">3. Data Protection</h2>
              <p className="text-muted-foreground mb-4">
                We implement appropriate security measures to protect your personal information. We do not sell, trade, or transfer your information to third parties without your consent, except as required to fulfill your orders or comply with legal obligations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading mb-4">4. Payment & Purchase Data</h2>
              <p className="text-muted-foreground mb-4">
                All purchases are processed securely through Shopify's payment infrastructure. Payment information is handled directly by Shopify and their payment processors (such as Razorpay, PayPal, or other gateways). Kora Sutra does not store your complete credit card or payment details. Please refer to Shopify's privacy policy for information on how purchase and payment data is handled.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading mb-4">5. Cookies & Tracking</h2>
              <p className="text-muted-foreground mb-4">
                Our website uses cookies to enhance your browsing experience, remember your preferences, and analyze site traffic. Shopify may also use cookies for cart functionality and checkout processes. You can manage cookie preferences through your browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading mb-4">6. Your Rights</h2>
              <p className="text-muted-foreground mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Access your personal data</li>
                <li>Request correction of your data</li>
                <li>Request deletion of your data</li>
                <li>Unsubscribe from communications</li>
                <li>Opt-out of marketing emails</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading mb-4">7. Third-Party Services</h2>
              <p className="text-muted-foreground mb-4">
                We use Shopify to power our online store. Your data may be stored through Shopify's data storage, databases, and general applications. They store your data on a secure server behind a firewall. For more information, please review Shopify's Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading mb-4">8. Contact Us</h2>
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