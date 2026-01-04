import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
export default function SizeGuide() {
  return <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-heading font-light mb-8">Size Guide</h1>
          <p className="text-muted-foreground font-body mb-8">
            Find the perfect fit with our comprehensive size guide for sarees.
          </p>
          
          <div className="prose prose-lg max-w-none font-body text-foreground">
            <section className="mb-12">
              <h2 className="text-2xl font-heading mb-6">Saree Dimensions</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-secondary/30 rounded-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-heading">Saree Type</th>
                      <th className="text-left p-4 font-heading">Length</th>
                      <th className="text-left p-4 font-heading">Width</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border">
                      <td className="p-4">Standard Saree</td>
                      <td className="p-4">6.5 meters (6 yards)</td>
                      <td className="p-4">1.16 meters (46 inches)</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-4">With Blouse Piece</td>
                      <td className="p-4">6.3 meters (including 0.8m blouse)</td>
                      <td className="p-4">1.1 meters (44 inches)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading mb-6">Need Help?</h2>
              <p className="text-muted-foreground mb-4">
                If you need assistance with sizing or have any questions, please don't hesitate to contact us:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground">
                <li>Email: korasutra.official@gmail.com</li>
                <li>Phone: +91 79958 62266</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>;
}