-- =====================================================
-- SISTEM INFORMASI KEUANGAN OSIS - DATABASE SCHEMA
-- Supabase (PostgreSQL)
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES (linked to Supabase Auth)
-- =====================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'bendahara', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'viewer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 2. MEMBERS (Data Siswa/Anggota)
-- =====================================================
CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  nis TEXT UNIQUE,
  class TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Tidak Aktif', 'Alumni')),
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 3. CATEGORIES (Kategori Transaksi)
-- =====================================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 4. INCOME TRANSACTIONS (Kas Masuk)
-- =====================================================
CREATE TABLE public.income_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  payer_name TEXT NOT NULL, -- nama pembayar (bisa override nama anggota)
  payer_class TEXT NOT NULL, -- kelas pembayar
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  period TEXT NOT NULL, -- misal: "September 2026", "Minggu ke-1 Sep 2026"
  payment_method TEXT NOT NULL DEFAULT 'Tunai' CHECK (payment_method IN ('Tunai', 'Transfer', 'QRIS', 'Lainnya')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Lunas' CHECK (status IN ('Lunas', 'Cicilan', 'Pending')),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 5. EXPENSE TRANSACTIONS (Kas Keluar)
-- =====================================================
CREATE TABLE public.expense_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_number TEXT UNIQUE NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  purpose TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
  paid_by TEXT NOT NULL, -- nama penerima/pembeli
  description TEXT,
  receipt_url TEXT,
  recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 6. EXPENSE ITEMS (Detail Item / Struk)
-- =====================================================
CREATE TABLE public.expense_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_transaction_id UUID NOT NULL REFERENCES public.expense_transactions(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(15, 2) NOT NULL CHECK (unit_price >= 0),
  subtotal NUMERIC(15, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES for performance
-- =====================================================
CREATE INDEX idx_income_member_id ON public.income_transactions(member_id);
CREATE INDEX idx_income_payment_date ON public.income_transactions(payment_date DESC);
CREATE INDEX idx_income_period ON public.income_transactions(period);
CREATE INDEX idx_income_recorded_by ON public.income_transactions(recorded_by);
CREATE INDEX idx_expense_expense_date ON public.expense_transactions(expense_date DESC);
CREATE INDEX idx_expense_category ON public.expense_transactions(category_id);
CREATE INDEX idx_expense_recorded_by ON public.expense_transactions(recorded_by);
CREATE INDEX idx_expense_items_tx ON public.expense_items(expense_transaction_id);
CREATE INDEX idx_members_class ON public.members(class);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_items ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES policies
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin can manage all profiles" ON public.profiles
  FOR ALL USING (public.get_my_role() = 'admin');

-- MEMBERS policies
CREATE POLICY "Members viewable by all authenticated" ON public.members
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin and bendahara can manage members" ON public.members
  FOR INSERT WITH CHECK (public.get_my_role() IN ('admin', 'bendahara'));
CREATE POLICY "Admin and bendahara can update members" ON public.members
  FOR UPDATE USING (public.get_my_role() IN ('admin', 'bendahara'));
CREATE POLICY "Only admin can delete members" ON public.members
  FOR DELETE USING (public.get_my_role() = 'admin');

-- CATEGORIES policies
CREATE POLICY "Categories viewable by all authenticated" ON public.categories
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin and bendahara can manage categories" ON public.categories
  FOR INSERT WITH CHECK (public.get_my_role() IN ('admin', 'bendahara'));
CREATE POLICY "Admin and bendahara can update categories" ON public.categories
  FOR UPDATE USING (public.get_my_role() IN ('admin', 'bendahara'));
CREATE POLICY "Only admin can delete categories" ON public.categories
  FOR DELETE USING (public.get_my_role() = 'admin');

-- INCOME TRANSACTIONS policies
CREATE POLICY "Income transactions viewable by all authenticated" ON public.income_transactions
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin and bendahara can create income" ON public.income_transactions
  FOR INSERT WITH CHECK (public.get_my_role() IN ('admin', 'bendahara'));
CREATE POLICY "Admin and bendahara can update income" ON public.income_transactions
  FOR UPDATE USING (public.get_my_role() IN ('admin', 'bendahara'));
CREATE POLICY "Only admin can delete income" ON public.income_transactions
  FOR DELETE USING (public.get_my_role() = 'admin');

-- EXPENSE TRANSACTIONS policies
CREATE POLICY "Expense transactions viewable by all authenticated" ON public.expense_transactions
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin and bendahara can create expense" ON public.expense_transactions
  FOR INSERT WITH CHECK (public.get_my_role() IN ('admin', 'bendahara'));
CREATE POLICY "Admin and bendahara can update expense" ON public.expense_transactions
  FOR UPDATE USING (public.get_my_role() IN ('admin', 'bendahara'));
CREATE POLICY "Only admin can delete expense" ON public.expense_transactions
  FOR DELETE USING (public.get_my_role() = 'admin');

-- EXPENSE ITEMS policies
CREATE POLICY "Expense items viewable by all authenticated" ON public.expense_items
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin and bendahara can manage expense items" ON public.expense_items
  FOR INSERT WITH CHECK (public.get_my_role() IN ('admin', 'bendahara'));
CREATE POLICY "Admin and bendahara can update expense items" ON public.expense_items
  FOR UPDATE USING (public.get_my_role() IN ('admin', 'bendahara'));
CREATE POLICY "Only admin can delete expense items" ON public.expense_items
  FOR DELETE USING (public.get_my_role() = 'admin');

-- =====================================================
-- SEED DATA (Sample data for development)
-- =====================================================

-- Insert default categories
INSERT INTO public.categories (name, type, color) VALUES
  ('Kas Mingguan', 'income', '#22c55e'),
  ('Iuran Anggota OSIS', 'income', '#16a34a'),
  ('Sumbangan', 'income', '#4ade80'),
  ('Dana Kegiatan', 'income', '#86efac'),
  ('Bantuan Sekolah', 'income', '#15803d'),
  ('Pemasukan Lainnya', 'income', '#166534'),
  ('Konsumsi', 'expense', '#ef4444'),
  ('Alat Tulis', 'expense', '#dc2626'),
  ('Dekorasi', 'expense', '#f97316'),
  ('Transportasi', 'expense', '#fb923c'),
  ('Dokumentasi', 'expense', '#a855f7'),
  ('Perlengkapan Kegiatan', 'expense', '#6366f1'),
  ('Pengeluaran Lainnya', 'expense', '#94a3b8');
