export type AppRole = 'super_admin' | 'admin' | 'staff' | 'client'

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: AppRole
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: AppRole
          phone?: string | null
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
        Relationships: []
      }
      services: {
        Row: {
          id: string
          slug: string
          name: string
          category: string
          summary: string
          description: string | null
          base_price: number | null
          currency: string
          is_featured: boolean
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          category: string
          summary: string
          description?: string | null
          base_price?: number | null
          currency?: string
          is_featured?: boolean
          is_active?: boolean
        }
        Update: Partial<Database['public']['Tables']['services']['Insert']>
        Relationships: []
      }
      leads: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string | null
          company: string | null
          source: string
          status: string
          service_interest: string | null
          notes: string | null
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          phone?: string | null
          company?: string | null
          source?: string
          status?: string
          service_interest?: string | null
          notes?: string | null
          assigned_to?: string | null
        }
        Update: Partial<Database['public']['Tables']['leads']['Insert']>
        Relationships: []
      }
      service_cases: {
        Row: {
          id: string
          case_number: string
          title: string
          status: string
          client_id: string | null
          service_id: string | null
          lead_id: string | null
          assigned_to: string | null
          priority: string
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          case_number?: string
          title: string
          status?: string
          client_id?: string | null
          service_id?: string | null
          lead_id?: string | null
          assigned_to?: string | null
          priority?: string
          due_date?: string | null
        }
        Update: Partial<Database['public']['Tables']['service_cases']['Insert']>
        Relationships: []
      }
      chart_of_accounts: {
        Row: {
          id: string
          code: string
          name: string
          account_type: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          account_type: string
          is_active?: boolean
        }
        Update: Partial<Database['public']['Tables']['chart_of_accounts']['Insert']>
        Relationships: []
      }
      journal_entries: {
        Row: {
          id: string
          entry_number: string
          entry_date: string
          memo: string | null
          status: string
          created_by: string | null
          posted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          entry_number?: string
          entry_date: string
          memo?: string | null
          status?: string
          created_by?: string | null
          posted_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['journal_entries']['Insert']>
        Relationships: []
      }
      journal_lines: {
        Row: {
          id: string
          entry_id: string
          account_id: string
          debit: number
          credit: number
          description: string | null
        }
        Insert: {
          id?: string
          entry_id: string
          account_id: string
          debit?: number
          credit?: number
          description?: string | null
        }
        Update: Partial<Database['public']['Tables']['journal_lines']['Insert']>
        Relationships: []
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          client_id: string | null
          case_id: string | null
          status: string
          issue_date: string
          due_date: string | null
          subtotal: number
          tax_amount: number
          total: number
          currency: string
          created_at: string
        }
        Insert: {
          id?: string
          invoice_number?: string
          client_id?: string | null
          case_id?: string | null
          status?: string
          issue_date: string
          due_date?: string | null
          subtotal?: number
          tax_amount?: number
          total?: number
          currency?: string
        }
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>
        Relationships: []
      }
      employees: {
        Row: {
          id: string
          user_id: string | null
          employee_code: string
          full_name: string
          department: string | null
          job_title: string | null
          hire_date: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          employee_code: string
          full_name: string
          department?: string | null
          job_title?: string | null
          hire_date?: string | null
          status?: string
        }
        Update: Partial<Database['public']['Tables']['employees']['Insert']>
        Relationships: []
      }
      attendance_records: {
        Row: {
          id: string
          employee_id: string
          work_date: string
          check_in: string | null
          check_out: string | null
          status: string
          notes: string | null
        }
        Insert: {
          id?: string
          employee_id: string
          work_date: string
          check_in?: string | null
          check_out?: string | null
          status?: string
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['attendance_records']['Insert']>
        Relationships: []
      }
      tax_profiles: {
        Row: {
          id: string
          client_id: string | null
          ntn: string | null
          filer_status: string | null
          tax_year: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          ntn?: string | null
          filer_status?: string | null
          tax_year: string
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['tax_profiles']['Insert']>
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          actor_id: string | null
          action: string
          entity: string
          entity_id: string | null
          meta: Json
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          action: string
          entity: string
          entity_id?: string | null
          meta?: Json
        }
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: {
      app_role: AppRole
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Service = Database['public']['Tables']['services']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']
export type ServiceCase = Database['public']['Tables']['service_cases']['Row']
