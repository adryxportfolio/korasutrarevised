import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingBag, Loader2, MessageCircle, Truck, Clock } from 'lucide-react';
import { fetchProductByHandle, fetchProducts, ShopifyProduct, formatPrice } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Parse product description to extract structured details
function parseProductDetails(description: string): Record<string, string> {
  const details: Record<string, string> = {};
  
  // Common patterns to look for in saree descriptions
  const patterns = [
    { key: 'Fabric', regex: /fabric[:\s]*([^,\n.]+)/i },
    { key: 'Length', regex: /length[:\s]*([^,\n.]+)/i },
    { key: 'Width', regex: /width[:\s]*([^,\n.]+)/i },
    { key: 'Blouse Piece', regex: /blouse\s*piece[:\s]*([^,\n.]+)/i },
    { key: 'Colour', regex: /colou?r[:\s]*([^,\n.]+)/i },
    { key: 'Wash Care', regex: /wash\s*care[:\s]*([^,\n.]+)/i },
    { key: 'Pattern', regex: /pattern[:\s]*([^,\n.]+)/i },
    { key: 'Occasion', regex: /occasion[:\s]*([^,\n.]+)/i },
    { key: 'Craft', regex: /craft[:\s]*([^,\n.]+)/i },
    { key: 'Origin', regex: /origin[:\s]*([^,\n.]+)/i },
    { key: 'Weave', regex: /weave[:\s]*([^,\n.]+)/i },
  ];

  patterns.forEach(({ key, regex }) => {
    const match = description.match(regex);
    if (match && match[1]) {
      details[key] = match[1].trim();
    }
  });

  return details;
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

// Related Products Component
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
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    async function loadProduct() {
      if (!handle) return;
      setLoading(true);
      setSelectedImage(0);
      
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

  const handleEnquiry = () => {
    const message = `Hi, I'm interested in ${product?.title}. Could you provide more details?`;
    window.open(`https://wa.me/919876543210?text=${encodeURIComponent(message)}`, '_blank');
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!product) return;
    const total = product.images.edges.length;
    if (direction === 'prev') {
      setSelectedImage(prev => (prev - 1 + total) % total);
    } else {
      setSelectedImage(prev => (prev + 1) % total);
    }
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 font-body">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.title}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
            {/* Image Gallery - SUTA Style with vertical thumbnails */}
            <div className="flex gap-4">
              {/* Vertical Thumbnails - Desktop */}
              {images.length > 1 && (
                <div className="hidden md:flex flex-col gap-2 w-20 flex-shrink-0">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-[3/4] overflow-hidden border-2 transition-all ${
                        selectedImage === index 
                          ? 'border-foreground' 
                          : 'border-transparent hover:border-muted-foreground/50'
                      }`}
                    >
                      <img
                        src={image.node.url}
                        alt={image.node.altText || `${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              
              {/* Main Image */}
              <div className="flex-1 relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="aspect-[3/4] overflow-hidden bg-secondary/20"
                  >
                    {images[selectedImage]?.node && (
                      <img
                        src={images[selectedImage].node.url}
                        alt={images[selectedImage].node.altText || product.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
                
                {/* Image Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => navigateImage('prev')}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => navigateImage('next')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Image Dots - Mobile */}
                {images.length > 1 && (
                  <div className="md:hidden flex justify-center gap-2 mt-4">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          selectedImage === index ? 'bg-foreground' : 'bg-muted-foreground/30'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Info - SUTA Style */}
            <div className="space-y-6">
              {/* Title */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading tracking-wide uppercase">
                {product.title}
              </h1>

              {/* Tags / Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 border border-border text-xs font-body tracking-wide">
                  Saree
                </span>
                {productDetails['Fabric'] && (
                  <span className="px-3 py-1 border border-border text-xs font-body tracking-wide">
                    {productDetails['Fabric']}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="space-y-1">
                <p className="text-xl md:text-2xl font-heading">
                  {currentVariant && formatPrice(currentVariant.price.amount, currentVariant.price.currencyCode)}
                </p>
                <p className="text-xs text-muted-foreground">MRP Inclusive of all taxes</p>
              </div>

              {/* Variant Options */}
              {product.options.filter(opt => opt.name !== 'Title').map((option) => (
                <div key={option.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-body uppercase tracking-wide">
                      {option.name}:
                    </label>
                    {option.name.toLowerCase() === 'size' && (
                      <Link to="/size-guide" className="text-sm text-accent hover:underline">
                        Size chart
                      </Link>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value) => {
                      const isSelected = selectedOptions[option.name] === value;
                      return (
                        <button
                          key={value}
                          onClick={() => handleOptionChange(option.name, value)}
                          className={`min-w-[40px] px-4 py-2 text-sm font-body border transition-all ${
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

              {/* Delivery Info */}
              <div className="flex items-center gap-2 text-sm text-accent">
                <Clock className="w-4 h-4" />
                <span className="font-body tracking-wide">5-7 DAYS DELIVERY WITHIN INDIA</span>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleAddToCart}
                  disabled={!currentVariant?.availableForSale}
                  className="w-full h-14 text-base font-body uppercase tracking-widest"
                  size="lg"
                >
                  {currentVariant?.availableForSale ? (
                    <>
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      Add to Cart
                    </>
                  ) : (
                    'Sold Out'
                  )}
                </Button>
                
                <Button
                  onClick={handleEnquiry}
                  variant="outline"
                  size="lg"
                  className="w-full h-12 text-sm font-body uppercase tracking-wide"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Enquiry on WhatsApp
                </Button>
              </div>

              {/* Accordion Sections - SUTA Style */}
              <Accordion type="multiple" className="w-full border-t border-border">
                <AccordionItem value="details" className="border-b border-border">
                  <AccordionTrigger className="text-sm font-body uppercase tracking-widest py-4 hover:no-underline">
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

                <AccordionItem value="description" className="border-b border-border">
                  <AccordionTrigger className="text-sm font-body uppercase tracking-widest py-4 hover:no-underline">
                    Description
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <p className="font-body text-foreground/80 leading-relaxed text-sm">
                      {product.description || 'No description available.'}
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="manufacturing" className="border-b border-border">
                  <AccordionTrigger className="text-sm font-body uppercase tracking-widest py-4 hover:no-underline">
                    Manufacturing Information
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-2 text-sm font-body text-foreground/80">
                      <p><strong>Country of Origin:</strong> India</p>
                      <p><strong>Manufactured & Packed By:</strong> Kora Sutra</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="shipping" className="border-b border-border">
                  <AccordionTrigger className="text-sm font-body uppercase tracking-widest py-4 hover:no-underline">
                    Shipping & Returns
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-3 text-sm font-body text-foreground/80">
                      <div className="flex items-start gap-2">
                        <Truck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>Free shipping on all orders within India</p>
                      </div>
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
              </Accordion>
            </div>
          </div>

          {/* Related Products */}
          <RelatedProducts currentHandle={handle || ''} products={relatedProducts} />
        </div>
      </main>
      <Footer />
    </>
  );
}
