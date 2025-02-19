-- Supabase E-Commerce Database Schema
-- Run this SQL in the Supabase SQL Editor to set up the database

-- ============================================
-- 1. Table creation
-- ============================================

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    category TEXT NOT NULL,
    stock INTEGER DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 5.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Profiles table (user info)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    total_amount INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    shipping_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL,
    price INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- 2. Row Level Security (RLS) setup
-- ============================================

-- Products table RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify products" ON products
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM profiles WHERE email LIKE '%admin%'
    ));

-- Profiles table RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles readable by owner only" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Profiles updatable by owner only" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Profiles deletable by owner only" ON profiles
    FOR DELETE USING (auth.uid() = id);

CREATE POLICY "Profiles creatable by authenticated user only" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Cart items table RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cart readable by owner only" ON cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Cart insertable by owner only" ON cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Cart updatable by owner only" ON cart_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Cart deletable by owner only" ON cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- Orders table RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Orders readable by owner only" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Orders creatable by owner only" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items table RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order items readable by owner only" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- ============================================
-- 3. Triggers and functions
-- ============================================

-- Automatically create profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 4. Test data
-- ============================================

-- Sample product data
INSERT INTO products (name, description, price, image_url, category, stock, rating) VALUES
('Premium Wireless Headphones', 'High-fidelity Bluetooth 5.0 wireless headphones with 40-hour battery life and active noise cancelling.', 299000, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60', 'Electronics', 50, 4.8),
('Smart Watch Pro', 'Premium smartwatch with health monitoring, GPS, and swim-proof water resistance.', 399000, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60', 'Electronics', 30, 4.6),
('Ultrabook 15-inch', 'Ultra-light laptop with latest processor, 16GB RAM, and 512GB SSD.', 1299000, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60', 'Computers', 20, 4.9),
('4K Monitor 27-inch', 'IPS panel, 99% sRGB, HDR support, professional-grade display.', 549000, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60', 'Computers', 25, 4.7),
('Mechanical Keyboard RGB', 'Clicky switches, custom RGB backlight, programmable keys.', 189000, 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500&auto=format&fit=crop&q=60', 'Computers', 40, 4.5),
('Gaming Mouse', '16000 DPI, ultra-light design, 8 programmable buttons.', 89000, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=60', 'Computers', 60, 4.4),
('Bluetooth Speaker', '360° surround sound, 24-hour playback, IPX7 waterproof.', 159000, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=60', 'Electronics', 35, 4.6),
('Wireless Charging Pad', '15W fast charging, multi-device support, LED status indicator.', 49000, 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=500&auto=format&fit=crop&q=60', 'Accessories', 100, 4.3),
('Noise Cancelling Earbuds', 'True wireless earbuds with ANC, transparency mode, and 30-hour battery.', 229000, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=60', 'Electronics', 45, 4.7),
('Tablet 10.5-inch', '2K display, stylus support, all-day battery life.', 499000, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=60', 'Electronics', 15, 4.5),
('Smart Home Hub', 'Voice control, IoT device connectivity, built-in AI assistant.', 129000, 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=500&auto=format&fit=crop&q=60', 'Smart Home', 40, 4.2),
('Security Camera 2K', 'Night vision, two-way audio, cloud storage, AI detection.', 99000, 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=500&auto=format&fit=crop&q=60', 'Smart Home', 55, 4.4);

-- ============================================
-- 5. Indexes (performance optimization)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
