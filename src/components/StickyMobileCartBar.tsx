import { ShoppingBag, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/shopify';

export interface StickyMobileCartBarProps {
  price: {
    amount: string;
    currencyCode: string;
  };
  isAvailable: boolean;
  onAddToCart: () => void;
  productTitle: string;
  isLoading?: boolean;
}

const WHATSAPP_NUMBER = '917995862266';

export function StickyMobileCartBar({ 
  price, 
  isAvailable, 
  onAddToCart,
  productTitle,
  isLoading = false
}: StickyMobileCartBarProps) {
  const handleEnquiry = () => {
    const message = `Hi, I'm interested in ${productTitle}. Could you provide more details?`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-border shadow-lg safe-area-inset-bottom">
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Price */}
        <div className="flex-shrink-0 min-w-0">
          <p className="text-base font-heading leading-tight">
            {formatPrice(price.amount, price.currencyCode)}
          </p>
        </div>
        
        {/* Buttons */}
        <div className="flex-1 flex items-center gap-2 justify-end">
          <Button
            onClick={handleEnquiry}
            variant="outline"
            className="h-10 px-3 text-xs font-body uppercase tracking-wider rounded-full border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Enquire on WhatsApp
          </Button>
          <Button
            onClick={onAddToCart}
            disabled={!isAvailable || isLoading}
            className="h-10 px-4 text-xs font-body uppercase tracking-wider bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-full"
          >
            {!isAvailable ? (
              'Sold Out'
            ) : isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 mr-1" />
                Buy Now
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
