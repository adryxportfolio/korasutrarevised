import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { fetchProducts, ShopifyProduct, formatPrice } from '@/lib/shopify';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

// Collection configuration - maps URL slugs to display names and search queries
const collectionConfig: Record<string, { title: string; description: string; query?: string }> = {
  // Fabrics
  'tussar': { title: 'Tussar Silk Sarees', description: 'Discover our collection of handwoven Tussar silk sarees', query: 'tussar' },
  'matka': { title: 'Matka Silk Sarees', description: 'Elegant Matka silk sarees for every occasion', query: 'matka' },
  'muslin': { title: 'Muslin Sarees', description: 'Lightweight and breathable Muslin sarees', query: 'muslin' },
  'pure-silk': { title: 'Pure Silk Sarees', description: 'Luxurious pure silk sarees', query: 'silk' },
  'katan-silk': { title: 'Katan Silk Sarees', description: 'Traditional Katan silk sarees', query: 'katan' },
  'linen': { title: 'Linen Sarees', description: 'Contemporary linen sarees for modern women', query: 'linen' },
  'cotton': { title: 'Cotton Sarees', description: 'Comfortable cotton sarees for daily wear', query: 'cotton' },
  
  // Patterns
  'jamdani': { title: 'Jamdani Sarees', description: 'Exquisite Jamdani weave sarees', query: 'jamdani' },
  'kantha-stitch': { title: 'Kantha Stitch Sarees', description: 'Beautiful Kantha embroidered sarees', query: 'kantha' },
  'baluchari': { title: 'Baluchari Sarees', description: 'Traditional Baluchari sarees with intricate motifs', query: 'baluchari' },
  'hand-paint': { title: 'Hand Painted Sarees', description: 'Unique hand-painted sarees', query: 'hand paint' },
  'block-print': { title: 'Block Print Sarees', description: 'Traditional block printed sarees', query: 'block print' },
  'batik': { title: 'Batik Sarees', description: 'Artistic Batik print sarees', query: 'batik' },
  'digital-print': { title: 'Digital Print Sarees', description: 'Modern digital print sarees', query: 'digital' },
  'paithani': { title: 'Paithani Sarees', description: 'Royal Paithani sarees from Maharashtra', query: 'paithani' },
  
  // Occasions
  'traditional': { title: 'Traditional Sarees', description: 'Mummy ki Almari - Timeless traditional sarees', query: 'traditional' },
  'casual': { title: 'Casual Sarees', description: 'Bas Yun Hi - Everyday casual sarees', query: 'casual' },
  'office-wear': { title: 'Office Wear Sarees', description: 'Desk Se Dil Tak - Professional office wear sarees', query: 'office' },
  'party-wear': { title: 'Party Wear Sarees', description: 'Aj Main Upar - Glamorous party wear sarees', query: 'party' },
  
  // Special collections
  'best-sellers': { title: 'Best Sellers', description: 'Our most loved sarees' },
  'new-arrivals': { title: 'New Arrivals', description: 'Fresh additions to our collection' },
  'all': { title: 'All Products', description: 'Browse our complete collection' },
};

export default function Collection() {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);

  const config = slug ? collectionConfig[slug] : null;

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      // Fetch all products - in a real implementation, you'd filter by tags/metafields
      const data = await fetchProducts(50, config?.query);
      setProducts(data);
      setLoading(false);
    }
    loadProducts();
  }, [slug, config?.query]);

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

  if (!config) {
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
            <span className="text-foreground">{config.title}</span>
          </nav>

          {/* Collection Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading tracking-wide mb-4">
              {config.title}
            </h1>
            <p className="text-muted-foreground font-body max-w-2xl mx-auto">
              {config.description}
            </p>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-body mb-4">
                No products found in this collection yet.
              </p>
              <Link to="/" className="text-accent hover:underline">
                Browse all products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map(({ node }, index) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
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
