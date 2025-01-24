-- Supabase E-Commerce Database Schema
-- 이 SQL을 Supabase SQL Editor에서 실행하여 데이터베이스를 설정하세요

-- ============================================
-- 1. 테이블 생성
-- ============================================

-- 상품 테이블
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

-- 프로필 테이블 (사용자 정보)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 장바구니 테이블
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)
);

-- 주문 테이블
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    total_amount INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    shipping_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 주문 상세 테이블
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL,
    price INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- 2. Row Level Security (RLS) 설정
-- ============================================

-- 상품 테이블 RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "상품은 누구나 조회 가능" ON products
    FOR SELECT USING (true);

CREATE POLICY "상품은 관리자만 수정 가능" ON products
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM profiles WHERE email LIKE '%admin%'
    ));

-- 프로필 테이블 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "프로필은 본인만 조회 가능" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "프로필은 본인만 수정 가능" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "프로필은 본인만 삭제 가능" ON profiles
    FOR DELETE USING (auth.uid() = id);

CREATE POLICY "프로필은 인증된 사용자만 생성 가능" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 장바구니 테이블 RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "장바구니는 본인만 조회 가능" ON cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "장바구니는 본인만 추가 가능" ON cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "장바구니는 본인만 수정 가능" ON cart_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "장바구니는 본인만 삭제 가능" ON cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- 주문 테이블 RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "주문은 본인만 조회 가능" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "주문은 본인만 생성 가능" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 주문 상세 테이블 RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "주문 상세은 본인만 조회 가능" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- ============================================
-- 3. 트리거 및 함수
-- ============================================

-- 새 사용자 가입 시 프로필 자동 생성
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

-- 트리거 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 4. 테스트 데이터
-- ============================================

-- 테스트 상품 데이터
INSERT INTO products (name, description, price, image_url, category, stock, rating) VALUES
('프리미엄 무선 헤드폰', '고음질 블루투스 5.0 무선 헤드폰. 40시간 배터리 수명, 액티브 노이즈 캔슬링 기능', 299000, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60', '전자기기', 50, 4.8),
('스마트 워치 프로', '건강 모니터링, GPS, 수영 방수 기능을 갖춘 프리미엄 스마트 워치', 399000, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60', '전자기기', 30, 4.6),
('울트라북 15인치', '최신 프로세서, 16GB RAM, 512GB SSD를 탑재한 초경량 노트북', 1299000, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60', '컴퓨터', 20, 4.9),
('4K 모니터 27인치', 'IPS 패널, 99% sRGB, HDR 지원的专业级 디스플레이', 549000, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60', '컴퓨터', 25, 4.7),
('기계식 키보드 RGB', '청축 스위치, 커스텀 RGB 백라이트, 프로그래머블 키', 189000, 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500&auto=format&fit=crop&q=60', '컴퓨터', 40, 4.5),
('게이밍 마우스', '16000 DPI, 초경량 설계, 프로그래머블 버튼 8개', 89000, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=60', '컴퓨터', 60, 4.4),
('블루투스 스피커', '360도 서라운드 사운드, 24시간 재생, 방수 IPX7', 159000, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=60', '전자기기', 35, 4.6),
('무선 충전 패드', '15W 고속 충전, 멀티 디바이스 지원, LED 상태 표시', 49000, 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=500&auto=format&fit=crop&q=60', '액세서리', 100, 4.3),
('노이즈 캔슬링 이어폰', '진정한 무선, ANC, 투명 모드, 30시간 배터리', 229000, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=60', '전자기기', 45, 4.7),
('태블릿 10.5인치', '2K 디스플레이, 스타일러스 지원, 올데이 배터리', 499000, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=60', '전자기기', 15, 4.5),
('스마트 홈 허브', '음성 제어, IoT 기기 연결, AI 어시스턴트 내장', 129000, 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=500&auto=format&fit=crop&q=60', '스마트홈', 40, 4.2),
('보안 칩라 2K', '야간 투시, 양방향 오디오, 클라우드 저장, AI 감지', 99000, 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=500&auto=format&fit=crop&q=60', '스마트홈', 55, 4.4);

-- ============================================
-- 5. 인덱스 생성 (성능 최적화)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
