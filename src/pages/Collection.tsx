import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, SlidersHorizontal, ChevronDown, ChevronRight, Heart, X } from 'lucide-react';
import { fetchProducts, ShopifyProduct, formatPrice } from '@/lib/shopify';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Collection configuration
const collectionConfig: Record<string, { title: string; description: string; query?: string }> = {
  'tussar': { title: 'Tussar Silk Sarees', description: 'Discover our collection of handwoven Tussar silk sarees', query: 'tussar' },
  'matka': { title: 'Matka Silk Sarees', description: 'Elegant Matka silk sarees for every occasion', query: 'matka' },
  'muslin': { title: 'Muslin Sarees', description: 'Lightweight and breathable Muslin sarees', query: 'muslin' },
  'pure-silk': { title: 'Pure Silk Sarees', description: 'Luxurious pure silk sarees', query: 'silk' },
  'katan-silk': { title: 'Katan Silk Sarees', description: 'Traditional Katan silk sarees', query: 'katan' },
  'linen': { title: 'Linen Sarees', description: 'Contemporary linen sarees for modern women', query: 'linen' },
  'cotton': { title: 'Cotton Sarees', description: 'Comfortable cotton sarees for daily wear', query: 'cotton' },
  'jamdani': { title: 'Jamdani Sarees', description: 'Exquisite Jamdani weave sarees', query: 'jamdani' },
  'kantha-stitch': { title: 'Kantha Stitch Sarees', description: 'Beautiful Kantha embroidered sarees', query: 'kantha' },
  'baluchari': { title: 'Baluchari Sarees', description: 'Traditional Baluchari sarees with intricate motifs', query: 'baluchari' },
  'hand-paint': { title: 'Hand Painted Sarees', description: 'Unique hand-painted sarees', query: 'hand paint' },
  'block-print': { title: 'Block Print Sarees', description: 'Traditional block printed sarees', query: 'block print' },
  'batik': { title: 'Batik Sarees', description: 'Artistic Batik print sarees', query: 'batik' },
  'digital-print': { title: 'Digital Print Sarees', description: 'Modern digital print sarees', query: 'digital' },
  'paithani': { title: 'Paithani Sarees', description: 'Royal Paithani sarees from Maharashtra', query: 'paithani' },
  'traditional': { title: 'Traditional Sarees', description: 'Mummy ki Almari - Timeless traditional sarees', query: 'traditional' },
  'casual': { title: 'Casual Sarees', description: 'Bas Yun Hi - Everyday casual sarees', query: 'casual' },
  'office-wear': { title: 'Office Wear Sarees', description: 'Desk Se Dil Tak - Professional office wear sarees', query: 'office' },
  'party-wear': { title: 'Party Wear Sarees', description: 'Aj Main Upar - Glamorous party wear sarees', query: 'party' },
  'best-sellers': { title: 'Best Sellers', description: 'Our most loved sarees' },
  'new-arrivals': { title: 'New Arrivals', description: 'Fresh additions to our collection' },
  'all': { title: 'All Products', description: 'Browse our complete collection' },
};

type SortOption = 'featured' | 'price-low' | 'price-high' | 'newest';
type BlouseFilter = 'none' | 'all' | 'with-blouse' | 'without-blouse';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];

// Collection categories with subcategories - matching Navbar structure
const collectionCategories = {
  fabric: {
    label: 'Shop by Fabric',
    items: [
      { name: 'Tussar', href: '/collections/tussar' },
      { name: 'Matka', href: '/collections/matka' },
      { name: 'Muslin', href: '/collections/muslin' },
      { name: 'Pure Silk', href: '/collections/pure-silk' },
      { name: 'Katan Silk', href: '/collections/katan-silk' },
      { name: 'Linen', href: '/collections/linen' },
      { name: 'Cotton', href: '/collections/cotton' },
    ],
  },
  patterns: {
    label: 'Shop by Patterns',
    items: [
      { name: 'Jamdani', href: '/collections/jamdani' },
      { name: 'Kantha Stitch', href: '/collections/kantha-stitch' },
      { name: 'Baluchari', href: '/collections/baluchari' },
      { name: 'Hand Paint', href: '/collections/hand-paint' },
      { name: 'Block Print', href: '/collections/block-print' },
      { name: 'Batik', href: '/collections/batik' },
      { name: 'Digital Print', href: '/collections/digital-print' },
      { name: 'Paithani', href: '/collections/paithani' },
    ],
  },
  occasions: {
    label: 'Shop by Occasions',
    items: [
      { name: 'Mummy ki Almari (Traditional)', href: '/collections/traditional' },
      { name: 'Bas Yun Hi (Casual)', href: '/collections/casual' },
      { name: 'Desk Se Dil Tak (Office Wear)', href: '/collections/office-wear' },
      { name: 'Aj Main Upar (Party Wear)', href: '/collections/party-wear' },
    ],
  },
};

// Common color mapping for normalization
const colorMap: Record<string, string> = {
  'red': '#DC2626',
  'pink': '#EC4899',
  'rose': '#F43F5E',
  'orange': '#F97316',
  'yellow': '#EAB308',
  'gold': '#D4AF37',
  'green': '#22C55E',
  'teal': '#14B8A6',
  'blue': '#3B82F6',
  'navy': '#1E3A5A',
  'purple': '#A855F7',
  'violet': '#8B5CF6',
  'maroon': '#800000',
  'brown': '#92400E',
  'beige': '#D4B896',
  'cream': '#FFFDD0',
  'ivory': '#FFFFF0',
  'white': '#FFFFFF',
  'grey': '#6B7280',
  'gray': '#6B7280',
  'black': '#1F2937',
  'off-white': '#FAF9F6',
  'mustard': '#FFDB58',
  'peach': '#FFCBA4',
  'coral': '#FF7F50',
  'magenta': '#FF00FF',
  'wine': '#722F37',
  'rust': '#B7410E',
  'olive': '#808000',
  'turquoise': '#40E0D0',
  'aqua': '#00FFFF',
  'lavender': '#E6E6FA',
  'mint': '#98FB98',
};

export default function Collection() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [filterOpen, setFilterOpen] = useState(false);
  const [blouseFilter, setBlouseFilter] = useState<BlouseFilter>('none');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  const addItem = useCartStore(state => state.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  const config = slug ? collectionConfig[slug] : null;
  const searchQuery = searchParams.get('q');
  const colorsParam = searchParams.get('colors');

  // Initialize selectedColors from URL params
  useEffect(() => {
    if (colorsParam) {
      setSelectedColors(colorsParam.split(',').filter(c => c.trim()));
    }
  }, [colorsParam]);

  // Extract available colors from products
  const availableColors = useMemo(() => {
    const colorsSet = new Set<string>();
    products.forEach(product => {
      // Check tags for colors
      product.node.tags?.forEach(tag => {
        const normalizedTag = tag.toLowerCase().trim();
        if (colorMap[normalizedTag]) {
          colorsSet.add(normalizedTag);
        }
      });
      // Check title and description for colors
      const textToSearch = `${product.node.title} ${product.node.description}`.toLowerCase();
      Object.keys(colorMap).forEach(color => {
        if (textToSearch.includes(color)) {
          colorsSet.add(color);
        }
      });
    });
    return Array.from(colorsSet).sort();
  }, [products]);

  // Check if product has blouse
  const hasBlouse = (product: ShopifyProduct): boolean => {
    const text = `${product.node.title} ${product.node.description}`.toLowerCase();
    const tags = product.node.tags?.map(t => t.toLowerCase()) || [];
    
    // Check for "with blouse" indicators
    const withBlouseIndicators = ['with blouse', 'blouse included', 'includes blouse', 'blouse piece included', 'running blouse'];
    const withoutBlouseIndicators = ['without blouse', 'no blouse', 'blouse not included', 'saree only'];
    
    // Check tags first
    for (const tag of tags) {
      for (const indicator of withBlouseIndicators) {
        if (tag.includes(indicator)) return true;
      }
      for (const indicator of withoutBlouseIndicators) {
        if (tag.includes(indicator)) return false;
      }
    }
    
    // Check text
    for (const indicator of withBlouseIndicators) {
      if (text.includes(indicator)) return true;
    }
    for (const indicator of withoutBlouseIndicators) {
      if (text.includes(indicator)) return false;
    }
    
    // Default to true if "blouse" is mentioned without "without"
    if (text.includes('blouse') && !text.includes('without blouse')) return true;
    
    return false;
  };

  // Check product color
  const hasColor = (product: ShopifyProduct, colors: string[]): boolean => {
    if (colors.length === 0) return true;
    
    const tags = product.node.tags?.map(t => t.toLowerCase()) || [];
    const text = `${product.node.title} ${product.node.description}`.toLowerCase();
    
    return colors.some(color => {
      return tags.some(tag => tag.includes(color)) || text.includes(color);
    });
  };

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const data = await fetchProducts(50, config?.query || searchQuery || undefined);
      setProducts(data);
      
      // Set fixed max price of 50,000
      setMaxPrice(50000);
      setPriceRange([0, 50000]);
      
      setLoading(false);
    }
    loadProducts();
  }, [slug, config?.query, searchQuery]);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];
    
    // Price filter
    result = result.filter(p => {
      const price = parseFloat(p.node.priceRange.minVariantPrice.amount);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Blouse filter - 'none' and 'all' both show all products
    if (blouseFilter === 'with-blouse') {
      result = result.filter(p => hasBlouse(p));
    } else if (blouseFilter === 'without-blouse') {
      result = result.filter(p => !hasBlouse(p));
    }

    // Color filter
    result = result.filter(p => hasColor(p, selectedColors));
    
    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => 
          parseFloat(a.node.priceRange.minVariantPrice.amount) - 
          parseFloat(b.node.priceRange.minVariantPrice.amount)
        );
        break;
      case 'price-high':
        result.sort((a, b) => 
          parseFloat(b.node.priceRange.minVariantPrice.amount) - 
          parseFloat(a.node.priceRange.minVariantPrice.amount)
        );
        break;
      case 'newest':
        // Keep original order (assuming newest first from API)
        break;
      default:
        // Featured - keep original order
        break;
    }
    
    setFilteredProducts(result);
  }, [products, sortBy, priceRange, blouseFilter, selectedColors]);


  const handleAddToCart = (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) return;

    addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });

    toast.success('Added to cart', {
      description: product.node.title,
      position: 'top-center',
    });
  };

  const handleWishlistToggle = (product: ShopifyProduct) => {
    if (isInWishlist(product.node.id)) {
      removeFromWishlist(product.node.id);
      toast.success('Removed from wishlist', { position: 'top-center' });
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist', { position: 'top-center' });
    }
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const handleCategoryNavigation = (href: string) => {
    setFilterOpen(false);
    navigate(href);
  };

  const clearFilters = () => {
    setPriceRange([0, maxPrice]);
    setSortBy('featured');
    setBlouseFilter('none');
    setSelectedColors([]);
  };

  const activeFiltersCount = (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0) + 
    (blouseFilter !== 'none' ? 1 : 0) + 
    selectedColors.length;

  if (!config && !searchQuery) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-32 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-heading mb-4">Collection not found</h1>
            <Link to="/" className="text-accent hover:underline">
              Back to home
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const title = searchQuery ? `Search: "${searchQuery}"` : config?.title || 'All Products';
  const description = searchQuery ? `Showing results for "${searchQuery}"` : config?.description || '';

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 md:pt-28 pb-16 overflow-x-hidden">
        <div className="container mx-auto px-3 md:px-6 max-w-full">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 font-body">
            <Link to="/" className="hover:text-foreground transition-colors flex-shrink-0">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground truncate">{title}</span>
          </nav>

          {/* Collection Header */}
          <div className="text-center mb-4 md:mb-8">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-heading tracking-wide mb-2 md:mb-4">
              {title}
            </h1>
            <p className="text-xs md:text-base text-muted-foreground font-body max-w-2xl mx-auto">
              {description}
            </p>
          </div>

          {/* Filter & Sort Bar */}
          <div className="flex items-center justify-between mb-4 md:mb-6 pb-3 md:pb-4 border-b border-border gap-2">
            <div className="flex items-center gap-3">
              {/* Filter Button - Mobile Sheet */}
              <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filter
                    {activeFiltersCount > 0 && (
                      <span className="bg-accent text-accent-foreground text-xs px-1.5 py-0.5 rounded-full">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="font-heading">Filters</SheetTitle>
                  </SheetHeader>
                  <div className="py-6 space-y-6">
                    {/* Price Range Filter */}
                    <div>
                      <h3 className="text-sm font-body uppercase tracking-wide mb-4">Price Range</h3>
                      <Slider
                        value={priceRange}
                        min={0}
                        max={maxPrice}
                        step={500}
                        onValueChange={(value) => setPriceRange(value as [number, number])}
                        className="mb-4"
                      />
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>₹{priceRange[0].toLocaleString()}</span>
                        <span>₹{priceRange[1].toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Blouse Piece Filter */}
                    <div>
                      <h3 className="text-sm font-body uppercase tracking-wide mb-4">Blouse Piece</h3>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <Checkbox
                            checked={slug === 'all'}
                            onCheckedChange={() => {
                              setFilterOpen(false);
                              navigate('/collections/all');
                            }}
                          />
                          <span className="text-sm">All Sarees</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <Checkbox
                            checked={blouseFilter === 'with-blouse'}
                            onCheckedChange={() => setBlouseFilter('with-blouse')}
                          />
                          <span className="text-sm">With Blouse</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <Checkbox
                            checked={blouseFilter === 'without-blouse'}
                            onCheckedChange={() => setBlouseFilter('without-blouse')}
                          />
                          <span className="text-sm">Without Blouse</span>
                        </label>
                      </div>
                    </div>

                    {/* Color Filter */}
                    {availableColors.length > 0 && (
                      <div>
                        <h3 className="text-sm font-body uppercase tracking-wide mb-4">Colors</h3>
                        <div className="flex flex-wrap gap-2">
                          {availableColors.map(color => (
                            <button
                              key={color}
                              onClick={() => toggleColor(color)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs capitalize transition-all ${
                                selectedColors.includes(color)
                                  ? 'border-foreground bg-foreground text-background'
                                  : 'border-border hover:border-foreground'
                              }`}
                            >
                              <span
                                className="w-3 h-3 rounded-full border border-border/50"
                                style={{ backgroundColor: colorMap[color] }}
                              />
                              {color}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Shop by Fabric */}
                    <div>
                      <button
                        onClick={() => toggleCategory('fabric')}
                        className="flex items-center justify-between w-full text-sm font-body uppercase tracking-wide mb-2"
                      >
                        Shop by Fabric
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedCategory === 'fabric' ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {expandedCategory === 'fabric' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-2 pt-2">
                              {collectionCategories.fabric.items.map((item) => (
                                <button
                                  key={item.name}
                                  onClick={() => handleCategoryNavigation(item.href)}
                                  className="block w-full text-left py-1.5 text-sm text-muted-foreground hover:text-accent transition-colors pl-2"
                                >
                                  {item.name}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Shop by Patterns */}
                    <div>
                      <button
                        onClick={() => toggleCategory('patterns')}
                        className="flex items-center justify-between w-full text-sm font-body uppercase tracking-wide mb-2"
                      >
                        Shop by Patterns
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedCategory === 'patterns' ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {expandedCategory === 'patterns' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-2 pt-2">
                              {collectionCategories.patterns.items.map((item) => (
                                <button
                                  key={item.name}
                                  onClick={() => handleCategoryNavigation(item.href)}
                                  className="block w-full text-left py-1.5 text-sm text-muted-foreground hover:text-accent transition-colors pl-2"
                                >
                                  {item.name}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Shop by Occasions */}
                    <div>
                      <button
                        onClick={() => toggleCategory('occasions')}
                        className="flex items-center justify-between w-full text-sm font-body uppercase tracking-wide mb-2"
                      >
                        Shop by Occasions
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedCategory === 'occasions' ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {expandedCategory === 'occasions' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-2 pt-2">
                              {collectionCategories.occasions.items.map((item) => (
                                <button
                                  key={item.name}
                                  onClick={() => handleCategoryNavigation(item.href)}
                                  className="block w-full text-left py-1.5 text-sm text-muted-foreground hover:text-accent transition-colors pl-2"
                                >
                                  {item.name}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Clear Filters */}
                    <Button
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        clearFilters();
                        setFilterOpen(false);
                      }}
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Active Filters Display */}
              {activeFiltersCount > 0 && (
                <div className="hidden md:flex items-center gap-2 flex-wrap">
                  {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                    <span className="text-xs bg-secondary px-2 py-1 rounded flex items-center gap-1">
                      ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                      <button onClick={() => setPriceRange([0, maxPrice])}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {blouseFilter !== 'none' && (
                    <span className="text-xs bg-secondary px-2 py-1 rounded flex items-center gap-1 capitalize">
                      {blouseFilter === 'all' ? 'All Sarees' : blouseFilter === 'with-blouse' ? 'With Blouse' : 'Without Blouse'}
                      <button onClick={() => setBlouseFilter('none')}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedColors.map(color => (
                    <span key={color} className="text-xs bg-secondary px-2 py-1 rounded flex items-center gap-1 capitalize">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-border/50"
                        style={{ backgroundColor: colorMap[color] }}
                      />
                      {color}
                      <button onClick={() => toggleColor(color)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={clearFilters}
                    className="text-xs text-accent hover:text-accent/80 underline underline-offset-2 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Product Count */}
              <span className="text-sm text-muted-foreground hidden md:block">
                {filteredProducts.length} products
              </span>

              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    Sort
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {sortOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={sortBy === option.value ? 'bg-secondary' : ''}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>


          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-body mb-4">
                No products found matching your criteria.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6">
              {filteredProducts.map(({ node }, index) => {
                const productHasBlouse = hasBlouse({ node });
                return (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="group"
                  >
                    <div className="relative">
                      <Link to={`/product/${node.handle}`}>
                        <div className="aspect-[3/4] overflow-hidden bg-secondary/20 mb-2 relative rounded-sm">
                          {node.images.edges[0]?.node && (
                            <img
                              src={node.images.edges[0].node.url}
                              alt={node.images.edges[0].node.altText || node.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          )}
                          
                          {/* NEW Badge - top left */}
                          {index < 4 && (
                            <span className="absolute top-2 left-2 bg-foreground text-background text-[10px] md:text-xs px-2 py-0.5 font-body uppercase tracking-wide">
                              NEW
                            </span>
                          )}
                          
                          {/* View Button - bottom right */}
                          <div className="absolute bottom-2 right-2">
                            <span className="flex items-center gap-1 bg-background/90 backdrop-blur-sm text-foreground text-[10px] md:text-xs px-2 py-1 rounded-full font-body">
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M12 5C5.636 5 2 12 2 12s3.636 7 10 7 10-7 10-7-3.636-7-10-7z"/>
                              </svg>
                              view
                            </span>
                          </div>
                        </div>
                      </Link>
                      
                      {/* Wishlist Button */}
                      <button
                        onClick={() => handleWishlistToggle({ node })}
                        className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-background/90 backdrop-blur-sm rounded-full transition-all shadow-sm ${
                          isInWishlist(node.id) ? 'text-red-500' : 'text-foreground'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isInWishlist(node.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    
                    <Link to={`/product/${node.handle}`} className="block">
                      <h3 className="font-heading text-xs md:text-sm text-foreground group-hover:text-accent transition-colors line-clamp-2 uppercase leading-tight">
                        {node.title}
                      </h3>
                      
                      {/* Blouse Badge */}
                      {productHasBlouse && (
                        <span className="inline-block mt-1 text-[10px] md:text-xs px-2 py-0.5 border border-border text-muted-foreground font-body">
                          Saree with blouse piece
                        </span>
                      )}
                      
                      <p className="text-sm md:text-base font-heading mt-1">
                        {formatPrice(node.priceRange.minVariantPrice.amount, node.priceRange.minVariantPrice.currencyCode)}
                      </p>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
