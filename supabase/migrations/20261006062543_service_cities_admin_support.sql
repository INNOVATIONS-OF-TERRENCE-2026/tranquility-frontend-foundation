CREATE TABLE IF NOT EXISTS public.service_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_cities TO authenticated;
GRANT ALL ON public.service_cities TO service_role;
ALTER TABLE public.service_cities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Verified owner manages service cities" ON public.service_cities;
CREATE POLICY "Verified owner manages service cities"
ON public.service_cities FOR ALL TO authenticated
USING ((select private.is_owner()))
WITH CHECK ((select private.is_owner()));

DROP TRIGGER IF EXISTS service_cities_updated_at ON public.service_cities;
CREATE TRIGGER service_cities_updated_at
BEFORE UPDATE ON public.service_cities
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.service_cities (name, slug, latitude, longitude, is_active, sort_order)
VALUES
  ('Dallas','dallas',32.7767,-96.7970,true,10),
  ('Fort Worth','fort-worth',32.7555,-97.3308,true,20),
  ('Arlington','arlington',32.7357,-97.1081,true,30),
  ('Plano','plano',33.0198,-96.6989,true,40),
  ('Irving','irving',32.8140,-96.9489,true,50),
  ('Garland','garland',32.9126,-96.6389,true,60),
  ('Frisco','frisco',33.1507,-96.8236,true,70),
  ('McKinney','mckinney',33.1972,-96.6398,true,80),
  ('Grand Prairie','grand-prairie',32.7459,-96.9978,true,90),
  ('Denton','denton',33.2148,-97.1331,true,100),
  ('Mesquite','mesquite',32.7668,-96.5992,true,110),
  ('Carrollton','carrollton',32.9537,-96.8903,true,120),
  ('Lewisville','lewisville',33.0462,-96.9942,true,130),
  ('Richardson','richardson',32.9483,-96.7299,true,140),
  ('Euless','euless',32.8371,-97.0819,true,150)
ON CONFLICT (name) DO UPDATE SET
  slug=EXCLUDED.slug,
  latitude=EXCLUDED.latitude,
  longitude=EXCLUDED.longitude,
  is_active=EXCLUDED.is_active,
  sort_order=EXCLUDED.sort_order;
