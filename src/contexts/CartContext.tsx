import React, { createContext, useContext, useEffect, useState } from 'react';
import { getProductById } from '@/data/mockProducts';
import type { CartItem, Product } from '@/types';
import { toast } from 'sonner';

const CART_STORAGE_KEY = 'ecommerce-cart';

interface StoredCartItem {
  id: string;
  product_id: string;
  quantity: number;
}

function loadCart(): StoredCartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredCartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(items: StoredCartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

function hydrateCart(stored: StoredCartItem[]): CartItem[] {
  return stored
    .map((s) => {
      const product = getProductById(s.product_id);
      if (!product) return null;
      return {
        id: s.id,
        user_id: '',
        product_id: s.product_id,
        quantity: s.quantity,
        product,
      } as CartItem;
    })
    .filter((x): x is CartItem => x !== null);
}

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = loadCart();
    setCartItems(hydrateCart(stored));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return;
    const stored: StoredCartItem[] = cartItems.map((item) => ({
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
    }));
    saveCart(stored);
  }, [cartItems, loading]);

  async function addToCart(product: Product, quantity = 1) {
    const existing = cartItems.find((item) => item.product_id === product.id);
    if (existing) {
      const newQty = existing.quantity + quantity;
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === existing.id ? { ...item, quantity: newQty } : item
        )
      );
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        user_id: '',
        product_id: product.id,
        quantity,
        product,
      };
      setCartItems((prev) => [...prev, newItem]);
    }
    toast.success('Added to cart!');
  }

  async function removeFromCart(cartItemId: string) {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
    toast.success('Removed from cart.');
  }

  async function updateQuantity(cartItemId: string, quantity: number) {
    if (quantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === cartItemId ? { ...item, quantity } : item
      )
    );
  }

  async function clearCart() {
    setCartItems([]);
  }

  function getCartTotal() {
    return cartItems.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);
  }

  function getCartCount() {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
