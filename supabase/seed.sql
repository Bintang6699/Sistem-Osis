-- =====================================================
-- SEED DATA - DEVELOPMENT ONLY
-- Run this AFTER schema.sql
-- =====================================================

-- NOTE: You must first create a user via Supabase Auth dashboard/API,
-- then manually update their role to 'admin' or 'bendahara' in the profiles table.

-- Sample Members (Siswa)
INSERT INTO public.members (name, nis, class, status) VALUES
  ('Ahmad Rizki', '24001', 'IX A', 'Aktif'),
  ('Budi Santoso', '24002', 'IX A', 'Aktif'),
  ('Citra Dewi', '24003', 'IX A', 'Aktif'),
  ('Dimas Pratama', '24004', 'IX A', 'Aktif'),
  ('Eka Putri', '24005', 'IX A', 'Aktif'),
  ('Faisal Hadi', '24006', 'IX B', 'Aktif'),
  ('Gita Rahayu', '24007', 'IX B', 'Aktif'),
  ('Hendra Wijaya', '24008', 'IX B', 'Aktif'),
  ('Indah Sari', '24009', 'IX B', 'Aktif'),
  ('Joko Susilo', '24010', 'IX B', 'Aktif'),
  ('Kevin Anggara', '24011', 'VIII A', 'Aktif'),
  ('Lina Kusuma', '24012', 'VIII A', 'Aktif'),
  ('Mira Safitri', '24013', 'VIII A', 'Aktif'),
  ('Nanda Putra', '24014', 'VIII A', 'Aktif'),
  ('Olivia Sari', '24015', 'VIII A', 'Aktif'),
  ('Putri Amelia', '24016', 'VIII B', 'Aktif'),
  ('Rizky Maulana', '24017', 'VIII B', 'Aktif'),
  ('Sari Permata', '24018', 'VIII B', 'Aktif'),
  ('Taufik Hidayat', '24019', 'VIII B', 'Aktif'),
  ('Umar Faruq', '24020', 'VIII B', 'Aktif');
