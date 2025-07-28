export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string | null
          id: string
          name: string
          requirement_type: string
          requirement_value: number
          xp_reward: number
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          icon?: string | null
          id?: string
          name: string
          requirement_type: string
          requirement_value: number
          xp_reward?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
          xp_reward?: number
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          message_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          message_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          message_type?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_missions: {
        Row: {
          created_at: string
          current_progress: number
          description: string
          id: string
          is_completed: boolean
          mission_date: string
          mission_type: string
          target_value: number
          user_id: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          current_progress?: number
          description: string
          id?: string
          is_completed?: boolean
          mission_date?: string
          mission_type: string
          target_value: number
          user_id: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          current_progress?: number
          description?: string
          id?: string
          is_completed?: boolean
          mission_date?: string
          mission_type?: string
          target_value?: number
          user_id?: string
          xp_reward?: number
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          avg_trade_duration: number
          best_trade: number
          created_at: string
          daily_return: number
          id: string
          max_drawdown: number
          monthly_return: number
          period_end: string
          period_start: string
          risk_score: number
          sharpe_ratio: number
          total_pnl: number
          total_pnl_percentage: number
          total_portfolio_value: number
          updated_at: string
          user_id: string
          weekly_return: number
          win_rate: number
          worst_trade: number
          yearly_return: number
        }
        Insert: {
          avg_trade_duration?: number
          best_trade?: number
          created_at?: string
          daily_return?: number
          id?: string
          max_drawdown?: number
          monthly_return?: number
          period_end?: string
          period_start?: string
          risk_score?: number
          sharpe_ratio?: number
          total_pnl?: number
          total_pnl_percentage?: number
          total_portfolio_value?: number
          updated_at?: string
          user_id: string
          weekly_return?: number
          win_rate?: number
          worst_trade?: number
          yearly_return?: number
        }
        Update: {
          avg_trade_duration?: number
          best_trade?: number
          created_at?: string
          daily_return?: number
          id?: string
          max_drawdown?: number
          monthly_return?: number
          period_end?: string
          period_start?: string
          risk_score?: number
          sharpe_ratio?: number
          total_pnl?: number
          total_pnl_percentage?: number
          total_portfolio_value?: number
          updated_at?: string
          user_id?: string
          weekly_return?: number
          win_rate?: number
          worst_trade?: number
          yearly_return?: number
        }
        Relationships: []
      }
      portfolio_positions: {
        Row: {
          average_price: number
          created_at: string
          current_value: number
          id: string
          quantity: number
          symbol: string
          total_invested: number
          unrealized_pnl: number
          updated_at: string
          user_id: string
        }
        Insert: {
          average_price?: number
          created_at?: string
          current_value?: number
          id?: string
          quantity?: number
          symbol: string
          total_invested?: number
          unrealized_pnl?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          average_price?: number
          created_at?: string
          current_value?: number
          id?: string
          quantity?: number
          symbol?: string
          total_invested?: number
          unrealized_pnl?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      risk_alerts: {
        Row: {
          alert_type: string
          created_at: string
          data: Json
          id: string
          is_read: boolean
          message: string
          severity: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          data?: Json
          id?: string
          is_read?: boolean
          message: string
          severity?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          data?: Json
          id?: string
          is_read?: boolean
          message?: string
          severity?: string
          user_id?: string
        }
        Relationships: []
      }
      social_rankings: {
        Row: {
          created_at: string
          followers_count: number
          following_count: number
          id: string
          social_score: number
          strategies_shared: number
          total_likes_received: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          followers_count?: number
          following_count?: number
          id?: string
          social_score?: number
          strategies_shared?: number
          total_likes_received?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          followers_count?: number
          following_count?: number
          id?: string
          social_score?: number
          strategies_shared?: number
          total_likes_received?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      strategy_likes: {
        Row: {
          created_at: string
          id: string
          strategy_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          strategy_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          strategy_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_likes_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "trading_strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_read: boolean
          target_user_id: string
          trade_data: Json
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_read?: boolean
          target_user_id: string
          trade_data: Json
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_read?: boolean
          target_user_id?: string
          trade_data?: Json
          user_id?: string
        }
        Relationships: []
      }
      trader_follows: {
        Row: {
          created_at: string
          followed_id: string
          follower_id: string
          id: string
        }
        Insert: {
          created_at?: string
          followed_id: string
          follower_id: string
          id?: string
        }
        Update: {
          created_at?: string
          followed_id?: string
          follower_id?: string
          id?: string
        }
        Relationships: []
      }
      trades: {
        Row: {
          created_at: string
          entry_price: number
          entry_time: string
          exit_price: number | null
          exit_time: string | null
          id: string
          is_active: boolean
          profit_percentage: number | null
          symbol: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_price: number
          entry_time?: string
          exit_price?: number | null
          exit_time?: string | null
          id?: string
          is_active?: boolean
          profit_percentage?: number | null
          symbol?: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          entry_price?: number
          entry_time?: string
          exit_price?: number | null
          exit_time?: string | null
          id?: string
          is_active?: boolean
          profit_percentage?: number | null
          symbol?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      trading_reports: {
        Row: {
          created_at: string
          fees_paid: number
          id: string
          period_end: string
          period_start: string
          profitable_trades: number
          report_data: Json
          report_type: string
          total_pnl: number
          total_trades: number
          total_volume: number
          user_id: string
        }
        Insert: {
          created_at?: string
          fees_paid?: number
          id?: string
          period_end: string
          period_start: string
          profitable_trades?: number
          report_data?: Json
          report_type?: string
          total_pnl?: number
          total_trades?: number
          total_volume?: number
          user_id: string
        }
        Update: {
          created_at?: string
          fees_paid?: number
          id?: string
          period_end?: string
          period_start?: string
          profitable_trades?: number
          report_data?: Json
          report_type?: string
          total_pnl?: number
          total_trades?: number
          total_volume?: number
          user_id?: string
        }
        Relationships: []
      }
      trading_strategies: {
        Row: {
          created_at: string
          description: string
          id: string
          is_public: boolean
          likes_count: number
          strategy_data: Json
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          views_count: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_public?: boolean
          likes_count?: number
          strategy_data: Json
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          views_count?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_public?: boolean
          likes_count?: number
          strategy_data?: Json
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          views_count?: number
        }
        Relationships: []
      }
      trading_symbols: {
        Row: {
          category: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          symbol: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          symbol: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          symbol?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          created_at: string
          current_balance: number
          id: string
          level: number
          profitable_trades: number
          rank: string
          total_trades: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          created_at?: string
          current_balance?: number
          id?: string
          level?: number
          profitable_trades?: number
          rank?: string
          total_trades?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          created_at?: string
          current_balance?: number
          id?: string
          level?: number
          profitable_trades?: number
          rank?: string
          total_trades?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_performance_metrics: {
        Args: { user_id_param: string }
        Returns: undefined
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
