-- Migration 002: Add Book Pricing, Replacement Fine Rules, and Seed Academic Catalog
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) DEFAULT 450.00 CHECK (price >= 0),
ADD COLUMN IF NOT EXISTS replacement_cost NUMERIC(10, 2) DEFAULT 600.00 CHECK (replacement_cost >= 0);

-- Insert realistic VVITU academic books if table is empty
INSERT INTO public.books (id, isbn, title, author, category, publisher, publication_year, description, price, replacement_cost)
VALUES 
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '978-0132350884',
    'Clean Code: A Handbook of Agile Software Craftsmanship',
    'Robert C. Martin',
    'Computer Science',
    'Prentice Hall',
    2008,
    'Even bad code can function. But if code isn''t clean, it can bring a development organization to its knees.',
    650.00,
    800.00
  ),
  (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    '978-0262033848',
    'Introduction to Algorithms (CLRS)',
    'Thomas H. Cormen, Charles E. Leiserson',
    'Computer Science',
    'MIT Press',
    2009,
    'Comprehensive textbook on computer algorithms used globally across elite universities.',
    1250.00,
    1500.00
  ),
  (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    '978-0134685991',
    'Effective Java (3rd Edition)',
    'Joshua Bloch',
    'Computer Science',
    'Addison-Wesley',
    2018,
    'Definitive guide to best practices in the Java programming language.',
    750.00,
    950.00
  ),
  (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    '978-0199468911',
    'Basic Electrical and Electronics Engineering',
    'B.R. Patil',
    'Electronics & Communication',
    'Oxford University Press',
    2016,
    'Core engineering textbook for ECE and EEE university curriculum.',
    520.00,
    650.00
  ),
  (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    '978-9332573765',
    'Higher Engineering Mathematics',
    'B.S. Grewal',
    'Mathematics',
    'Khanna Publishers',
    2017,
    'Standard university reference for calculus, matrices, and differential equations.',
    890.00,
    1100.00
  )
ON CONFLICT (isbn) DO NOTHING;

-- Seed physical copies for the sample books
INSERT INTO public.book_copies (book_id, copy_code, status, shelf_location)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'VVITU-CS-001', 'available', 'Stack A-1'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'VVITU-CS-002', 'available', 'Stack A-1'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'VVITU-ALGO-001', 'available', 'Stack A-2'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'VVITU-ALGO-002', 'available', 'Stack A-2'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'VVITU-JAVA-001', 'available', 'Stack B-1'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'VVITU-ECE-001', 'available', 'Stack C-3'),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'VVITU-MATH-001', 'available', 'Stack D-2')
ON CONFLICT (copy_code) DO NOTHING;
