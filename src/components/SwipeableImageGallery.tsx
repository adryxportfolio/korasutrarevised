import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

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
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const constraintsRef = useRef(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const initialPinchDistance = useRef<number | null>(null);
  const lastTouchPosition = useRef<{ x: number; y: number; time: number } | null>(null);
  const momentumAnimationRef = useRef<number | null>(null);

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
    if (isZoomed) return;
    const threshold = 50;
    if (info.offset.x > threshold) {
      navigateImage(-1);
    } else if (info.offset.x < -threshold) {
      navigateImage(1);
    }
  };

  const resetZoom = useCallback(() => {
    if (momentumAnimationRef.current) {
      cancelAnimationFrame(momentumAnimationRef.current);
    }
    setIsZoomed(false);
    setZoomScale(1);
    setVelocity({ x: 0, y: 0 });
  }, []);

  // Momentum-based animation for smooth panning
  const applyMomentum = useCallback(() => {
    const friction = 0.92;
    const minVelocity = 0.5;

    setVelocity(prev => {
      const newVx = prev.x * friction;
      const newVy = prev.y * friction;

      if (Math.abs(newVx) < minVelocity && Math.abs(newVy) < minVelocity) {
        return { x: 0, y: 0 };
      }

      setZoomPosition(pos => ({
        x: Math.max(0, Math.min(100, pos.x - newVx * 0.5)),
        y: Math.max(0, Math.min(100, pos.y - newVy * 0.5))
      }));

      momentumAnimationRef.current = requestAnimationFrame(applyMomentum);
      return { x: newVx, y: newVy };
    });
  }, []);

  // Calculate distance between two touch points
  const getTouchDistance = (touches: React.TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Get center point of two touches
  const getTouchCenter = (touches: React.TouchList, rect: DOMRect) => {
    const x = ((touches[0].clientX + touches[1].clientX) / 2 - rect.left) / rect.width * 100;
    const y = ((touches[0].clientY + touches[1].clientY) / 2 - rect.top) / rect.height * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Cancel any ongoing momentum animation
    if (momentumAnimationRef.current) {
      cancelAnimationFrame(momentumAnimationRef.current);
      momentumAnimationRef.current = null;
    }
    setVelocity({ x: 0, y: 0 });

    if (e.touches.length === 2) {
      // Start pinch zoom
      initialPinchDistance.current = getTouchDistance(e.touches);
      
      const container = imageContainerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const center = getTouchCenter(e.touches, rect);
        if (!isZoomed) {
          setZoomPosition(center);
        }
      }
    } else if (e.touches.length === 1 && isZoomed) {
      // Track touch position for momentum calculation
      lastTouchPosition.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };
    }
  }, [isZoomed]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const container = imageContainerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    
    // Handle pinch zoom with two fingers
    if (e.touches.length === 2 && initialPinchDistance.current) {
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches);
      const scale = currentDistance / initialPinchDistance.current;
      
      const newScale = Math.max(1, Math.min(4, zoomScale * scale));
      setZoomScale(newScale);
      setIsZoomed(newScale > 1);
      
      const center = getTouchCenter(e.touches, rect);
      setZoomPosition(center);
      
      initialPinchDistance.current = currentDistance;
    } 
    // Handle single finger pan when zoomed with velocity tracking
    else if (isZoomed && e.touches.length === 1) {
      const touch = e.touches[0];
      const x = ((touch.clientX - rect.left) / rect.width) * 100;
      const y = ((touch.clientY - rect.top) / rect.height) * 100;
      
      // Calculate velocity for momentum
      if (lastTouchPosition.current) {
        const dt = Math.max(1, Date.now() - lastTouchPosition.current.time);
        const dx = touch.clientX - lastTouchPosition.current.x;
        const dy = touch.clientY - lastTouchPosition.current.y;
        
        setVelocity({
          x: (dx / dt) * 16, // Normalize to ~60fps
          y: (dy / dt) * 16
        });
      }
      
      lastTouchPosition.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
      
      setZoomPosition({ 
        x: Math.max(0, Math.min(100, x)), 
        y: Math.max(0, Math.min(100, y)) 
      });
    }
  }, [isZoomed, zoomScale]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      initialPinchDistance.current = null;
    }
    
    // Apply momentum when releasing single finger while zoomed
    if (e.touches.length === 0 && isZoomed && (Math.abs(velocity.x) > 2 || Math.abs(velocity.y) > 2)) {
      momentumAnimationRef.current = requestAnimationFrame(applyMomentum);
    }
    
    lastTouchPosition.current = null;
    
    // Reset if zoomed out below threshold
    if (zoomScale <= 1.1 && isZoomed) {
      resetZoom();
    }
  }, [zoomScale, isZoomed, resetZoom, velocity, applyMomentum]);

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
      
      {/* Main Image with Swipe and Zoom */}
      <div className="flex-1 relative overflow-hidden" ref={constraintsRef}>
        <div 
          ref={imageContainerRef}
          className="aspect-[3/4] overflow-hidden bg-secondary/20 touch-none relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
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
              drag={images.length > 1 && !isZoomed ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={handleDragEnd}
              className="w-full h-full cursor-grab active:cursor-grabbing"
            >
              {images[selectedImage]?.node && (
                <img
                  src={images[selectedImage].node.url}
                  alt={images[selectedImage].node.altText || productTitle}
                  className="w-full h-full object-cover pointer-events-none select-none transition-transform duration-200"
                  style={{
                    transform: `scale(${zoomScale})`,
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                  }}
                  draggable={false}
                />
              )}
            </motion.div>
          </AnimatePresence>
          
          {/* Zoom indicator for mobile */}
          {isZoomed && (
            <button
              onClick={resetZoom}
              className="md:hidden absolute top-3 right-3 z-10 px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-full text-xs font-medium flex items-center gap-1"
            >
              Tap to close
            </button>
          )}
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
