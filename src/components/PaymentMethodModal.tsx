import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Banknote, Loader2 } from "lucide-react";
import { COD_FEE_AMOUNT } from "@/stores/cartStore";
import { formatPrice } from "@/lib/shopify";

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseAmount: number;
  currencyCode: string;
  onConfirm: (method: 'prepaid' | 'cod') => Promise<void>;
}

export const PaymentMethodModal = ({
  isOpen,
  onClose,
  baseAmount,
  currencyCode,
  onConfirm,
}: PaymentMethodModalProps) => {
  const [selected, setSelected] = useState<'prepaid' | 'cod'>('prepaid');
  const [isLoading, setIsLoading] = useState(false);

  const codTotal = baseAmount + COD_FEE_AMOUNT;
  const prepaidTotal = baseAmount;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(selected);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isLoading) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Choose Payment Method</DialogTitle>
          <DialogDescription className="font-body">
            Select how you'd like to pay for your order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Prepaid Option */}
          <button
            onClick={() => setSelected('prepaid')}
            className={`w-full flex items-start gap-4 p-4 rounded-sm border-2 text-left transition-all ${
              selected === 'prepaid'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/40'
            }`}
          >
            <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              selected === 'prepaid' ? 'border-primary' : 'border-muted-foreground'
            }`}>
              {selected === 'prepaid' && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <span className="font-heading font-semibold text-sm">Online / Prepaid</span>
              </div>
              <p className="text-xs text-muted-foreground font-body mt-1">
                UPI, Cards, Net Banking, Wallets — no extra charge
              </p>
              <p className="font-semibold text-sm mt-2">
                Total: {formatPrice(prepaidTotal.toString(), currencyCode)}
              </p>
            </div>
          </button>

          {/* COD Option */}
          <button
            onClick={() => setSelected('cod')}
            className={`w-full flex items-start gap-4 p-4 rounded-sm border-2 text-left transition-all ${
              selected === 'cod'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/40'
            }`}
          >
            <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              selected === 'cod' ? 'border-primary' : 'border-muted-foreground'
            }`}>
              {selected === 'cod' && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-primary" />
                <span className="font-heading font-semibold text-sm">Cash on Delivery (COD)</span>
              </div>
              <p className="text-xs text-muted-foreground font-body mt-1">
                Pay cash when your order arrives
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-secondary text-foreground px-2 py-0.5 rounded font-body border border-border">
                  + ₹{COD_FEE_AMOUNT} COD handling fee
                </span>
              </div>
              <p className="font-semibold text-sm mt-2">
                Total: {formatPrice(codTotal.toString(), currencyCode)}
              </p>
            </div>
          </button>
        </div>

        <Button
          onClick={handleConfirm}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Redirecting to Checkout...
            </>
          ) : (
            `Proceed to Checkout`
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
