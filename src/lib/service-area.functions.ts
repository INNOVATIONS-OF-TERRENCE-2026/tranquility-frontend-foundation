import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

export type ServiceCityRow = {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  sort_order: number;
};

export const listServiceCities = createServerFn({ method: "GET" }).handler(
  async (): Promise<ServiceCityRow[]> => {
    const supabase = createClient(
      import.meta.env["VITE_SUPABASE_URL"]!,
      import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]!,
      {
        auth: { persistSession: false, autoRefreshToken: false },
        global: {
          fetch: (input, init) => {
            const headers = new Headers(init?.headers);
            headers.delete("Authorization");
            return fetch(input, { ...init, headers });
          },
        },
      },
    );
    const { data, error } = await supabase
      .from("service_cities")
      .select("id, name, slug, latitude, longitude, is_active, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw new Error("Unable to load service cities.");
    return (data ?? []) as ServiceCityRow[];
  },
);
