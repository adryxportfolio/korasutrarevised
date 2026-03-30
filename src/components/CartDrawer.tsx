import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingBag, Minus, Plus, Trash2, ExternalLink, Loader2, User, MapPin, LogOut, Truck } from "lucide-react";
import { useCartStore, COD_FEE_VARIANT_ID } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { formatPrice, createStorefrontCheckout } from "@/lib/shopify";
import { toast } from "sonner";
import { OTPAuthModal } from "./OTPAuthModal";
import { PaymentMethodModal } from "./PaymentMethodModal";

export const CartDrawer = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const {
    items,
    isLoading,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCartStore();

  const { isAuthenticated, customer, logout } = useAuthStore();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);
  const currencyCode = items[0]?.price.currencyCode || 'INR';

  const handleOpenAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully', { position: 'top-center' });
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty', { position: 'top-center' });
      return;
    }

    if (!isAuthenticated) {
      toast.error('Sign in required', {
        description: 'Please sign in with your mobile number to place an order.',
        position: 'top-center',
      });
      setIsAuthModalOpen(true);
      return;
    }

    // Open payment method modal
    setIsPaymentModalOpen(true);
  };

  const handleCartCheckout = async (method: 'prepaid' | 'cod') => {
    setIsCheckingOut(true);
    try {
      const cartItems = items.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      // Add COD fee line item if COD selected
      if (method === 'cod') {
        cartItems.push({ variantId: COD_FEE_VARIANT_ID, quantity: 1 });
      }

      const checkoutUrl = await createStorefrontCheckout(cartItems);

      if (checkoutUrl) {
        toast.success('Redirecting to checkout...', { position: 'top-center' });
        clearCart();
        setIsOpen(false);
        setIsPaymentModalOpen(false);
        window.open(checkoutUrl, '_blank');
      } else {
        toast.error('Failed to create checkout', {
          description: 'Please try again',
          position: 'top-center',
        });
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      toast.error('Checkout failed', {
        description: error instanceof Error ? error.message : 'Please try again',
        position: 'top-center',
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button className="p-2 hover:bg-secondary/50 rounded-full transition-colors relative">
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-accent text-accent-foreground">
                {totalItems}
              </Badge>
            )}
          </button>
        </SheetTrigger>

        <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
          <SheetHeader className="flex-shrink-0">
            <SheetTitle className="font-heading">Shopping Cart</SheetTitle>
            <SheetDescription className="font-body">
              {totalItems === 0 ? "Your cart is empty" : `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart`}
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col flex-1 pt-6 min-h-0">
            {items.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-body">Your cart is empty</p>
                </div>
              </div>
            ) : (
              <>
                {/* Scrollable items area */}
                <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.variantId} className="flex gap-4 p-3 bg-secondary/20 rounded-sm">
                        <div className="w-16 h-20 bg-secondary/30 rounded-sm overflow-hidden flex-shrink-0">
                          {item.product.node.images?.edges?.[0]?.node && (
                            <img
                              src={item.product.node.images.edges[0].node.url}
                              alt={item.product.node.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-heading text-sm truncate">{item.product.node.title}</h4>
                          {item.variantTitle !== 'Default Title' && (
                            <p className="text-xs text-muted-foreground font-body">
                              {item.selectedOptions.map(option => option.value).join(' • ')}
                            </p>
                          )}
                          <p className="font-semibold text-sm mt-1 font-price">
                            {formatPrice(item.price.amount, item.price.currencyCode)}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeItem(item.variantId)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-body">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              disabled={item.quantity >= (item.maxQuantity || 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fixed checkout section */}
                <div className="flex-shrink-0 space-y-4 pt-4 border-t border-border bg-background">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-heading">Subtotal</span>
                    <span className="text-xl font-bold">
                      {formatPrice(subtotal.toString(), currencyCode)}
                    </span>
                  </div>

                  {/* Mandatory Sign In Notice */}
                  {!isAuthenticated && (
                    <div className="flex items-center gap-2 p-2.5 bg-accent/10 border border-accent/30 rounded-sm text-xs font-body text-foreground/80">
                      <span>🔒</span>
                      <span>Sign in with your mobile number to place an order — required for all purchases.</span>
                    </div>
                  )}

                  {/* Checkout Button */}
                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    size="lg"
                    disabled={items.length === 0 || isLoading || isCheckingOut}
                  >
                    {isLoading || isCheckingOut ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Checkout...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {isAuthenticated ? 'Proceed to Checkout' : 'Sign In to Checkout'}
                      </>
                    )}
                  </Button>

                  {/* Secure Checkout Badges */}
                  <div className="flex items-center justify-center gap-4 pt-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      <span className="text-[10px]">Secure</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                        <path d="m9 12 2 2 4-4"/>
                      </svg>
                      <span className="text-[10px]">Verified</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect width="20" height="14" x="2" y="5" rx="2"/>
                        <line x1="2" x2="22" y1="10" y2="10"/>
                      </svg>
                      <span className="text-[10px]">SSL 256-bit</span>
                    </div>
                  </div>

                  {/* Auth Section */}
                  {isAuthenticated && customer ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{customer.name || 'Customer'}</p>
                          <p className="text-xs text-muted-foreground">{customer.phone}</p>
                        </div>
                        <Button
                          onClick={handleLogout}
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                        >
                          <LogOut className="w-3 h-3 mr-1" />
                          Logout
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setIsOpen(false);
                            navigate('/order-tracking');
                          }}
                          variant="ghost"
                          className="flex-1 text-xs"
                          size="sm"
                        >
                          <Truck className="w-3 h-3 mr-1" />
                          My Orders
                        </Button>
                        <Button
                          onClick={handleOpenAuthModal}
                          variant="ghost"
                          className="flex-1 text-xs"
                          size="sm"
                        >
                          <MapPin className="w-3 h-3 mr-1" />
                          Addresses
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={handleOpenAuthModal}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Sign In / Sign Up
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* OTP Auth Modal */}
      <OTPAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Payment Method Modal */}
      <PaymentMethodModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        baseAmount={subtotal}
        currencyCode={currencyCode}
        onConfirm={handleCartCheckout}
      />
    </>
  );
};
