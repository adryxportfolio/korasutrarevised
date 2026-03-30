import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const POPUP_STORAGE_KEY = 'korasutra-first-buyer-popup-dismissed';

export function FirstTimeBuyerPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(POPUP_STORAGE_KEY);
    if (!dismissed) {
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem(POPUP_STORAGE_KEY, 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={handleDismiss}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative bg-background border border-border rounded-lg shadow-elegant max-w-sm w-full pointer-events-auto text-center overflow-hidden">
              {/* Close */}
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-secondary/50 transition-colors z-10"
                aria-label="Close popup"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Top accent bar */}
              <div className="h-1.5 bg-gradient-to-r from-accent via-primary to-accent" />

              <div className="px-6 py-8">
                <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                  <Gift className="w-7 h-7 text-accent" />
                </div>

                <h3 className="font-heading text-2xl text-foreground mb-1">
                  Welcome to Kora Sutra!
                </h3>
                <p className="text-muted-foreground font-body text-sm mb-4">
                  Enjoy an exclusive offer on your first purchase
                </p>

                <div className="bg-secondary/50 rounded-md py-4 px-3 mb-5">
                  <p className="font-price text-5xl md:text-6xl text-primary mb-1 font-bold">10% OFF</p>
                  <p className="text-muted-foreground text-xs font-body tracking-wide">
                    Use code at checkout
                  </p>
                  <span className="inline-block mt-2 px-4 py-1.5 border-2 border-dashed border-accent rounded font-heading text-lg text-accent tracking-widest">
                    FIRST10
                  </span>
                </div>

                <Link to="/collections/all" onClick={handleDismiss}>
                  <Button className="w-full rounded-sm font-body text-sm tracking-wide uppercase">
                    Shop Now
                  </Button>
                </Link>

                <p className="text-muted-foreground text-[10px] font-body mt-3">
                  *Valid for first-time buyers only. Cannot be combined with other offers.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
