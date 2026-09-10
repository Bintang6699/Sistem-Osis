export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          role: 'admin' | 'bendahara' | 'viewer'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role?: 'admin' | 'bendahara' | 'viewer'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'admin' | 'bendahara' | 'viewer'
          avatar_url?: string | null
          updated_at?: string
        }
      }
      members: {
        Row: {
          id: string
          name: string
          nis: string | null
          class: string
          status: 'Aktif' | 'Tidak Aktif' | 'Alumni'
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          nis?: string | null
          class: string
          status?: 'Aktif' | 'Tidak Aktif' | 'Alumni'
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          nis?: string | null
          class?: string
          status?: 'Aktif' | 'Tidak Aktif' | 'Alumni'
          phone?: string | null
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          type: 'income' | 'expense'
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'income' | 'expense'
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'income' | 'expense'
          color?: string | null
        }
      }
      income_transactions: {
        Row: {
          id: string
          member_id: string | null
          payer_name: string
          payer_class: string
          amount: number
          payment_date: string
          period: string
          payment_method: 'Tunai' | 'Transfer' | 'QRIS' | 'Lainnya'
          description: string | null
          status: 'Lunas' | 'Cicilan' | 'Pending'
          category_id: string | null
          recorded_by: string | null
          receipt_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          member_id?: string | null
          payer_name: string
          payer_class: string
          amount: number
          payment_date?: string
          period: string
          payment_method?: 'Tunai' | 'Transfer' | 'QRIS' | 'Lainnya'
          description?: string | null
          status?: 'Lunas' | 'Cicilan' | 'Pending'
          category_id?: string | null
          recorded_by?: string | null
          receipt_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          member_id?: string | null
          payer_name?: string
          payer_class?: string
          amount?: number
          payment_date?: string
          period?: string
          payment_method?: 'Tunai' | 'Transfer' | 'QRIS' | 'Lainnya'
          description?: string | null
          status?: 'Lunas' | 'Cicilan' | 'Pending'
          category_id?: string | null
          recorded_by?: string | null
          receipt_url?: string | null
          updated_at?: string
        }
      }
      expense_transactions: {
        Row: {
          id: string
          transaction_number: string
          expense_date: string
          category_id: string | null
          purpose: string
          amount: number
          paid_by: string
          description: string | null
          receipt_url: string | null
          recorded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          transaction_number: string
          expense_date?: string
          category_id?: string | null
          purpose: string
          amount: number
          paid_by: string
          description?: string | null
          receipt_url?: string | null
          recorded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          transaction_number?: string
          expense_date?: string
          category_id?: string | null
          purpose?: string
          amount?: number
          paid_by?: string
          description?: string | null
          receipt_url?: string | null
          recorded_by?: string | null
          updated_at?: string
        }
      }
      expense_items: {
        Row: {
          id: string
          expense_transaction_id: string
          item_name: string
          quantity: number
          unit_price: number
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: string
          expense_transaction_id: string
          item_name: string
          quantity: number
          unit_price: number
          created_at?: string
        }
        Update: {
          id?: string
          expense_transaction_id?: string
          item_name?: string
          quantity?: number
          unit_price?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Member = Database['public']['Tables']['members']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type IncomeTransaction = Database['public']['Tables']['income_transactions']['Row']
export type ExpenseTransaction = Database['public']['Tables']['expense_transactions']['Row']
export type ExpenseItem = Database['public']['Tables']['expense_items']['Row']

export type UserRole = 'admin' | 'bendahara' | 'viewer'

// Extended types with joins
export type IncomeTransactionWithDetails = IncomeTransaction & {
  members: Member | null
  profiles: Profile | null
  categories: Category | null
}

export type ExpenseTransactionWithDetails = ExpenseTransaction & {
  categories: Category | null
  profiles: Profile | null
  expense_items: ExpenseItem[]
}
