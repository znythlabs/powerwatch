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
        PostgrestVersion: "14.1"
    }
    public: {
        Tables: {
            affected_areas: {
                Row: {
                    announcement_id: string
                    barangay: string
                    created_at: string
                    feeder: string | null
                    id: string
                    zone: string | null
                }
                Insert: {
                    announcement_id: string
                    barangay: string
                    created_at?: string
                    feeder?: string | null
                    id?: string
                    zone?: string | null
                }
                Update: {
                    announcement_id?: string
                    barangay?: string
                    created_at?: string
                    feeder?: string | null
                    id?: string
                    zone?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "affected_areas_announcement_id_fkey"
                        columns: ["announcement_id"]
                        isOneToOne: false
                        referencedRelation: "announcements"
                        referencedColumns: ["id"]
                    },
                ]
            }
            announcements: {
                Row: {
                    created_at: string
                    id: string
                    is_active: boolean
                    raw_text: string | null
                    reason: string
                    scheduled_end: string | null
                    scheduled_start: string
                    source: Database["public"]["Enums"]["source_type"]
                    source_url: string
                    summary_en: string
                    summary_fil: string
                    type: Database["public"]["Enums"]["announcement_type"]
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    is_active?: boolean
                    raw_text?: string | null
                    reason?: string
                    scheduled_end?: string | null
                    scheduled_start: string
                    source?: Database["public"]["Enums"]["source_type"]
                    source_url?: string
                    summary_en: string
                    summary_fil: string
                    type?: Database["public"]["Enums"]["announcement_type"]
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    is_active?: boolean
                    raw_text?: string | null
                    reason?: string
                    scheduled_end?: string | null
                    scheduled_start?: string
                    source?: Database["public"]["Enums"]["source_type"]
                    source_url?: string
                    summary_en?: string
                    summary_fil?: string
                    type?: Database["public"]["Enums"]["announcement_type"]
                    updated_at?: string
                }
                Relationships: []
            }
            barangays: {
                Row: {
                    aliases: string[] | null
                    created_at: string
                    district: string
                    id: string
                    name: string
                }
                Insert: {
                    aliases?: string[] | null
                    created_at?: string
                    district: string
                    id?: string
                    name: string
                }
                Update: {
                    aliases?: string[] | null
                    created_at?: string
                    district?: string
                    id?: string
                    name?: string
                }
                Relationships: []
            }
            electricity_rates: {
                Row: {
                    created_at: string
                    distribution_charge: number
                    effective_date: string
                    generation_charge: number
                    id: string
                    others: Json
                    rate_per_kwh: number
                    source_announcement_id: string | null
                    transmission_charge: number
                }
                Insert: {
                    created_at?: string
                    distribution_charge?: number
                    effective_date: string
                    generation_charge?: number
                    id?: string
                    others?: Json
                    rate_per_kwh: number
                    source_announcement_id?: string | null
                    transmission_charge?: number
                }
                Update: {
                    created_at?: string
                    distribution_charge?: number
                    effective_date?: string
                    generation_charge?: number
                    id?: string
                    others?: Json
                    rate_per_kwh?: number
                    source_announcement_id?: string | null
                    transmission_charge?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "electricity_rates_source_announcement_id_fkey"
                        columns: ["source_announcement_id"]
                        isOneToOne: false
                        referencedRelation: "announcements"
                        referencedColumns: ["id"]
                    },
                ]
            }
            user_profiles: {
                Row: {
                    created_at: string
                    display_name: string | null
                    fcm_token: string | null
                    id: string
                    language: string
                    tier: string
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    display_name?: string | null
                    fcm_token?: string | null
                    id: string
                    language?: string
                    tier?: string
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    display_name?: string | null
                    fcm_token?: string | null
                    id?: string
                    language?: string
                    tier?: string
                    updated_at?: string
                }
                Relationships: []
            }
            user_subscriptions: {
                Row: {
                    barangay_id: string
                    created_at: string
                    id: string
                    notify_push: boolean
                    user_id: string
                }
                Insert: {
                    barangay_id: string
                    created_at?: string
                    id?: string
                    notify_push?: boolean
                    user_id: string
                }
                Update: {
                    barangay_id?: string
                    created_at?: string
                    id?: string
                    notify_push?: boolean
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "user_subscriptions_barangay_id_fkey"
                        columns: ["barangay_id"]
                        isOneToOne: false
                        referencedRelation: "barangays"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "user_subscriptions_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "user_profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            announcement_type:
            | "scheduled"
            | "emergency"
            | "restoration"
            | "rate_update"
            source_type: "apify" | "manual"
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
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
    public: {
        Enums: {
            announcement_type: [
                "scheduled",
                "emergency",
                "restoration",
                "rate_update",
            ],
            source_type: ["apify", "manual"],
        },
    },
} as const
