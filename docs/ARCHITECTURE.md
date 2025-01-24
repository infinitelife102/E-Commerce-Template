# Architecture

This document describes how the Store e-commerce demo is structured and how data flows.

## Overview

The app is a **client-only** SPA. There is no backend, no database, and no real authentication. All product data is static mock data; the cart is stored in the browser’s `localStorage`.

## Data Flow

### Products

- **Source:** `src/data/mockProducts.ts`
- **Exports:** `MOCK_PRODUCTS`, `getProducts()`, `getProductById(id)`, `getRelatedProducts(category, excludeId, limit)`, `CATEGORIES`
- **Usage:**
  - **Home:** `getProducts()` for the full list; filtering (category + search) is done in component state.
  - **ProductDetail:** `getProductById(id)` for the current product, `getRelatedProducts(...)` for the “Related products” section.

Product type is defined in `src/types/index.ts` (`Product`: id, name, description, price, image_url, category, stock, rating, created_at).

### Cart

- **Source:** `src/contexts/CartContext.tsx`
- **Storage:** `localStorage` under key `ecommerce-cart`. Stored shape: `{ id, product_id, quantity }[]`. On load, `product_id` is resolved via `getProductById()` to build full `CartItem` objects (with `product`).
- **API:**
  - `addToCart(product, quantity?)` — append or update quantity.
  - `removeFromCart(cartItemId)`, `updateQuantity(cartItemId, quantity)`, `clearCart()`.
  - `getCartTotal()`, `getCartCount()`.
- **Usage:** Cart page, product detail “Add to cart”, header cart icon and count.

No user id or auth is used; the cart is anonymous and device-specific.

### Auth

- **Source:** `src/contexts/AuthContext.tsx`
- **Behavior:** Provides `user: null`, `loading: false`, and no-op `signIn`, `signUp`, `signOut`. Kept so components that call `useAuth()` do not break; login/register pages and routes have been removed.

## Routing

- **Router:** React Router 7 (`BrowserRouter`), configured in `App.tsx`.
- **Routes:** `/` (Home), `/product/:id` (ProductDetail), `/cart` (Cart). No protected routes; cart is available without login.

## UI and Theming

- **Tailwind CSS** for layout and styling. Design tokens (primary, radius, etc.) come from CSS variables in `src/index.css` (`:root`).
- **Components:** Radix-based UI components in `src/components/ui/` (Button, Card, Dialog, Input, Tabs, etc.), composed in pages.
- **Formatting:** `formatPrice(price)` in `src/lib/utils.ts` formats numbers as USD.

## Build and Tooling

- **Vite** for dev server and production build.
- **TypeScript** for type checking (`tsc -b` in build).
- **Path alias:** `@/` → `src/` (see `vite.config.ts`).

No environment variables are required for the current mock-data setup.
