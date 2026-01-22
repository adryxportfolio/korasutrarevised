import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Package, Search, ExternalLink, Loader2, MapPin, Clock, CheckCircle, Truck } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

const SHOPIFY_STORE_DOMAIN = 'korasutrarevised-iv76s.myshopify.com';

export default function OrderTracking() {
  const navigate = useNavigate();
  const { isAuthenticated, customer } = useAuthStore();
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Pre-fill email if customer is logged in
    if (customer?.email) {
      setEmail(customer.email);
    }
  }, [customer]);

  const handleTrackOrder = () => {
    if (!orderNumber.trim()) {
      toast.error('Please enter your order number', { position: 'top-center' });
      return;
    }
    if (!email.trim()) {
      toast.error('Please enter your email address', { position: 'top-center' });
      return;
    }

    setIsSearching(true);
    
    // Redirect to Shopify's order status page
    // Format: https://store.myshopify.com/account/orders/ORDER_NUMBER
    // Or use the generic order status lookup
    const orderStatusUrl = `https://${SHOPIFY_STORE_DOMAIN}/account/login?checkout_url=/account/orders`;
    
    toast.success('Redirecting to order lookup...', { position: 'top-center' });
    setTimeout(() => {
      window.location.href = orderStatusUrl;
    }, 500);
  };

  const handleViewAllOrders = () => {
    // Redirect to Shopify account page
    const accountUrl = `https://${SHOPIFY_STORE_DOMAIN}/account`;
    window.location.href = accountUrl;
  };

  return (
    <>
      <Helmet>
        <title>Track Your Order - Kora Sutra</title>
        <meta name="description" content="Track your Kora Sutra order status. Enter your order number to see shipping updates and delivery information." />
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
            <h1 className="text-3xl md:text-4xl font-heading mb-4">Track Your Order</h1>
            <p className="text-muted-foreground font-body">
              Enter your order details to check the status of your purchase
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-secondary/20 rounded-lg p-6 md:p-8 mb-8"
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="orderNumber" className="block text-sm font-medium mb-2">
                  Order Number
                </label>
                <Input
                  id="orderNumber"
                  type="text"
                  placeholder="e.g., #1001"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You can find this in your order confirmation email
                </p>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
              </div>

              <Button
                onClick={handleTrackOrder}
                disabled={isSearching}
                className="w-full"
                size="lg"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Track Order
                  </>
                )}
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
                <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-medium">Confirmed</p>
                <p className="text-xs text-muted-foreground">Order placed</p>
              </div>
              <div className="text-center p-4 bg-secondary/10 rounded-lg">
                <Clock className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                <p className="text-sm font-medium">Processing</p>
                <p className="text-xs text-muted-foreground">Being prepared</p>
              </div>
              <div className="text-center p-4 bg-secondary/10 rounded-lg">
                <Truck className="w-6 h-6 mx-auto mb-2 text-blue-600" />
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

          {/* View All Orders - For logged in users */}
          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <p className="text-muted-foreground mb-4">
                Signed in as {customer?.name || customer?.phone}
              </p>
              <Button
                onClick={handleViewAllOrders}
                variant="outline"
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View All Orders on Shopify
              </Button>
            </motion.div>
          )}

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 text-center border-t border-border pt-8"
          >
            <h3 className="font-heading mb-2">Need Help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              If you have questions about your order, contact us on WhatsApp
            </p>
            <Button
              onClick={() => {
                const message = `Hi, I need help with my order${orderNumber ? ` #${orderNumber}` : ''}.`;
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
