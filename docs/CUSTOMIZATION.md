# Customization Guide

How to customize products, styling, and behavior without changing the core architecture.

## Products and Categories

**File:** `src/data/mockProducts.ts`

- **Add/remove products:** Edit the `MOCK_PRODUCTS` array. Each item must match the `Product` type: `id`, `name`, `description`, `price`, `image_url`, `category`, `stock`, `rating`, `created_at`.
- **Change categories:** Update the `CATEGORIES` array (first value is the “All” filter label). Ensure each product’s `category` matches one of these (except “All”).
- **Images:** Replace `image_url` with any public URL (e.g. Unsplash, your CDN). The app does not host images.

## Pricing and Currency

- **Display format:** `src/lib/utils.ts` exports `formatPrice(price)`. It uses `Intl.NumberFormat` with `en-US` and `USD`. To switch currency or locale, change the arguments there.
- **Cart shipping:** In `src/pages/Cart.tsx`, adjust `FREE_SHIPPING_THRESHOLD` (number) and `SHIPPING_COST` (number). They are in the same units as product prices (e.g. dollars if you use whole dollars in mock data).

## Theme and Styling

- **CSS variables:** In `src/index.css`, the `:root` block defines `--primary`, `--radius`, `--background`, etc. Changing these updates the look globally.
- **Tailwind:** `tailwind.config.js` extends theme (e.g. colors from CSS variables, border radius). Tweak there if you need new utility classes or tokens.

## Copy and Labels

All user-facing text is in the page components:

- **Home:** `src/pages/Home.tsx` (hero, trust bar, empty state, footer).
- **Product detail:** `src/pages/ProductDetail.tsx` (tabs, specs labels, “Related products”, etc.).
- **Cart:** `src/pages/Cart.tsx` (headings, summary labels, checkout dialog, shipping message).

Search for the string you want to change and edit it in place.

## Cart Persistence

Cart is stored in `localStorage` under the key `ecommerce-cart`. The shape is an array of `{ id, product_id, quantity }`. If you change product IDs in `mockProducts.ts`, existing cart entries with old IDs will not resolve to a product and will be skipped when hydrating (see `hydrateCart` in `CartContext.tsx`). To “reset” the cart, clear `localStorage` for this key or use a different key in `CartContext.tsx` (`CART_STORAGE_KEY`).

## Adding a New Page or Route

1. Create a new component under `src/pages/` (or `src/components/` if it’s reusable).
2. In `App.tsx`, add a `<Route path="..." element={<YourPage />} />`.
3. Link to the new route with `<Link to="...">` or `navigate(...)` from React Router.

No backend or env changes are required for a client-only page.
