import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Package, MapPin, Clock, CheckCircle, Truck, LogIn } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { MyOrders } from '@/components/MyOrders';

export default function OrderTracking() {
  const navigate = useNavigate();
  const { isAuthenticated, customer } = useAuthStore();

  return (
    <>
      <Helmet>
        <title>Track Your Order - Kora Sutra</title>
        <meta name="description" content="Track your Kora Sutra order status. View shipping updates and delivery information for your purchases." />
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
              {isAuthenticated 
                ? `Welcome back, ${customer?.name || 'Customer'}! View your order history below.`
                : 'Login to view and track your orders in real-time'}
            </p>
          </motion.div>

          {isAuthenticated ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-secondary/20 rounded-lg p-6 md:p-8 mb-8"
            >
              <MyOrders />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-secondary/20 rounded-lg p-6 md:p-8 mb-8 text-center"
            >
              <LogIn className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-heading mb-2">Login Required</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Please login with your phone number to view your orders
              </p>
              <Button 
                onClick={() => {
                  // This will be handled by clicking the user icon in navbar
                  const userButton = document.querySelector('[aria-label="Account"]') as HTMLButtonElement;
                  if (userButton) userButton.click();
                }}
                className="bg-accent hover:bg-accent/90"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login to View Orders
              </Button>
            </motion.div>
          )}

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
