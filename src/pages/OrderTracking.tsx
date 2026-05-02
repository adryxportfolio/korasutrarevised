import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Package, MapPin, Clock, CheckCircle, Truck, ExternalLink } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';

export default function OrderTracking() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://korasutra.com" },
      { "@type": "ListItem", position: 2, name: "Order Tracking", item: "https://korasutra.com/order-tracking" }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Track Your Order - Kora Sutra | Order Status & Delivery Updates</title>
        <meta name="description" content="Track your Kora Sutra order status. View shipping updates, delivery information, and order history for your handcrafted saree purchases." />
        <meta name="keywords" content="Kora Sutra order tracking, track order, shipping status, delivery updates, order history" />
        <link rel="canonical" href="https://korasutra.com/order-tracking" />

        <meta property="og:title" content="Track Your Order - Kora Sutra" />
        <meta property="og:description" content="Track your Kora Sutra order status and view shipping updates." />
        <meta property="og:url" content="https://korasutra.com/order-tracking" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://korasutra.com/og-image.png" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Track Your Order - Kora Sutra" />
        <meta name="twitter:description" content="Track your Kora Sutra order status and delivery updates." />

        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <Navbar />

      <main className="min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-heading mb-4">Track Your Orders</h1>
            <p className="text-muted-foreground font-body">
              View live tracking and order history on your Kora Sutra account portal.
            </p>
          </motion.div>

          {/* Real-time Tracking Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mb-8"
          >
            <div className="p-8 bg-accent/10 border border-accent/20 rounded-lg">
              <ExternalLink className="w-10 h-10 text-accent mx-auto mb-4" />
              <h3 className="font-heading text-lg mb-2">Real-Time Order Tracking</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Sign in with the same mobile number you used at checkout to view live updates and order history.
              </p>
              <Button
                onClick={() => window.open('https://account.korasutra.com', '_blank')}
                className="bg-accent hover:bg-accent/90"
                size="lg"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Go to account.korasutra.com
              </Button>
            </div>
          </motion.div>

          {/* Order Status Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-lg font-heading mb-4 text-center">Order Status Guide</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-secondary/10 rounded-lg">
                <CheckCircle className="w-6 h-6 mx-auto mb-2 text-accent" />
                <p className="text-sm font-medium">Confirmed</p>
                <p className="text-xs text-muted-foreground">Order placed</p>
              </div>
              <div className="text-center p-4 bg-secondary/10 rounded-lg">
                <Clock className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Processing</p>
                <p className="text-xs text-muted-foreground">Being prepared</p>
              </div>
              <div className="text-center p-4 bg-secondary/10 rounded-lg">
                <Truck className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Shipped</p>
                <p className="text-xs text-muted-foreground">On the way</p>
              </div>
              <div className="text-center p-4 bg-secondary/10 rounded-lg">
                <MapPin className="w-6 h-6 mx-auto mb-2 text-accent" />
                <p className="text-sm font-medium">Delivered</p>
                <p className="text-xs text-muted-foreground">At your door</p>
              </div>
            </div>
          </motion.div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 text-center border-t border-border pt-8"
          >
            <h3 className="font-heading mb-2">Need Help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              If you have questions about your order, contact us on WhatsApp
            </p>
            <Button
              onClick={() => {
                const message = `Hi, I need help with my order.`;
                window.open(`https://wa.me/917995862266?text=${encodeURIComponent(message)}`, '_blank');
              }}
              variant="outline"
              className="border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white"
            >
              Contact via WhatsApp
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
}
