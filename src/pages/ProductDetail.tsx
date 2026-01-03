import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Loader2, Clock, Heart, Share2, Bell } from 'lucide-react';
import { fetchProductByHandle, fetchProducts, ShopifyProduct, formatPrice } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SwipeableImageGallery } from '@/components/SwipeableImageGallery';
import { StickyMobileCartBar } from '@/components/StickyMobileCartBar';
import { RecentlyViewed } from '@/components/RecentlyViewed';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProductReviews } from '@/components/ProductReviews';

// Parse product description to extract structured details
function parseProductDetails(description: string): Record<string, string> {
  const details: Record<string, string> = {};
  
  const patterns = [
    { key: 'Fabric', regex: /fabric[:\s]*([^,\n.]+)/i },
    { key: 'Blouse Piece', regex: /blouse\s*piece[:\s]*([^,\n.]+)/i },
    { key: 'Colour', regex: /colou?r[:\s]*([^,\n.]+)/i },
    { key: 'Wash Care', regex: /wash\s*care[:\s]*([^,\n.]+)/i },
    { key: 'Pattern', regex: /pattern[:\s]*([^,\n.]+)/i },
    { key: 'Occasion', regex: /occasion[:\s]*([^,\n.]+)/i },
    { key: 'Craft', regex: /craft[:\s]*([^,\n.]+)/i },
    { key: 'Weave', regex: /weave[:\s]*([^,\n.]+)/i },
  ];

  patterns.forEach(({ key, regex }) => {
    const match = description.match(regex);
    if (match && match[1]) {
      details[key] = match[1].trim();
    }
  });

  // Always set fixed values for Length and Origin
  details['Length'] = '6 metres';
  details['Origin'] = 'Hyderabad';

  return details;
}

// Generate a random stock quantity (1-5) based on product handle for consistency
function getRandomStock(handle: string): number {
  let hash = 0;
  for (let i = 0; i < handle.length; i++) {
    hash = ((hash << 5) - hash) + handle.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash % 5) + 1; // Returns 1-5
}

// Product Details Table Component
function ProductDetailsTable({ details }: { details: Record<string, string> }) {
  const entries = Object.entries(details);
  
  if (entries.length === 0) return null;

  return (
    <div className="border border-border rounded-sm overflow-hidden">
      {entries.map(([key, value], index) => (
        <div
          key={key}
          className={`flex ${index !== entries.length - 1 ? 'border-b border-border' : ''}`}
        >
          <div className="w-1/3 px-4 py-3 bg-secondary/30 font-medium text-sm text-foreground">
            {key}
          </div>
          <div className="w-2/3 px-4 py-3 text-sm text-foreground/80">
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}

// Similar Products Component - SUTA Style
function SimilarProducts({ currentHandle, products }: { currentHandle: string; products: ShopifyProduct[] }) {
  const filteredProducts = products.filter(p => p.node.handle !== currentHandle).slice(0, 4);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (filteredProducts.length === 0) return null;

  return (
    <div className="border border-border rounded-sm p-4 mt-6">
      <h3 className="text-center text-sm font-body uppercase tracking-widest mb-4 border-b border-border pb-3">
        Similar Products
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {filteredProducts.map(({ node }) => (
          <Link
            key={node.id}
            to={`/product/${node.handle}`}
            className="flex-shrink-0 w-24"
          >
            <div className="aspect-[3/4] overflow-hidden bg-secondary/20 rounded-sm">
              {node.images.edges[0]?.node && (
                <img
                  src={node.images.edges[0].node.url}
                  alt={node.images.edges[0].node.altText || node.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// You May Also Like Section - Bottom of page
function RelatedProducts({ currentHandle, products }: { currentHandle: string; products: ShopifyProduct[] }) {
  const filteredProducts = products.filter(p => p.node.handle !== currentHandle).slice(0, 8);
  
  if (filteredProducts.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-12">
      <h2 className="text-2xl md:text-3xl font-heading text-center mb-8 tracking-wide">
        YOU MAY ALSO LIKE
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {filteredProducts.map(({ node }) => (
          <Link
            key={node.id}
            to={`/product/${node.handle}`}
            className="group"
          >
            <div className="aspect-[3/4] overflow-hidden bg-secondary/20 mb-3">
              {node.images.edges[0]?.node && (
                <img
                  src={node.images.edges[0].node.url}
                  alt={node.images.edges[0].node.altText || node.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </div>
            <h3 className="font-heading text-sm md:text-base text-foreground group-hover:text-accent transition-colors truncate">
              {node.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {formatPrice(node.priceRange.minVariantPrice.amount, node.priceRange.minVariantPrice.currencyCode)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function ProductDetail() {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ShopifyProduct['node'] | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  
  const addItem = useCartStore(state => state.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const addToRecentlyViewed = useRecentlyViewedStore(state => state.addProduct);

  const isWishlisted = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    async function loadProduct() {
      if (!handle) return;
      setLoading(true);
      
      const [productData, allProducts] = await Promise.all([
        fetchProductByHandle(handle),
        fetchProducts(20)
      ]);
      
      setProduct(productData);
      setRelatedProducts(allProducts);
      
      if (productData?.variants.edges[0]) {
        setSelectedVariant(productData.variants.edges[0].node.id);
        const initialOptions: Record<string, string> = {};
        productData.variants.edges[0].node.selectedOptions.forEach(opt => {
          initialOptions[opt.name] = opt.value;
        });
        setSelectedOptions(initialOptions);
        
        // Add to recently viewed
        addToRecentlyViewed({ node: productData });
      }
      setLoading(false);
    }
    loadProduct();
  }, [handle]);

  const handleOptionChange = (optionName: string, value: string) => {
    const newOptions = { ...selectedOptions, [optionName]: value };
    setSelectedOptions(newOptions);
    
    const matchingVariant = product?.variants.edges.find(({ node }) => 
      node.selectedOptions.every(opt => newOptions[opt.name] === opt.value)
    );
    
    if (matchingVariant) {
      setSelectedVariant(matchingVariant.node.id);
    }
  };

  const getCurrentVariant = () => {
    return product?.variants.edges.find(({ node }) => node.id === selectedVariant)?.node;
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    
    const variant = getCurrentVariant();
    if (!variant) return;

    addItem({
      product: { node: product },
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });

    toast.success('Added to cart', {
      description: product.title,
      position: 'top-center',
    });
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist', { position: 'top-center' });
    } else {
      addToWishlist({ node: product });
      toast.success('Added to wishlist', { position: 'top-center' });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          url: url,
        });
      } catch {
        navigator.clipboard.writeText(url);
        toast.success('Link copied!', { position: 'top-center' });
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied!', { position: 'top-center' });
    }
  };

  const handleEnquiry = () => {
    const message = `Hi, I'm interested in ${product?.title}. Could you provide more details?`;
    window.open(`https://wa.me/917995862266?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-32 pb-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-32 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-heading mb-4">Product not found</h1>
            <Link to="/" className="text-accent hover:underline">
              Back to home
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const currentVariant = getCurrentVariant();
  const images = product.images.edges;
  const productDetails = parseProductDetails(product.description);
  const priceAmount = parseFloat(currentVariant?.price.amount || '0');
  const stockQuantity = handle ? getRandomStock(handle) : 1;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-24 md:pb-16 overflow-x-hidden">
        <div className="container mx-auto px-3 md:px-6 max-w-full overflow-hidden">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 font-body overflow-hidden">
            <Link to="/" className="hover:text-foreground transition-colors flex-shrink-0">
              Home
            </Link>
            <span className="flex-shrink-0">/</span>
            <span className="text-foreground truncate">{product.title}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-4 md:gap-8 lg:gap-12">
            {/* Left Side - Image Gallery with Swipe */}
            <SwipeableImageGallery images={images} productTitle={product.title} />

            {/* Right Side - Product Info SUTA Style */}
            <div className="space-y-3 md:space-y-4">
              {/* Title Row with Share & Wishlist */}
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-heading tracking-wide uppercase flex-1 leading-tight">
                  {product.title}
                </h1>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={handleShare}
                    className="p-2 hover:bg-secondary/50 rounded-full transition-colors"
                    aria-label="Share"
                  >
                    <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <button
                    onClick={handleWishlistToggle}
                    className={`p-2 hover:bg-secondary/50 rounded-full transition-colors ${isWishlisted ? 'text-red-500' : ''}`}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Tags / Badges Row */}
              <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                <span className="px-2 md:px-3 py-1 border border-border text-xs font-body tracking-wide">
                  Saree
                </span>
                {productDetails['Fabric'] && (
                  <span className="px-2 md:px-3 py-1 border border-border text-xs font-body tracking-wide">
                    {productDetails['Fabric']}
                  </span>
                )}
              </div>

              {/* Short Description */}
              <p className="text-xs md:text-sm text-muted-foreground font-body line-clamp-2">
                {product.description?.substring(0, 100) || 'Handcrafted saree with exquisite detailing'}
              </p>

              {/* Price & Top Rated Badge */}
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xl md:text-2xl font-heading">
                    {currentVariant && formatPrice(currentVariant.price.amount, currentVariant.price.currencyCode)}
                  </p>
                  <p className="text-xs text-muted-foreground">MRP Inclusive of all taxes</p>
                </div>
                <span className="px-3 py-1 bg-foreground text-background text-xs font-body uppercase tracking-wide">
                  Top Rated
                </span>
              </div>

              {/* Stock Status */}
              {stockQuantity <= 3 && stockQuantity > 0 && (
                <p className="text-xs md:text-sm text-red-600 font-body flex items-center gap-1">
                  🔥 Only {stockQuantity} left in stock — SELLING FAST!
                </p>
              )}

              {/* Variant Options */}
              {product.options.filter(opt => opt.name !== 'Title').map((option) => (
                <div key={option.name} className="space-y-2 md:space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs md:text-sm font-body uppercase tracking-wide">
                      {option.name}:
                    </label>
                    {option.name.toLowerCase() === 'size' && (
                      <Link to="/size-guide" className="text-xs md:text-sm text-accent hover:underline">
                        Size chart
                      </Link>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {option.values.map((value) => {
                      const isSelected = selectedOptions[option.name] === value;
                      return (
                        <button
                          key={value}
                          onClick={() => handleOptionChange(option.name, value)}
                          className={`min-w-[36px] md:min-w-[40px] px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-body border transition-all ${
                            isSelected
                              ? 'border-foreground bg-foreground text-background'
                              : 'border-border hover:border-foreground'
                          }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Add-Ons Section - Simplified */}
              <div className="border border-border rounded-sm overflow-hidden">
                <div className="p-3 md:p-4 bg-accent/5 border-b border-border">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Button
                      onClick={handleAddToCart}
                      disabled={!currentVariant?.availableForSale}
                      className="w-full h-11 md:h-12 text-sm md:text-base font-body uppercase tracking-widest bg-accent hover:bg-accent/90 text-accent-foreground rounded-full"
                    >
                      {currentVariant?.availableForSale ? (
                        <>
                          <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                          Add On
                        </>
                      ) : (
                        'Sold Out'
                      )}
                    </Button>
                    {!currentVariant?.availableForSale && (
                      <a
                        href={`https://wa.me/917995862266?text=${encodeURIComponent(`Hi, I'm interested in "${product.title}" which is currently out of stock. Please notify me when it's back in stock. Product: ${window.location.href}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full"
                      >
                        <Button
                          variant="outline"
                          className="w-full h-11 md:h-12 text-sm md:text-base font-body uppercase tracking-widest rounded-full border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white"
                        >
                          <Bell className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                          Notify Me
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
                
                {/* Size Chart Link */}
                <div className="p-3 md:p-4">
                  <Link to="/size-guide" className="text-sm text-accent hover:underline font-body">
                    Size chart
                  </Link>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="flex items-center gap-2 text-xs md:text-sm text-accent py-2">
                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="font-body tracking-wide">5-7 DAYS DELIVERY WITHIN INDIA</span>
              </div>

              {/* Offers Section */}
              <div className="border border-border rounded-sm p-3 md:p-4 bg-green-50">
                <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                  <span className="text-xs md:text-sm">🎁</span>
                  <span className="text-xs md:text-sm font-body font-medium">Offers</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-body font-semibold">KORA5 📋</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">5% OFF upto ₹1000 | Min. purchase ₹4499</p>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button - Large */}
              <Button
                onClick={handleAddToCart}
                disabled={!currentVariant?.availableForSale}
                className="w-full h-12 md:h-14 text-sm md:text-base font-body uppercase tracking-widest bg-accent hover:bg-accent/90"
                size="lg"
              >
                {currentVariant?.availableForSale ? 'Add to Cart' : 'Sold Out'}
              </Button>

              {/* Similar Products */}
              <SimilarProducts currentHandle={handle || ''} products={relatedProducts} />

              {/* Accordion Sections - SUTA Style */}
              <Accordion type="multiple" className="w-full border-t border-border mt-4 md:mt-6">
                <AccordionItem value="details" className="border-b border-border">
                  <AccordionTrigger className="text-xs md:text-sm font-body uppercase tracking-widest py-3 md:py-4 hover:no-underline">
                    Details
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <ProductDetailsTable details={productDetails} />
                    {Object.keys(productDetails).length === 0 && (
                      <p className="text-sm text-muted-foreground font-body">
                        Product details will be available soon.
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="story" className="border-b border-border">
                  <AccordionTrigger className="text-xs md:text-sm font-body uppercase tracking-widest py-3 md:py-4 hover:no-underline">
                    Story
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <p className="font-body text-foreground/80 leading-relaxed text-sm">
                      Each saree tells a story of tradition, craftsmanship, and the skilled artisans who create these masterpieces. 
                      This piece is handcrafted with love and dedication, preserving centuries-old techniques.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="description" className="border-b border-border">
                  <AccordionTrigger className="text-xs md:text-sm font-body uppercase tracking-widest py-3 md:py-4 hover:no-underline">
                    Description
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <p className="font-body text-foreground/80 leading-relaxed text-sm">
                      {product.description || 'No description available.'}
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="manufacturing" className="border-b border-border">
                  <AccordionTrigger className="text-xs md:text-sm font-body uppercase tracking-widest py-3 md:py-4 hover:no-underline">
                    Manufacturing Information
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-2 text-sm font-body text-foreground/80">
                      <p><strong>Country of Origin:</strong> India</p>
                      <p><strong>Manufactured & Packed By:</strong> Kora Sutra</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="return" className="border-b border-border">
                  <AccordionTrigger className="text-xs md:text-sm font-body uppercase tracking-widest py-3 md:py-4 hover:no-underline">
                    Return & Exchange Policy
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-3 text-sm font-body text-foreground/80">
                      <p>
                        We offer easy returns and exchanges within 10 days of delivery. 
                        Items must be unused with all tags attached.
                      </p>
                      <Link to="/returns" className="text-accent hover:underline inline-block">
                        Learn more about our return policy
                      </Link>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="disclaimer" className="border-b border-border">
                  <AccordionTrigger className="text-xs md:text-sm font-body uppercase tracking-widest py-3 md:py-4 hover:no-underline">
                    Disclaimer
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-3 text-sm font-body text-foreground/80">
                      <p>
                        Some images on this page use AI-generated models to showcase styling and drape.
                      </p>
                      <p>
                        While we strive for accuracy, the actual saree may differ slightly in color tone, weave, border detailing, or finish due to fabric nature, lighting, and digital rendering.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {/* Customer Reviews Section */}
          {product && (
            <ProductReviews 
              productId={product.id}
              productHandle={product.handle}
              productTitle={product.title}
            />
          )}

          {/* Recently Viewed Section */}
          <RecentlyViewed currentHandle={handle} />

          {/* Related Products - Bottom */}
          <RelatedProducts currentHandle={handle || ''} products={relatedProducts} />
        </div>
        
        {/* Sticky Mobile Cart Bar - add bottom padding to main content */}
        {currentVariant && (
          <StickyMobileCartBar
            price={currentVariant.price}
            isAvailable={currentVariant.availableForSale}
            onAddToCart={handleAddToCart}
            productTitle={product.title}
          />
        )}
      </main>
      <Footer />
    </>
  );
}
