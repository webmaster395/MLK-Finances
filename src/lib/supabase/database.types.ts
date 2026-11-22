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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      annonces: {
        Row: {
          cree_le: string
          id: string
          message: string
          publie: boolean
          titre: string
        }
        Insert: {
          cree_le?: string
          id?: string
          message: string
          publie?: boolean
          titre?: string
        }
        Update: {
          cree_le?: string
          id?: string
          message?: string
          publie?: boolean
          titre?: string
        }
        Relationships: [
        ]
      }
      cours: {
        Row: {
          cree_le: string
          description: string
          id: string
          objectifs: string[]
          ordre: number
          publie: boolean
          titre: string
        }
        Insert: {
          cree_le?: string
          description?: string
          id?: string
          objectifs?: string[]
          ordre?: number
          publie?: boolean
          titre: string
        }
        Update: {
          cree_le?: string
          description?: string
          id?: string
          objectifs?: string[]
          ordre?: number
          publie?: boolean
          titre?: string
        }
        Relationships: [
        ]
      }
      devoirs: {
        Row: {
          consigne: string
          cours_id: string
          cree_le: string
          echeance: string | null
          id: string
          publie: boolean
          titre: string
        }
        Insert: {
          consigne?: string
          cours_id: string
          cree_le?: string
          echeance?: string | null
          id?: string
          publie?: boolean
          titre: string
        }
        Update: {
          consigne?: string
          cours_id?: string
          cree_le?: string
          echeance?: string | null
          id?: string
          publie?: boolean
          titre?: string
        }
        Relationships: [
          {
            foreignKeyName: "devoirs_cours_id_fkey"
            columns: ["cours_id"]
            isOneToOne: false
            referencedRelation: "cours"
            referencedColumns: ["id"]
          },
        ]
      }
      profils: {
        Row: {
          civilite: string | null
          cree_le: string
          id: string
          modifie_le: string
          nom: string
          photo_path: string | null
          prenom: string
          role: Database["public"]["Enums"]["role_profil"]
          tranche_age: string | null
        }
        Insert: {
          civilite?: string | null
          cree_le?: string
          id: string
          modifie_le?: string
          nom?: string
          photo_path?: string | null
          prenom?: string
          role?: Database["public"]["Enums"]["role_profil"]
          tranche_age?: string | null
        }
        Update: {
          civilite?: string | null
          cree_le?: string
          id?: string
          modifie_le?: string
          nom?: string
          photo_path?: string | null
          prenom?: string
          role?: Database["public"]["Enums"]["role_profil"]
          tranche_age?: string | null
        }
        Relationships: []
      }
      rendus: {
        Row: {
          depose_le: string
          devoir_id: string
          fichier_path: string
          id: string
          nom_fichier: string | null
          participant_id: string
          statut: Database["public"]["Enums"]["statut_rendu"]
        }
        Insert: {
          depose_le?: string
          devoir_id: string
          fichier_path: string
          id?: string
          nom_fichier?: string | null
          participant_id: string
          statut?: Database["public"]["Enums"]["statut_rendu"]
        }
        Update: {
          depose_le?: string
          devoir_id?: string
          fichier_path?: string
          id?: string
          nom_fichier?: string | null
          participant_id?: string
          statut?: Database["public"]["Enums"]["statut_rendu"]
        }
        Relationships: [
          {
            foreignKeyName: "rendus_devoir_id_fkey"
            columns: ["devoir_id"]
            isOneToOne: false
            referencedRelation: "devoirs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rendus_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "profils"
            referencedColumns: ["id"]
          },
        ]
      }
      ressources: {
        Row: {
          cours_id: string
          cree_le: string
          id: string
          publie: boolean
          storage_path: string | null
          titre: string
          type: string
          url: string | null
        }
        Insert: {
          cours_id: string
          cree_le?: string
          id?: string
          publie?: boolean
          storage_path?: string | null
          titre: string
          type: string
          url?: string | null
        }
        Update: {
          cours_id?: string
          cree_le?: string
          id?: string
          publie?: boolean
          storage_path?: string | null
          titre?: string
          type?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ressources_cours_id_fkey"
            columns: ["cours_id"]
            isOneToOne: false
            referencedRelation: "cours"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          cours_id: string | null
          cree_le: string
          debut: string
          description: string
          fin: string | null
          id: string
          intervenants: string[]
          lieu: string | null
          publie: boolean
          titre: string
        }
        Insert: {
          cours_id?: string | null
          cree_le?: string
          debut: string
          description?: string
          fin?: string | null
          id?: string
          intervenants?: string[]
          lieu?: string | null
          publie?: boolean
          titre: string
        }
        Update: {
          cours_id?: string | null
          cree_le?: string
          debut?: string
          description?: string
          fin?: string | null
          id?: string
          intervenants?: string[]
          lieu?: string | null
          publie?: boolean
          titre?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_cours_id_fkey"
            columns: ["cours_id"]
            isOneToOne: false
            referencedRelation: "cours"
            referencedColumns: ["id"]
          },
        ]
      }
      temoignages: {
        Row: {
          auteur_id: string | null
          cree_le: string
          id: string
          nom_affiche: string
          photo_path: string | null
          texte: string
          valide: boolean
        }
        Insert: {
          auteur_id?: string | null
          cree_le?: string
          id?: string
          nom_affiche: string
          photo_path?: string | null
          texte: string
          valide?: boolean
        }
        Update: {
          auteur_id?: string | null
          cree_le?: string
          id?: string
          nom_affiche?: string
          photo_path?: string | null
          texte?: string
          valide?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "temoignages_auteur_id_fkey"
            columns: ["auteur_id"]
            isOneToOne: false
            referencedRelation: "profils"
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
      role_profil: "participant" | "admin"
      statut_rendu: "depose" | "corrige"
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
    Enums: {
      role_profil: ["participant", "admin"],
      statut_rendu: ["depose", "corrige"],
    },
  },
} as const
