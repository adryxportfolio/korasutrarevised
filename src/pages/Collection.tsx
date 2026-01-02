import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, SlidersHorizontal, ChevronDown, Heart, X } from 'lucide-react';
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
type BlouseFilter = 'all' | 'with-blouse' | 'without-blouse';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];

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
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [filterOpen, setFilterOpen] = useState(false);
  const [blouseFilter, setBlouseFilter] = useState<BlouseFilter>('all');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  
  const addItem = useCartStore(state => state.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  const config = slug ? collectionConfig[slug] : null;
  const searchQuery = searchParams.get('q');

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
      
      // Calculate max price
      if (data.length > 0) {
        const max = Math.max(...data.map(p => parseFloat(p.node.priceRange.minVariantPrice.amount)));
        setMaxPrice(Math.ceil(max / 1000) * 1000);
        setPriceRange([0, Math.ceil(max / 1000) * 1000]);
      }
      
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

    // Blouse filter
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

  const clearFilters = () => {
    setPriceRange([0, maxPrice]);
    setSortBy('featured');
    setBlouseFilter('all');
    setSelectedColors([]);
  };

  const activeFiltersCount = (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0) + 
    (blouseFilter !== 'all' ? 1 : 0) + 
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
      <main className="min-h-screen pt-28 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 font-body">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">{title}</span>
          </nav>

          {/* Collection Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading tracking-wide mb-4">
              {title}
            </h1>
            <p className="text-muted-foreground font-body max-w-2xl mx-auto">
              {description}
            </p>
          </div>

          {/* Filter & Sort Bar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
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
                            checked={blouseFilter === 'all'}
                            onCheckedChange={() => setBlouseFilter('all')}
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
                  {blouseFilter !== 'all' && (
                    <span className="text-xs bg-secondary px-2 py-1 rounded flex items-center gap-1 capitalize">
                      {blouseFilter === 'with-blouse' ? 'With Blouse' : 'Without Blouse'}
                      <button onClick={() => setBlouseFilter('all')}>
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

          {/* Desktop Filters - Inline */}
          <div className="hidden md:block mb-8 p-4 bg-secondary/30 rounded-sm space-y-4">
            {/* Price */}
            <div className="flex items-center gap-6">
              <span className="text-sm font-body uppercase tracking-wide w-24">Price:</span>
              <div className="flex-1 max-w-md">
                <Slider
                  value={priceRange}
                  min={0}
                  max={maxPrice}
                  step={500}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground w-44 justify-end">
                <span>₹{priceRange[0].toLocaleString()}</span>
                <span>-</span>
                <span>₹{priceRange[1].toLocaleString()}</span>
              </div>
            </div>

            {/* Blouse Piece & Colors */}
            <div className="flex flex-wrap items-start gap-6 pt-2 border-t border-border/50">
              <div className="flex items-center gap-3">
                <span className="text-sm font-body uppercase tracking-wide">Blouse:</span>
                <div className="flex gap-2">
                  {(['all', 'with-blouse', 'without-blouse'] as BlouseFilter[]).map(filter => (
                    <button
                      key={filter}
                      onClick={() => setBlouseFilter(filter)}
                      className={`px-3 py-1 text-xs rounded-full border transition-all ${
                        blouseFilter === filter
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border hover:border-foreground'
                      }`}
                    >
                      {filter === 'all' ? 'All' : filter === 'with-blouse' ? 'With Blouse' : 'Without Blouse'}
                    </button>
                  ))}
                </div>
              </div>

              {availableColors.length > 0 && (
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-body uppercase tracking-wide">Colors:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {availableColors.slice(0, 12).map(color => (
                      <button
                        key={color}
                        onClick={() => toggleColor(color)}
                        title={color}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          selectedColors.includes(color)
                            ? 'border-foreground ring-2 ring-foreground ring-offset-2'
                            : 'border-border/50 hover:border-foreground'
                        }`}
                        style={{ backgroundColor: colorMap[color] }}
                      />
                    ))}
                    {availableColors.length > 12 && (
                      <span className="text-xs text-muted-foreground self-center ml-1">
                        +{availableColors.length - 12} more
                      </span>
                    )}
                  </div>
                </div>
              )}
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map(({ node }, index) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group"
                >
                  <div className="relative">
                    <Link to={`/product/${node.handle}`}>
                      <div className="aspect-[3/4] overflow-hidden bg-secondary/20 mb-3 relative">
                        {node.images.edges[0]?.node && (
                          <img
                            src={node.images.edges[0].node.url}
                            alt={node.images.edges[0].node.altText || node.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                        {/* Quick Add Button */}
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            className="w-full text-xs"
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddToCart({ node });
                            }}
                          >
                            <ShoppingBag className="w-3 h-3 mr-1" />
                            Quick Add
                          </Button>
                        </div>
                      </div>
                    </Link>
                    
                    {/* Wishlist Button */}
                    <button
                      onClick={() => handleWishlistToggle({ node })}
                      className={`absolute top-2 right-2 p-2 bg-background/80 backdrop-blur-sm rounded-full transition-all ${
                        isInWishlist(node.id) ? 'text-red-500' : 'text-foreground opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(node.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  
                  <Link to={`/product/${node.handle}`}>
                    <h3 className="font-heading text-sm md:text-base text-foreground group-hover:text-accent transition-colors line-clamp-2">
                      {node.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatPrice(node.priceRange.minVariantPrice.amount, node.priceRange.minVariantPrice.currencyCode)}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
