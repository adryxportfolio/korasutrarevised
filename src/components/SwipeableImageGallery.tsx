import { useState, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageNode {
  node: {
    url: string;
    altText: string | null;
  };
}

interface SwipeableImageGalleryProps {
  images: ImageNode[];
  productTitle: string;
}

export function SwipeableImageGallery({ images, productTitle }: SwipeableImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [direction, setDirection] = useState(0);
  const constraintsRef = useRef(null);

  const navigateImage = (newDirection: number) => {
    setDirection(newDirection);
    const total = images.length;
    if (newDirection === -1) {
      setSelectedImage(prev => (prev - 1 + total) % total);
    } else {
      setSelectedImage(prev => (prev + 1) % total);
    }
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      navigateImage(-1);
    } else if (info.offset.x < -threshold) {
      navigateImage(1);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  return (
    <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full">
      {/* Vertical Thumbnails - Desktop */}
      {images.length > 1 && (
        <div className="hidden md:flex flex-col gap-2 w-16 lg:w-20 flex-shrink-0">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > selectedImage ? 1 : -1);
                setSelectedImage(index);
              }}
              className={`aspect-[3/4] overflow-hidden border-2 transition-all ${
                selectedImage === index 
                  ? 'border-foreground' 
                  : 'border-transparent hover:border-muted-foreground/50'
              }`}
            >
              <img
                src={image.node.url}
                alt={image.node.altText || `${productTitle} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
      
      {/* Main Image with Swipe */}
      <div className="flex-1 relative overflow-hidden" ref={constraintsRef}>
        <div className="aspect-[3/4] overflow-hidden bg-secondary/20 touch-pan-y">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={selectedImage}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              drag={images.length > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={handleDragEnd}
              className="w-full h-full cursor-grab active:cursor-grabbing"
            >
              {images[selectedImage]?.node && (
                <img
                  src={images[selectedImage].node.url}
                  alt={images[selectedImage].node.altText || productTitle}
                  className="w-full h-full object-cover pointer-events-none select-none"
                  draggable={false}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Image Navigation Arrows - Desktop */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => navigateImage(-1)}
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full items-center justify-center hover:bg-background transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigateImage(1)}
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full items-center justify-center hover:bg-background transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Swipe hint on mobile */}
        {images.length > 1 && (
          <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-background/60 backdrop-blur-sm rounded-full text-xs text-muted-foreground">
            Swipe to browse
          </div>
        )}
      </div>

      {/* Image Dots - Mobile */}
      {images.length > 1 && (
        <div className="md:hidden flex justify-center gap-2 py-3">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > selectedImage ? 1 : -1);
                setSelectedImage(index);
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                selectedImage === index ? 'bg-foreground' : 'bg-muted-foreground/30'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
