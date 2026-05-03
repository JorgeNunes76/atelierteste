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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      config_site: {
        Row: {
          chave: string
          id: string
          updated_at: string
          valor: string
        }
        Insert: {
          chave: string
          id?: string
          updated_at?: string
          valor: string
        }
        Update: {
          chave?: string
          id?: string
          updated_at?: string
          valor?: string
        }
        Relationships: []
      }
      contactos: {
        Row: {
          assunto: string | null
          created_at: string
          email: string
          id: string
          lido: boolean
          mensagem: string
          nome: string
          telefone: string | null
        }
        Insert: {
          assunto?: string | null
          created_at?: string
          email: string
          id?: string
          lido?: boolean
          mensagem: string
          nome: string
          telefone?: string | null
        }
        Update: {
          assunto?: string | null
          created_at?: string
          email?: string
          id?: string
          lido?: boolean
          mensagem?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: []
      }
      newsletter: {
        Row: {
          ativo: boolean
          created_at: string
          email: string
          id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      obras: {
        Row: {
          ano: number | null
          created_at: string
          descricao: string | null
          destaque: boolean
          dimensoes: string | null
          estado: string
          id: string
          imagem_url: string | null
          ordem: number
          preco: number | null
          reserved_until: string | null
          slug: string | null
          tecnica: string
          titulo: string
        }
        Insert: {
          ano?: number | null
          created_at?: string
          descricao?: string | null
          destaque?: boolean
          dimensoes?: string | null
          estado?: string
          id?: string
          imagem_url?: string | null
          ordem?: number
          preco?: number | null
          reserved_until?: string | null
          slug?: string | null
          tecnica: string
          titulo: string
        }
        Update: {
          ano?: number | null
          created_at?: string
          descricao?: string | null
          destaque?: boolean
          dimensoes?: string | null
          estado?: string
          id?: string
          imagem_url?: string | null
          ordem?: number
          preco?: number | null
          reserved_until?: string | null
          slug?: string | null
          tecnica?: string
          titulo?: string
        }
        Relationships: []
      }
      vendas: {
        Row: {
          cliente_email: string
          cliente_nome: string
          cliente_tel: string | null
          created_at: string
          email_estado: string | null
          estado: string
          id: string
          items: Json
          metodo_pagamento: string | null
          morada: string | null
          referencia: string | null
          stripe_session_id: string | null
          total: number
        }
        Insert: {
          cliente_email: string
          cliente_nome: string
          cliente_tel?: string | null
          created_at?: string
          email_estado?: string | null
          estado?: string
          id?: string
          items: Json
          metodo_pagamento?: string | null
          morada?: string | null
          referencia?: string | null
          stripe_session_id?: string | null
          total: number
        }
        Update: {
          cliente_email?: string
          cliente_nome?: string
          cliente_tel?: string | null
          created_at?: string
          email_estado?: string | null
          estado?: string
          id?: string
          items?: Json
          metodo_pagamento?: string | null
          morada?: string | null
          referencia?: string | null
          stripe_session_id?: string | null
          total?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      release_expired_reservations: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      reserve_obras_and_create_venda: {
        Args: {
          p_customer_email: string
          p_customer_nome: string
          p_customer_tel?: string
          p_item_ids: string[]
          p_metodo_pagamento?: string
          p_morada?: string
        }
        Returns: Json
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
    Enums: {},
  },
} as const
