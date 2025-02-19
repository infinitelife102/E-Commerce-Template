import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById, getRelatedProducts } from '@/data/mockProducts';
import type { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  Plus,
  Minus,
} from 'lucide-react';
import { toast } from 'sonner';

const ZOOM_LENS_WIDTH = 240;
const ZOOM_LENS_HEIGHT = 220;
const ZOOM_SCALE = 2.2;

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [zoomVisible, setZoomVisible] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [zoomBgPos, setZoomBgPos] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ w: 400, h: 400 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const { addToCart, getCartCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    window.scrollTo(0, 0);
    setLoading(true);
    const p = getProductById(id);
    if (p) {
      setProduct(p);
      setRelatedProducts(getRelatedProducts(p.category, p.id));
    } else {
      toast.error('Product not found.');
      navigate('/');
    }
    setLoading(false);
  }, [id, navigate]);

  function handleAddToCart() {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  }

  function handleImageMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = imageContainerRef.current;
    if (!el) return;
    if (!zoomVisible) {
      setZoomVisible(true);
    }
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;
    setContainerSize({ w, h });
    const lensHalfW = ZOOM_LENS_WIDTH / 2;
    const lensHalfH = ZOOM_LENS_HEIGHT / 2;
    const posX = Math.max(0, Math.min(w, x));
    const posY = Math.max(0, Math.min(h, y));
    const lensLeft = Math.max(0, Math.min(w - ZOOM_LENS_WIDTH, posX - lensHalfW));
    const lensTop = Math.max(0, Math.min(h - ZOOM_LENS_HEIGHT, posY - lensHalfH));
    const bgX = lensHalfW - posX * ZOOM_SCALE;
    const bgY = lensHalfH - posY * ZOOM_SCALE;
    setZoomPos({ x: lensLeft, y: lensTop });
    setZoomBgPos({ x: bgX, y: bgY });
  }

  function handleImageMouseLeave() {
    setZoomVisible(false);
  }

  function handleImageMouseEnter() {
    setZoomVisible(true);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img
                src={`${import.meta.env.BASE_URL}favicon.svg`}
                alt="Store"
                className="h-10 w-10 rounded-xl shadow-lg shadow-primary/25 object-contain"
              />
              <span className="text-xl font-bold text-slate-900 hidden sm:block">Store</span>
            </Link>
            <Link to="/cart" className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-600">
              <ShoppingCart className="h-6 w-6" />
              {getCartCount() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartCount()}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-600 hover:text-slate-900 mb-6 font-medium"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          <div
            ref={imageContainerRef}
            className="relative rounded-2xl overflow-hidden bg-white shadow-xl border border-slate-200/50 aspect-square cursor-crosshair"
            onMouseMove={handleImageMouseMove}
            onMouseLeave={handleImageMouseLeave}
            onMouseEnter={handleImageMouseEnter}
          >
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover select-none pointer-events-none"
              draggable={false}
            />
            {zoomVisible && (
              <div
                className="absolute border-2 border-white rounded-lg shadow-xl bg-white pointer-events-none overflow-hidden"
                style={{
                  width: ZOOM_LENS_WIDTH,
                  height: ZOOM_LENS_HEIGHT,
                  left: zoomPos.x,
                  top: zoomPos.y,
                  backgroundImage: `url(${product.image_url})`,
                  backgroundSize: `${containerSize.w * ZOOM_SCALE}px ${containerSize.h * ZOOM_SCALE}px`,
                  backgroundPosition: `${zoomBgPos.x}px ${zoomBgPos.y}px`,
                }}
              />
            )}
          </div>

          <div className="space-y-6">
            <div>
              <Badge className="mb-3 rounded-lg bg-primary/10 text-primary border-0">
                {product.category}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 text-slate-600">
                <div className="flex items-center text-amber-500">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="ml-1 font-semibold text-slate-900">{product.rating}</span>
                </div>
                <span className="text-slate-300">|</span>
                <span>In stock: {product.stock}</span>
              </div>
            </div>

            <div className="text-3xl font-bold text-primary">
              {formatPrice(product.price)}
            </div>

            <p className="text-slate-600 leading-relaxed text-lg">
              {product.description}
            </p>

            <div className="flex items-center gap-4">
              <span className="text-slate-700 font-medium">Quantity</span>
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-slate-100 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-5 font-semibold min-w-[2.5rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-3 hover:bg-slate-100 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 h-14 text-base rounded-xl font-semibold shadow-lg shadow-primary/25"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to cart
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-6 rounded-xl" type="button">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-6 rounded-xl" type="button">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200/50">
                <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium text-slate-700">Free shipping</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200/50">
                <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium text-slate-700">1-year warranty</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200/50">
                <RotateCcw className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium text-slate-700">30-day returns</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start rounded-xl bg-slate-100 p-1">
              <TabsTrigger value="description" className="rounded-lg">Description</TabsTrigger>
              <TabsTrigger value="specs" className="rounded-lg">Specs</TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-lg">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <Card className="rounded-2xl border-slate-200/50 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Product description</h3>
                  <p className="text-slate-600 leading-relaxed">{product.description}</p>
                  <p className="text-slate-600 leading-relaxed mt-4">
                    Built for quality and performance. Premium materials and precise manufacturing
                    ensure durability for long-term use.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="specs" className="mt-6">
              <Card className="rounded-2xl border-slate-200/50 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Technical specs</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex justify-between py-3 border-b border-slate-100">
                      <span className="text-slate-600">Category</span>
                      <span className="font-medium">{product.category}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-slate-100">
                      <span className="text-slate-600">Stock</span>
                      <span className="font-medium">{product.stock} units</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-slate-100">
                      <span className="text-slate-600">Rating</span>
                      <span className="font-medium">{product.rating}/5.0</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-slate-100">
                      <span className="text-slate-600">SKU</span>
                      <span className="font-medium">PROD-{product.id.slice(-6)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <Card className="rounded-2xl border-slate-200/50 shadow-sm">
                <CardContent className="p-8">
                  <div className="text-center py-8">
                    <Star className="h-14 w-14 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No reviews yet</h3>
                    <p className="text-slate-500">Be the first to leave a review!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-14">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Related products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((item) => (
                <Link
                  key={item.id}
                  to={`/product/${item.id}`}
                  className="block group overflow-hidden rounded-2xl border-0 shadow-md hover:shadow-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Card className="h-full overflow-hidden rounded-2xl border-0 shadow-none transition-shadow group-hover:shadow-lg">
                    <div className="aspect-square overflow-hidden bg-slate-100">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-primary font-bold">{formatPrice(item.price)}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; {new Date().getFullYear()} Store. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
