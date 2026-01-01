import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function Cookies() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-heading font-light mb-8">Cookie Policy</h1>
          <p className="text-muted-foreground font-body mb-6">Last updated: January 2025</p>
          
          <div className="prose prose-lg max-w-none font-body text-foreground">
            <section className="mb-8">
              <h2 className="text-2xl font-heading mb-4">1. What Are Cookies</h2>
              <p className="text-muted-foreground mb-4">
                Cookies are small text files stored on your device when you visit our website. They help us provide you with a better browsing experience.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading mb-4">2. How We Use Cookies</h2>
              <p className="text-muted-foreground mb-4">
                We use cookies to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Remember your preferences</li>
                <li>Analyze website traffic and usage</li>
                <li>Improve website functionality</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading mb-4">3. Types of Cookies We Use</h2>
              <p className="text-muted-foreground mb-4">
                <strong>Essential Cookies:</strong> Required for basic website functionality.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading mb-4">4. Managing Cookies</h2>
              <p className="text-muted-foreground mb-4">
                You can control cookies through your browser settings. Note that disabling cookies may affect your browsing experience.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading mb-4">5. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                For questions about our cookie policy, contact us at korasutra.official@gmail.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
