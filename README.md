# Store — E-commerce Demo

A modern, front-end-only e-commerce demo built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**. No backend or authentication; products and cart are powered by mock data and local storage.

## Features

- **Product catalog** — Browse products by category (Electronics, Computers, Accessories, Smart Home) with search
- **Product detail** — Full product page with description, specs, and related products
- **Shopping cart** — Add/remove items, adjust quantity; cart persists in `localStorage`
- **Checkout flow** — Place order with a shipping address (simulated; no payment)
- **Responsive UI** — Mobile-friendly layout with a clean, store-style design

## Tech Stack

| Area        | Stack                          |
|------------|---------------------------------|
| Framework  | React 19                       |
| Build      | Vite 7                         |
| Language   | TypeScript                     |
| Styling    | Tailwind CSS, Radix UI (shadcn)|
| Routing    | React Router 7                 |
| State      | React Context (Cart), local state |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Install and run

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

No environment variables or external services are required.

## Project Structure

```
src/
├── data/
│   └── mockProducts.ts    # Product list and helpers (getProducts, getProductById, etc.)
├── contexts/
│   ├── AuthContext.tsx    # No-op auth (no login)
│   └── CartContext.tsx    # Cart state + localStorage
├── pages/
│   ├── Home.tsx           # Home + product grid
│   ├── ProductDetail.tsx  # Single product page
│   └── Cart.tsx           # Cart + checkout dialog
├── components/
│   └── ui/                # Reusable UI (Button, Card, Dialog, etc.)
├── lib/
│   └── utils.ts           # cn(), formatPrice()
├── types/
│   └── index.ts           # Product, CartItem, User, etc.
├── App.tsx
└── main.tsx
```

## Routes

| Path           | Page          | Description                    |
|----------------|---------------|--------------------------------|
| `/`            | Home          | Hero, filters, product grid   |
| `/product/:id` | Product detail| Product info + related items  |
| `/cart`        | Cart          | Cart list + order summary + checkout |

## Customization

- **Products** — Edit `src/data/mockProducts.ts` to change names, prices, images (Unsplash URLs), and categories.
- **Theme** — Primary color and radius are in `src/index.css` (`:root` CSS variables). Tailwind config is in `tailwind.config.js`.
- **Free shipping** — Threshold and shipping cost are in `src/pages/Cart.tsx` (`FREE_SHIPPING_THRESHOLD`, `SHIPPING_COST`).

## Scripts

| Command       | Description              |
|---------------|--------------------------|
| `npm run dev` | Start dev server         |
| `npm run build` | Type-check + production build |
| `npm run preview` | Serve production build |
| `npm run lint` | Run ESLint               |

## License

MIT.
