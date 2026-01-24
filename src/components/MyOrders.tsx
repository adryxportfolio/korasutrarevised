import { motion } from 'framer-motion';
import { 
  Package, 
  ExternalLink,
  Truck,
  Clock,
  CheckCircle,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';

export function MyOrders() {
  const { customer } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="text-center">
        <Package className="w-12 h-12 text-accent mx-auto mb-3" />
        <h3 className="font-heading text-lg mb-2">Order Management</h3>
        <p className="text-sm text-muted-foreground">
          View and manage all your orders on your Kora Sutra account
        </p>
      </div>

      {/* Direct Link to Account */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-accent/10 border border-accent/20 rounded-lg space-y-4"
      >
        <div className="text-center">
          <p className="text-sm font-medium mb-1">Your Kora Sutra Account</p>
          <p className="text-xs text-muted-foreground">
            Track orders, view history, and manage your profile
          </p>
        </div>

        <div className="grid gap-2">
          <Button
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => window.open('https://account.korasutra.com', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Go to account.korasutra.com
          </Button>
        </div>
      </motion.div>

      {/* Order Status Guide */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase text-center">
          Order Status Guide
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center p-3 bg-secondary/30 rounded-lg">
            <CheckCircle className="w-5 h-5 mx-auto mb-1 text-accent" />
            <p className="text-xs font-medium">Confirmed</p>
          </div>
          <div className="text-center p-3 bg-secondary/30 rounded-lg">
            <Clock className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs font-medium">Processing</p>
          </div>
          <div className="text-center p-3 bg-secondary/30 rounded-lg">
            <Truck className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-xs font-medium">Shipped</p>
          </div>
          <div className="text-center p-3 bg-secondary/30 rounded-lg">
            <MapPin className="w-5 h-5 mx-auto mb-1 text-accent" />
            <p className="text-xs font-medium">Delivered</p>
          </div>
        </div>
      </div>

      {/* WhatsApp Support */}
      <div className="text-center pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Need help with an order?</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const message = `Hi, I need help with my order. My phone: ${customer?.countryCode || '+91'} ${customer?.phone || ''}`;
            window.open(`https://wa.me/917995862266?text=${encodeURIComponent(message)}`, '_blank');
          }}
          className="border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white"
        >
          Contact via WhatsApp
        </Button>
      </div>
    </div>
  );
}
