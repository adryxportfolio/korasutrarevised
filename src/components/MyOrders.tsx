import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  Truck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MapPin,
  ExternalLink,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface OrderLineItem {
  id: number;
  title: string;
  quantity: number;
  price: string;
  variantTitle: string | null;
  sku: string | null;
}

interface OrderFulfillment {
  id: number;
  status: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  trackingCompany: string | null;
  createdAt: string;
}

interface ShippingAddress {
  name: string;
  address1: string;
  address2: string | null;
  city: string;
  province: string;
  zip: string;
  country: string;
}

interface Order {
  id: number;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  financialStatus: string;
  fulfillmentStatus: string | null;
  totalPrice: string;
  currency: string;
  cancelReason: string | null;
  cancelledAt: string | null;
  lineItems: OrderLineItem[];
  shippingAddress: ShippingAddress | null;
  fulfillments: OrderFulfillment[];
  canCancel: boolean;
}

const cancelReasons = [
  { value: 'changed_mind', label: 'Changed my mind' },
  { value: 'found_cheaper', label: 'Found a better price elsewhere' },
  { value: 'wrong_item', label: 'Ordered wrong item' },
  { value: 'other', label: 'Other reason' },
];

export function MyOrders() {
  const { customer, sessionToken } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedCancelReason, setSelectedCancelReason] = useState('changed_mind');
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  const fetchOrders = async () => {
    if (!customer || !sessionToken) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-customer-orders', {
        body: {
          phone: customer.phone,
          countryCode: customer.countryCode,
          email: customer.email,
          customerId: customer.id,
        },
        headers: { 'x-session-token': sessionToken },
      });

      if (error) throw error;

      if (data?.success) {
        setOrders(data.orders || []);
      } else {
        throw new Error(data?.error || 'Failed to fetch orders');
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [customer, sessionToken]);

  const toggleOrderExpanded = (orderId: number) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel || !sessionToken) return;

    setCancellingOrderId(orderToCancel.id);
    setCancelDialogOpen(false);

    try {
      const { data, error } = await supabase.functions.invoke('cancel-order', {
        body: {
          orderId: orderToCancel.id,
          reason: selectedCancelReason,
        },
        headers: { 'x-session-token': sessionToken },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Order cancelled successfully');
        // Refresh orders
        await fetchOrders();
      } else {
        throw new Error(data?.error || 'Failed to cancel order');
      }
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      toast.error(error.message || 'Failed to cancel order');
    } finally {
      setCancellingOrderId(null);
      setOrderToCancel(null);
    }
  };

  const getStatusBadge = (order: Order) => {
    if (order.cancelledAt) {
      return <Badge variant="destructive" className="text-xs">Cancelled</Badge>;
    }
    
    if (order.fulfillmentStatus === 'fulfilled') {
      return <Badge className="bg-accent text-accent-foreground text-xs">Delivered</Badge>;
    }
    
    if (order.fulfillmentStatus === 'partial') {
      return <Badge className="bg-primary text-primary-foreground text-xs">Partially Shipped</Badge>;
    }
    
    if (order.fulfillments.length > 0) {
      return <Badge className="bg-primary text-primary-foreground text-xs">Shipped</Badge>;
    }
    
    if (order.financialStatus === 'paid') {
      return <Badge className="bg-secondary text-secondary-foreground text-xs">Processing</Badge>;
    }
    
    if (order.financialStatus === 'pending') {
      return <Badge variant="outline" className="text-xs">Payment Pending</Badge>;
    }
    
    return <Badge variant="secondary" className="text-xs">Confirmed</Badge>;
  };

  const getStatusIcon = (order: Order) => {
    if (order.cancelledAt) return <XCircle className="w-5 h-5 text-destructive" />;
    if (order.fulfillmentStatus === 'fulfilled') return <CheckCircle className="w-5 h-5 text-accent" />;
    if (order.fulfillments.length > 0) return <Truck className="w-5 h-5 text-primary" />;
    return <Clock className="w-5 h-5 text-muted-foreground" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
    }).format(parseFloat(amount));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
        <p className="text-muted-foreground">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="font-heading text-lg mb-2">No orders yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          When you place an order, it will appear here
        </p>
        <Button onClick={fetchOrders} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg">My Orders</h3>
        <Button onClick={fetchOrders} variant="ghost" size="sm" disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Link to Shopify Account for Real-time Tracking */}
      <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <ExternalLink className="w-4 h-4 text-accent flex-shrink-0" />
            <p className="text-sm text-muted-foreground truncate">
              For real-time tracking updates
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 border-accent/50 hover:bg-accent hover:text-accent-foreground"
            onClick={() => window.open('https://account.korasutra.com', '_blank')}
          >
            Track Live
          </Button>
        </div>
      </div>

      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-border rounded-lg overflow-hidden"
          >
            {/* Order Header */}
            <button
              onClick={() => toggleOrderExpanded(order.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(order)}
                <div className="text-left">
                  <p className="font-medium text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(order)}
                <p className="font-semibold text-sm">{formatCurrency(order.totalPrice, order.currency)}</p>
                {expandedOrders.has(order.id) ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </button>

            {/* Order Details */}
            <AnimatePresence>
              {expandedOrders.has(order.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-border"
                >
                  <div className="p-4 space-y-4">
                    {/* Order Items */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase">Items</p>
                      {order.lineItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <div>
                            <p className="font-medium">{item.title}</p>
                            {item.variantTitle && item.variantTitle !== 'Default Title' && (
                              <p className="text-xs text-muted-foreground">{item.variantTitle}</p>
                            )}
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium">{formatCurrency(item.price, order.currency)}</p>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Shipping Address
                        </p>
                        <p className="text-sm">
                          {order.shippingAddress.name}<br />
                          {order.shippingAddress.address1}
                          {order.shippingAddress.address2 && <>, {order.shippingAddress.address2}</>}<br />
                          {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.zip}<br />
                          {order.shippingAddress.country}
                        </p>
                      </div>
                    )}

                    {/* Tracking Info */}
                    {order.fulfillments.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                          <Truck className="w-3 h-3" /> Tracking
                        </p>
                        {order.fulfillments.map((fulfillment) => (
                          <div key={fulfillment.id} className="bg-secondary/30 p-3 rounded-md">
                            <div className="flex items-center justify-between">
                              <div>
                                {fulfillment.trackingCompany && (
                                  <p className="text-sm font-medium">{fulfillment.trackingCompany}</p>
                                )}
                                {fulfillment.trackingNumber && (
                                  <p className="text-xs text-muted-foreground">
                                    Tracking #: {fulfillment.trackingNumber}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  Shipped on {formatDate(fulfillment.createdAt)}
                                </p>
                              </div>
                              {fulfillment.trackingUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(fulfillment.trackingUrl!, '_blank')}
                                >
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  Track
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Cancel Reason (if cancelled) */}
                    {order.cancelledAt && (
                      <div className="bg-destructive/10 p-3 rounded-md">
                        <p className="text-sm text-destructive flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Cancelled on {formatDate(order.cancelledAt)}
                          {order.cancelReason && ` - ${order.cancelReason}`}
                        </p>
                      </div>
                    )}

                    {/* Cancel Button */}
                    {order.canCancel && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        disabled={cancellingOrderId === order.id}
                        onClick={() => {
                          setOrderToCancel(order);
                          setCancelDialogOpen(true);
                        }}
                      >
                        {cancellingOrderId === order.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel Order
                          </>
                        )}
                      </Button>
                    )}

                    {/* Contact Support */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        const message = `Hi, I need help with my order ${order.orderNumber}.`;
                        window.open(`https://wa.me/917995862266?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                    >
                      Need Help? Contact Support
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Cancel Order Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order {orderToCancel?.orderNumber}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Please select a reason for cancellation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <RadioGroup value={selectedCancelReason} onValueChange={setSelectedCancelReason} className="space-y-2">
            {cancelReasons.map((reason) => (
              <div key={reason.value} className="flex items-center space-x-2">
                <RadioGroupItem value={reason.value} id={reason.value} />
                <Label htmlFor={reason.value} className="text-sm cursor-pointer">{reason.label}</Label>
              </div>
            ))}
          </RadioGroup>

          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelOrder} className="bg-destructive hover:bg-destructive/90">
              Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
