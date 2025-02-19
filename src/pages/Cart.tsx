import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ChevronLeft,
  Truck,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 5.99;

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart, loading } = useCart();
  const navigate = useNavigate();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [processing, setProcessing] = useState(false);

  async function handleCheckout() {
    if (!shippingAddress.trim()) {
      toast.error('Please enter a shipping address.');
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      toast.success('Order placed successfully!');
      clearCart();
      setCheckoutOpen(false);
      setProcessing(false);
      navigate('/');
    }, 2000);
  }

  const shippingCost = getCartTotal() >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const totalAmount = getCartTotal() + shippingCost;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent" />
      </div>
    );
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
            <Link to="/cart" className="relative p-2.5 rounded-xl hover:bg-slate-100 text-primary">
              <ShoppingCart className="h-6 w-6" />
              {cartItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.reduce((c, i) => c + i.quantity, 0)}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-600 hover:text-slate-900 mr-4 p-2 rounded-lg hover:bg-slate-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Cart</h1>
          <span className="ml-3 text-slate-500">
            ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
          </span>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-slate-100 rounded-2xl p-10 w-36 h-36 mx-auto mb-6 flex items-center justify-center">
              <ShoppingCart className="h-20 w-20 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Your cart is empty</h2>
            <p className="text-slate-500 mb-8">Add items you like from the store.</p>
            <Link to="/">
              <Button size="lg" className="rounded-xl font-semibold">
                Continue shopping
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="overflow-hidden rounded-2xl border-slate-200/50 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex gap-5">
                      <Link to={`/product/${item.product_id}`} className="flex-shrink-0">
                        <div className="w-28 h-28 rounded-xl overflow-hidden bg-slate-100">
                          <img
                            src={item.product?.image_url}
                            alt={item.product?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.product_id}`}>
                          <h3 className="font-semibold text-slate-900 mb-1 hover:text-primary transition-colors line-clamp-1">
                            {item.product?.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-slate-500 mb-2">{item.product?.category}</p>
                        <p className="text-primary font-bold text-lg">
                          {formatPrice(item.product?.price || 0)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2.5 hover:bg-slate-100 disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4 font-semibold min-w-[2.5rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2.5 hover:bg-slate-100"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Link to="/">
                <Button variant="outline" className="w-full rounded-xl" type="button">
                  <ChevronLeft className="mr-2 h-5 w-5" />
                  Continue shopping
                </Button>
              </Link>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24 rounded-2xl border-slate-200/50 shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Order summary</h2>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span>{formatPrice(getCartTotal())}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Shipping</span>
                      <span>
                        {shippingCost === 0 ? (
                          <span className="text-green-600 font-medium">Free</span>
                        ) : (
                          formatPrice(shippingCost)
                        )}
                      </span>
                    </div>
                    {shippingCost > 0 && (
                      <p className="text-xs text-slate-500">
                        Add {formatPrice(Math.max(0, FREE_SHIPPING_THRESHOLD - getCartTotal()))} more for free shipping
                      </p>
                    )}
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between text-lg font-bold mb-6">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(totalAmount)}</span>
                  </div>
                  <Button
                    className="w-full h-12 text-base rounded-xl font-semibold shadow-lg shadow-primary/25"
                    onClick={() => setCheckoutOpen(true)}
                  >
                    Checkout
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center text-sm text-slate-600">
                      <Truck className="h-4 w-4 mr-2 text-primary" />
                      <span>Free shipping on orders over ${FREE_SHIPPING_THRESHOLD}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Tag className="h-4 w-4 mr-2 text-primary" />
                      <span>10% off first order</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Confirm order</DialogTitle>
            <DialogDescription>
              Enter your shipping address to complete the order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="address">Shipping address</Label>
              <Input
                id="address"
                placeholder="123 Main St, City, State..."
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="bg-slate-50 p-4 rounded-xl">
              <div className="flex justify-between mb-2 text-slate-600">
                <span>Subtotal</span>
                <span>{formatPrice(getCartTotal())}</span>
              </div>
              <div className="flex justify-between mb-2 text-slate-600">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleCheckout} disabled={processing} className="rounded-xl">
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Processing...
                </>
              ) : (
                'Place order'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="bg-slate-900 text-slate-500 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; {new Date().getFullYear()} Store. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
