CREATE TABLE public.service_cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.service_cities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_cities TO authenticated;
GRANT ALL ON public.service_cities TO service_role;

ALTER TABLE public.service_cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active service cities"
  ON public.service_cities FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins manage service cities"
  ON public.service_cities FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER service_cities_updated_at
  BEFORE UPDATE ON public.service_cities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX service_cities_sort_idx ON public.service_cities (sort_order, name);

INSERT INTO public.service_cities (name, slug, latitude, longitude, sort_order) VALUES
  ('Dallas', 'dallas', 32.7767, -96.797, 10),
  ('Fort Worth', 'fort-worth', 32.7555, -97.3308, 20),
  ('Arlington', 'arlington', 32.7357, -97.1081, 30),
  ('Plano', 'plano', 33.0198, -96.6989, 40),
  ('Irving', 'irving', 32.814, -96.9489, 50),
  ('Garland', 'garland', 32.9126, -96.6389, 60),
  ('Frisco', 'frisco', 33.1507, -96.8236, 70),
  ('McKinney', 'mckinney', 33.1972, -96.6398, 80),
  ('Grand Prairie', 'grand-prairie', 32.7459, -96.9978, 90),
  ('Denton', 'denton', 33.2148, -97.1331, 100),
  ('Mesquite', 'mesquite', 32.7668, -96.5992, 110),
  ('Carrollton', 'carrollton', 32.9537, -96.8903, 120),
  ('Lewisville', 'lewisville', 33.0462, -96.9942, 130),
  ('Richardson', 'richardson', 32.9483, -96.7299, 140),
  ('Euless', 'euless', 32.8371, -97.0819, 5);