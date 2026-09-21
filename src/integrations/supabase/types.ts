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
      agenda_citas: {
        Row: {
          color: string
          created_at: string
          duracion: number
          estado: string
          fecha_hora: string
          id: string
          link_video: string | null
          paciente_id: string
          pago_id: string | null
          psicologo_id: string
          recordatorio_enviado: boolean
          tipo: string
        }
        Insert: {
          color?: string
          created_at?: string
          duracion?: number
          estado?: string
          fecha_hora: string
          id?: string
          link_video?: string | null
          paciente_id: string
          pago_id?: string | null
          psicologo_id: string
          recordatorio_enviado?: boolean
          tipo?: string
        }
        Update: {
          color?: string
          created_at?: string
          duracion?: number
          estado?: string
          fecha_hora?: string
          id?: string
          link_video?: string | null
          paciente_id?: string
          pago_id?: string | null
          psicologo_id?: string
          recordatorio_enviado?: boolean
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "agenda_citas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_citas_pago_id_fkey"
            columns: ["pago_id"]
            isOneToOne: false
            referencedRelation: "pagos_paquetes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_citas_psicologo_id_fkey"
            columns: ["psicologo_id"]
            isOneToOne: false
            referencedRelation: "psicologos"
            referencedColumns: ["id"]
          },
        ]
      }
      billetera_psicologo: {
        Row: {
          cita_id: string | null
          descripcion: string | null
          estado: string
          fecha_generacion: string
          fecha_pago_sabado: string
          id: string
          monto: number
          psicologo_id: string
          tipo: string
        }
        Insert: {
          cita_id?: string | null
          descripcion?: string | null
          estado?: string
          fecha_generacion?: string
          fecha_pago_sabado: string
          id?: string
          monto: number
          psicologo_id: string
          tipo: string
        }
        Update: {
          cita_id?: string | null
          descripcion?: string | null
          estado?: string
          fecha_generacion?: string
          fecha_pago_sabado?: string
          id?: string
          monto?: number
          psicologo_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "billetera_psicologo_cita_id_fkey"
            columns: ["cita_id"]
            isOneToOne: false
            referencedRelation: "agenda_citas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billetera_psicologo_psicologo_id_fkey"
            columns: ["psicologo_id"]
            isOneToOne: false
            referencedRelation: "psicologos"
            referencedColumns: ["id"]
          },
        ]
      }
      comprobantes_sunat: {
        Row: {
          correlativo: number
          estado: string
          fecha_emision: string
          id: string
          igv: number
          monto: number
          paciente_id: string
          pago_id: string | null
          pdf_url: string | null
          serie: string
          tipo: string
          total: number
        }
        Insert: {
          correlativo: number
          estado?: string
          fecha_emision?: string
          id?: string
          igv?: number
          monto: number
          paciente_id: string
          pago_id?: string | null
          pdf_url?: string | null
          serie?: string
          tipo: string
          total: number
        }
        Update: {
          correlativo?: number
          estado?: string
          fecha_emision?: string
          id?: string
          igv?: number
          monto?: number
          paciente_id?: string
          pago_id?: string | null
          pdf_url?: string | null
          serie?: string
          tipo?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "comprobantes_sunat_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracion_app: {
        Row: {
          clave: string
          descripcion: string | null
          editable: boolean
          valor: string
          version: number
        }
        Insert: {
          clave: string
          descripcion?: string | null
          editable?: boolean
          valor: string
          version?: number
        }
        Update: {
          clave?: string
          descripcion?: string | null
          editable?: boolean
          valor?: string
          version?: number
        }
        Relationships: []
      }
      cortes_semanales: {
        Row: {
          estado: string
          fecha_corte_viernes: string
          fecha_pago_sabado: string
          ganancia_empresa_45: number
          id: string
          total_pagar_psicologos: number
          total_recaudado: number
        }
        Insert: {
          estado?: string
          fecha_corte_viernes: string
          fecha_pago_sabado: string
          ganancia_empresa_45?: number
          id?: string
          total_pagar_psicologos?: number
          total_recaudado?: number
        }
        Update: {
          estado?: string
          fecha_corte_viernes?: string
          fecha_pago_sabado?: string
          ganancia_empresa_45?: number
          id?: string
          total_pagar_psicologos?: number
          total_recaudado?: number
        }
        Relationships: []
      }
      logs_acceso_clinico: {
        Row: {
          actor_id: string | null
          fecha: string
          id: string
          ip: string | null
          motivo: string
          nota_id: string | null
        }
        Insert: {
          actor_id?: string | null
          fecha?: string
          id?: string
          ip?: string | null
          motivo: string
          nota_id?: string | null
        }
        Update: {
          actor_id?: string | null
          fecha?: string
          id?: string
          ip?: string | null
          motivo?: string
          nota_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_acceso_clinico_nota_id_fkey"
            columns: ["nota_id"]
            isOneToOne: false
            referencedRelation: "notas_clinicas"
            referencedColumns: ["id"]
          },
        ]
      }
      logs_admin: {
        Row: {
          accion: string
          admin_id: string | null
          detalles: Json | null
          fecha: string
          id: string
          ip: string | null
          registro_id: string | null
          tabla_afectada: string | null
        }
        Insert: {
          accion: string
          admin_id?: string | null
          detalles?: Json | null
          fecha?: string
          id?: string
          ip?: string | null
          registro_id?: string | null
          tabla_afectada?: string | null
        }
        Update: {
          accion?: string
          admin_id?: string | null
          detalles?: Json | null
          fecha?: string
          id?: string
          ip?: string | null
          registro_id?: string | null
          tabla_afectada?: string | null
        }
        Relationships: []
      }
      notas_clinicas: {
        Row: {
          cie10: string | null
          cita_id: string | null
          contenido_encriptado: string
          fecha_creacion: string
          id: string
          iv: string
          paciente_id: string
          para_susalud: boolean
          psicologo_id: string
          version: number
          visible_paciente: boolean
        }
        Insert: {
          cie10?: string | null
          cita_id?: string | null
          contenido_encriptado: string
          fecha_creacion?: string
          id?: string
          iv: string
          paciente_id: string
          para_susalud?: boolean
          psicologo_id: string
          version?: number
          visible_paciente?: boolean
        }
        Update: {
          cie10?: string | null
          cita_id?: string | null
          contenido_encriptado?: string
          fecha_creacion?: string
          id?: string
          iv?: string
          paciente_id?: string
          para_susalud?: boolean
          psicologo_id?: string
          version?: number
          visible_paciente?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "notas_clinicas_cita_id_fkey"
            columns: ["cita_id"]
            isOneToOne: true
            referencedRelation: "agenda_citas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_clinicas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_clinicas_psicologo_id_fkey"
            columns: ["psicologo_id"]
            isOneToOne: false
            referencedRelation: "psicologos"
            referencedColumns: ["id"]
          },
        ]
      }
      notificaciones: {
        Row: {
          canal: string
          enviada: boolean
          fecha: string
          id: string
          intentos: number
          mensaje: string | null
          provider_response: Json | null
          psicologo_id: string | null
          tipo: string
          usuario_id: string | null
        }
        Insert: {
          canal: string
          enviada?: boolean
          fecha?: string
          id?: string
          intentos?: number
          mensaje?: string | null
          provider_response?: Json | null
          psicologo_id?: string | null
          tipo: string
          usuario_id?: string | null
        }
        Update: {
          canal?: string
          enviada?: boolean
          fecha?: string
          id?: string
          intentos?: number
          mensaje?: string | null
          provider_response?: Json | null
          psicologo_id?: string | null
          tipo?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      pagos_paquetes: {
        Row: {
          created_at: string
          estado: string
          estado_voucher: string
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          metodo_pago: string
          monto_pagado: number
          notas_admin: string | null
          paciente_id: string
          paquete_id: string
          psicologo_asignado_id: string | null
          sesiones_hechas: number
          sesiones_totales: number
          tipo_terapia: string
          voucher_url: string | null
        }
        Insert: {
          created_at?: string
          estado?: string
          estado_voucher?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          metodo_pago?: string
          monto_pagado: number
          notas_admin?: string | null
          paciente_id: string
          paquete_id: string
          psicologo_asignado_id?: string | null
          sesiones_hechas?: number
          sesiones_totales: number
          tipo_terapia?: string
          voucher_url?: string | null
        }
        Update: {
          created_at?: string
          estado?: string
          estado_voucher?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          metodo_pago?: string
          monto_pagado?: number
          notas_admin?: string | null
          paciente_id?: string
          paquete_id?: string
          psicologo_asignado_id?: string | null
          sesiones_hechas?: number
          sesiones_totales?: number
          tipo_terapia?: string
          voucher_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_paquetes_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_paquetes_paquete_id_fkey"
            columns: ["paquete_id"]
            isOneToOne: false
            referencedRelation: "paquetes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_paquetes_psicologo_asignado_id_fkey"
            columns: ["psicologo_asignado_id"]
            isOneToOne: false
            referencedRelation: "psicologos"
            referencedColumns: ["id"]
          },
        ]
      }
      paquetes: {
        Row: {
          activo: boolean
          beneficios: Json
          categoria: string
          descripcion: string | null
          id: string
          nombre: string
          orden: number
          precio_por_sesion: number
          precio_total: number
          sesiones: number
          vacantes_social: number
        }
        Insert: {
          activo?: boolean
          beneficios?: Json
          categoria: string
          descripcion?: string | null
          id?: string
          nombre: string
          orden?: number
          precio_por_sesion: number
          precio_total: number
          sesiones: number
          vacantes_social?: number
        }
        Update: {
          activo?: boolean
          beneficios?: Json
          categoria?: string
          descripcion?: string | null
          id?: string
          nombre?: string
          orden?: number
          precio_por_sesion?: number
          precio_total?: number
          sesiones?: number
          vacantes_social?: number
        }
        Relationships: []
      }
      problemas_psicologicos: {
        Row: {
          activo: boolean
          descripcion_corta: string | null
          icono: string
          id: string
          nombre: string
          orden: number
        }
        Insert: {
          activo?: boolean
          descripcion_corta?: string | null
          icono?: string
          id?: string
          nombre: string
          orden?: number
        }
        Update: {
          activo?: boolean
          descripcion_corta?: string | null
          icono?: string
          id?: string
          nombre?: string
          orden?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          acepto_politicas: boolean
          categoria: string | null
          celular: string | null
          dni: string | null
          email: string | null
          estado: string
          fecha_registro: string
          id: string
          ip_registro: string | null
          nombre: string
          problemas_elegidos: Json
          user_agent: string | null
        }
        Insert: {
          acepto_politicas?: boolean
          categoria?: string | null
          celular?: string | null
          dni?: string | null
          email?: string | null
          estado?: string
          fecha_registro?: string
          id: string
          ip_registro?: string | null
          nombre: string
          problemas_elegidos?: Json
          user_agent?: string | null
        }
        Update: {
          acepto_politicas?: boolean
          categoria?: string | null
          celular?: string | null
          dni?: string | null
          email?: string | null
          estado?: string
          fecha_registro?: string
          id?: string
          ip_registro?: string | null
          nombre?: string
          problemas_elegidos?: Json
          user_agent?: string | null
        }
        Relationships: []
      }
      psicologos: {
        Row: {
          agenda_disponible: Json
          banco: string | null
          categoria: string
          cci: string | null
          celular: string | null
          cnp: string
          created_at: string
          cuenta: string | null
          descripcion: string | null
          dni: string | null
          email: string | null
          especialidades: Json
          estado: string
          foto_url: string | null
          id: string
          nombre: string
          ranking_cierres: number
          rating: number
          tipo_pago: string
          user_id: string | null
        }
        Insert: {
          agenda_disponible?: Json
          banco?: string | null
          categoria: string
          cci?: string | null
          celular?: string | null
          cnp: string
          created_at?: string
          cuenta?: string | null
          descripcion?: string | null
          dni?: string | null
          email?: string | null
          especialidades?: Json
          estado?: string
          foto_url?: string | null
          id?: string
          nombre: string
          ranking_cierres?: number
          rating?: number
          tipo_pago?: string
          user_id?: string | null
        }
        Update: {
          agenda_disponible?: Json
          banco?: string | null
          categoria?: string
          cci?: string | null
          celular?: string | null
          cnp?: string
          created_at?: string
          cuenta?: string | null
          descripcion?: string | null
          dni?: string | null
          email?: string | null
          especialidades?: Json
          estado?: string
          foto_url?: string | null
          id?: string
          nombre?: string
          ranking_cierres?: number
          rating?: number
          tipo_pago?: string
          user_id?: string | null
        }
        Relationships: []
      }
      recibos_honorarios: {
        Row: {
          archivo_url: string | null
          estado: string
          fecha_subida: string
          id: string
          mes: string
          monto: number
          notas_admin: string | null
          numero_recibo: string | null
          psicologo_id: string
          serie: string
        }
        Insert: {
          archivo_url?: string | null
          estado?: string
          fecha_subida?: string
          id?: string
          mes: string
          monto: number
          notas_admin?: string | null
          numero_recibo?: string | null
          psicologo_id: string
          serie?: string
        }
        Update: {
          archivo_url?: string | null
          estado?: string
          fecha_subida?: string
          id?: string
          mes?: string
          monto?: number
          notas_admin?: string | null
          numero_recibo?: string | null
          psicologo_id?: string
          serie?: string
        }
        Relationships: [
          {
            foreignKeyName: "recibos_honorarios_psicologo_id_fkey"
            columns: ["psicologo_id"]
            isOneToOne: false
            referencedRelation: "psicologos"
            referencedColumns: ["id"]
          },
        ]
      }
      reclamaciones: {
        Row: {
          celular: string | null
          detalle: string | null
          documento: string | null
          email: string | null
          estado: string
          fecha: string
          id: string
          nombre: string
          paciente_id: string | null
          reclamo: string
          respuesta: string | null
          tipo: string
        }
        Insert: {
          celular?: string | null
          detalle?: string | null
          documento?: string | null
          email?: string | null
          estado?: string
          fecha?: string
          id?: string
          nombre: string
          paciente_id?: string | null
          reclamo: string
          respuesta?: string | null
          tipo?: string
        }
        Update: {
          celular?: string | null
          detalle?: string | null
          documento?: string | null
          email?: string | null
          estado?: string
          fecha?: string
          id?: string
          nombre?: string
          paciente_id?: string | null
          reclamo?: string
          respuesta?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "reclamaciones_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sesiones_prueba: {
        Row: {
          categoria: string
          estado_voucher: string
          fecha_pago: string
          id: string
          metodo_pago: string
          notas_admin: string | null
          paciente_id: string
          precio: number
          voucher_url: string | null
        }
        Insert: {
          categoria: string
          estado_voucher?: string
          fecha_pago?: string
          id?: string
          metodo_pago: string
          notas_admin?: string | null
          paciente_id: string
          precio: number
          voucher_url?: string | null
        }
        Update: {
          categoria?: string
          estado_voucher?: string
          fecha_pago?: string
          id?: string
          metodo_pago?: string
          notas_admin?: string | null
          paciente_id?: string
          precio?: number
          voucher_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sesiones_prueba_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      videollamadas: {
        Row: {
          cita_id: string
          consentimiento_grabacion: boolean
          estado: string
          fin: string | null
          grabacion_permitida: boolean
          id: string
          inicio: string | null
          sala_id: string
        }
        Insert: {
          cita_id: string
          consentimiento_grabacion?: boolean
          estado?: string
          fin?: string | null
          grabacion_permitida?: boolean
          id?: string
          inicio?: string | null
          sala_id: string
        }
        Update: {
          cita_id?: string
          consentimiento_grabacion?: boolean
          estado?: string
          fin?: string | null
          grabacion_permitida?: boolean
          id?: string
          inicio?: string | null
          sala_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "videollamadas_cita_id_fkey"
            columns: ["cita_id"]
            isOneToOne: true
            referencedRelation: "agenda_citas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      app_role: "paciente" | "psicologo" | "admin"
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
      app_role: ["paciente", "psicologo", "admin"],
    },
  },
} as const
