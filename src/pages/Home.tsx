import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, CATEGORIES } from '@/data/mockProducts';
import type { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ShoppingCart,
  Search,
  Star,
  Filter,
  ChevronRight,
  Menu,
  X,
  ShoppingBag,
  Heart,
  Eye,
  Truck,
  Shield,
  Headphones,
} from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { addToCart, getCartCount } = useCart();

  useEffect(() => {
    setProducts(getProducts());
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = products;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src="/favicon.svg"
                alt="Store"
                className="h-10 w-10 rounded-xl shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow object-contain"
              />
              <span className="text-xl font-bold text-slate-900 hidden sm:block">
                Store
              </span>
            </Link>

            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/cart"
                className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-primary transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </Link>
              <button
                className="md:hidden p-2.5 rounded-xl hover:bg-slate-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 rounded-xl"
              />
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-primary/90 text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTR2MkgyNHYtMmgxMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Premium tech, fair prices
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Electronics, computers, and accessories—curated for you.
            </p>
            <Button
              variant="secondary"
              size="lg"
              className="font-semibold rounded-xl shadow-lg bg-white text-primary hover:bg-white/95"
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start shopping
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap justify-center gap-8 text-slate-600 text-sm">
            <span className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Free shipping over $50
            </span>
            <span className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              1-year warranty
            </span>
            <span className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-primary" />
              Support 24/7
            </span>
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="products">
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          <Filter className="h-5 w-5 text-slate-500 flex-shrink-0" />
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden rounded-2xl animate-pulse border-0 shadow-md">
                <div className="aspect-square bg-slate-200" />
                <CardContent className="p-5">
                  <div className="h-4 bg-slate-200 rounded-lg w-3/4 mb-3" />
                  <div className="h-4 bg-slate-200 rounded-lg w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-20 w-20 text-slate-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No products found
            </h3>
            <p className="text-slate-500">
              Try a different search or category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="group overflow-hidden rounded-2xl border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <Link to={`/product/${product.id}`}>
                      <button className="p-3 bg-white rounded-xl hover:bg-slate-100 transition-colors shadow-lg">
                        <Eye className="h-5 w-5 text-slate-700" />
                      </button>
                    </Link>
                    <button
                      onClick={() => addToCart(product)}
                      className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors shadow-lg"
                    >
                      <ShoppingCart className="h-5 w-5" />
                    </button>
                    <button className="p-3 bg-white rounded-xl hover:bg-slate-100 transition-colors shadow-lg">
                      <Heart className="h-5 w-5 text-slate-700" />
                    </button>
                  </div>
                  <Badge className="absolute top-3 left-3 bg-white/95 text-slate-800 border-0 shadow-sm">
                    {product.category}
                  </Badge>
                </div>
                <CardContent className="p-5">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold text-slate-900 mb-1.5 line-clamp-1 hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2 min-h-[2.5rem]">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    <div className="flex items-center text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="ml-1 text-sm font-medium text-slate-600">
                        {product.rating}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/favicon.svg" alt="Store" className="h-9 w-9 rounded-xl object-contain" />
                <span className="text-lg font-bold text-white">Store</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Your trusted online store for electronics and tech. Best products, best prices.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Categories</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/" className="hover:text-white transition-colors">Electronics</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Computers</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Accessories</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Smart Home</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Clothing</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Groceries</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Shipping</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Returns</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li>Email: support@techstore.com</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>Address: 123 Commerce St</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-10 pt-8 text-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
