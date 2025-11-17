-- Create storage buckets for FEMD TORNEOS
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('imagenes-web', 'imagenes-web', true),
  ('imagenes-torneos', 'imagenes-torneos', true),
  ('carteles', 'carteles', true);

-- RLS Policies for imagenes-web bucket
CREATE POLICY "Public access to imagenes-web"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'imagenes-web');

CREATE POLICY "Authenticated users can upload to imagenes-web"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'imagenes-web');

CREATE POLICY "Authenticated users can update imagenes-web"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'imagenes-web');

CREATE POLICY "Authenticated users can delete from imagenes-web"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'imagenes-web');

-- RLS Policies for imagenes-torneos bucket
CREATE POLICY "Public access to imagenes-torneos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'imagenes-torneos');

CREATE POLICY "Authenticated users can upload to imagenes-torneos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'imagenes-torneos');

CREATE POLICY "Authenticated users can update imagenes-torneos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'imagenes-torneos');

CREATE POLICY "Authenticated users can delete from imagenes-torneos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'imagenes-torneos');

-- RLS Policies for carteles bucket
CREATE POLICY "Public access to carteles"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'carteles');

CREATE POLICY "Authenticated users can upload to carteles"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'carteles');

CREATE POLICY "Authenticated users can update carteles"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'carteles');

CREATE POLICY "Authenticated users can delete from carteles"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'carteles');