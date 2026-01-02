import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/shopify';

interface StickyMobileCartBarProps {
  price: {
    amount: string;
    currencyCode: string;
  };
  isAvailable: boolean;
  onAddToCart: () => void;
  productTitle: string;
}

export function StickyMobileCartBar({ 
  price, 
  isAvailable, 
  onAddToCart,
  productTitle 
}: StickyMobileCartBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-border shadow-lg">
      <div className="flex items-center justify-between gap-3 px-4 py-3 safe-area-inset-bottom">
        <div className="flex-1 min-w-0">
          <p className="text-lg font-heading">
            {formatPrice(price.amount, price.currencyCode)}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {productTitle}
          </p>
        </div>
        <Button
          onClick={onAddToCart}
          disabled={!isAvailable}
          className="flex-shrink-0 h-11 px-6 text-sm font-body uppercase tracking-wider bg-accent hover:bg-accent/90 rounded-full"
        >
          {isAvailable ? (
            <>
              <ShoppingBag className="w-4 h-4 mr-2" />
              Add to Cart
            </>
          ) : (
            'Sold Out'
          )}
        </Button>
      </div>
    </div>
  );
}
