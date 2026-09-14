export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      booking_holds: {
        Row: {
          arrival_window: string
          booking_reference: string
          city: string
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          deposit_cents: number
          estimate_cents: number
          expires_at: string
          frequency: string
          id: string
          request_payload: Json
          service_address: string
          service_date: string
          service_type: string
          status: string
          zip: string
        }
        Insert: {
          arrival_window: string
          booking_reference: string
          city: string
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          deposit_cents?: number
          estimate_cents: number
          expires_at?: string
          frequency: string
          id?: string
          request_payload: Json
          service_address: string
          service_date: string
          service_type: string
          status?: string
          zip: string
        }
        Update: {
          arrival_window?: string
          booking_reference?: string
          city?: string
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          deposit_cents?: number
          estimate_cents?: number
          expires_at?: string
          frequency?: string
          id?: string
          request_payload?: Json
          service_address?: string
          service_date?: string
          service_type?: string
          status?: string
          zip?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          arrival_window: string
          booking_reference: string
          city: string
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          deposit_cents: number
          estimate_cents: number
          frequency: string
          hold_id: string | null
          id: string
          payment_reference: string | null
          payment_status: string
          request_payload: Json
          service_address: string
          service_date: string
          service_type: string
          zip: string
        }
        Insert: {
          arrival_window: string
          booking_reference: string
          city: string
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          deposit_cents?: number
          estimate_cents: number
          frequency: string
          hold_id?: string | null
          id?: string
          payment_reference?: string | null
          payment_status: string
          request_payload: Json
          service_address: string
          service_date: string
          service_type: string
          zip: string
        }
        Update: {
          arrival_window?: string
          booking_reference?: string
          city?: string
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          deposit_cents?: number
          estimate_cents?: number
          frequency?: string
          hold_id?: string | null
          id?: string
          payment_reference?: string | null
          payment_status?: string
          request_payload?: Json
          service_address?: string
          service_date?: string
          service_type?: string
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_hold_id_fkey"
            columns: ["hold_id"]
            isOneToOne: true
            referencedRelation: "booking_holds"
            referencedColumns: ["id"]
          },
        ]
      }
      career_applications: {
        Row: {
          additional_information: string | null
          availability: string
          city: string
          created_at: string
          email: string
          experience: string
          full_name: string
          id: string
          language: string
          phone: string
          reliable_transportation: boolean
        }
        Insert: {
          additional_information?: string | null
          availability: string
          city: string
          created_at?: string
          email: string
          experience: string
          full_name: string
          id?: string
          language?: string
          phone: string
          reliable_transportation: boolean
        }
        Update: {
          additional_information?: string | null
          availability?: string
          city?: string
          created_at?: string
          email?: string
          experience?: string
          full_name?: string
          id?: string
          language?: string
          phone?: string
          reliable_transportation?: boolean
        }
        Relationships: []
      }
      contact_inquiries: {
        Row: {
          created_at: string
          email: string
          id: string
          language: string
          name: string
          notes: string
          phone: string
          preferred_date: string | null
          service_type: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          language?: string
          name: string
          notes: string
          phone: string
          preferred_date?: string | null
          service_type: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          language?: string
          name?: string
          notes?: string
          phone?: string
          preferred_date?: string | null
          service_type?: string
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          approximate_size: string | null
          city: string
          contact_preference: string
          created_at: string
          desired_timing: string | null
          email: string
          id: string
          language: string
          name: string
          notes: string | null
          phone: string
          property_type: string
          scope: string
        }
        Insert: {
          approximate_size?: string | null
          city: string
          contact_preference: string
          created_at?: string
          desired_timing?: string | null
          email: string
          id?: string
          language?: string
          name: string
          notes?: string | null
          phone: string
          property_type: string
          scope: string
        }
        Update: {
          approximate_size?: string | null
          city?: string
          contact_preference?: string
          created_at?: string
          desired_timing?: string | null
          email?: string
          id?: string
          language?: string
          name?: string
          notes?: string | null
          phone?: string
          property_type?: string
          scope?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      reserve_booking_hold: {
        Args: {
          p_arrival_window: string
          p_booking_reference: string
          p_city: string
          p_customer_email: string
          p_customer_name: string
          p_customer_phone: string
          p_estimate_cents: number
          p_frequency: string
          p_request_payload: Json
          p_service_address: string
          p_service_date: string
          p_service_type: string
          p_zip: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
