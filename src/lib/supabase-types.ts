export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          role: string;
          status: string;
          city: string | null;
          state: string | null;
          points: number;
          waste_submitted: number;
          joined_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          phone?: string | null;
          role?: string;
          status?: string;
          city?: string | null;
          state?: string | null;
          points?: number;
          waste_submitted?: number;
          joined_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          role?: string;
          status?: string;
          city?: string | null;
          state?: string | null;
          points?: number;
          waste_submitted?: number;
          joined_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      businesses: {
        Row: {
          id: string;
          name: string;
          email: string;
          category: string;
          status: string;
          document_url: string | null;
          revenue: number;
          joined_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          category: string;
          status?: string;
          document_url?: string | null;
          revenue?: number;
          joined_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          category?: string;
          status?: string;
          document_url?: string | null;
          revenue?: number;
          joined_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      waste_submissions: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          weight: number;
          location: string;
          status: string;
          image_url: string | null;
          ai_confidence: number;
          points: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          weight: number;
          location: string;
          status?: string;
          image_url?: string | null;
          ai_confidence?: number;
          points?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          weight?: number;
          location?: string;
          status?: string;
          image_url?: string | null;
          ai_confidence?: number;
          points?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bins: {
        Row: {
          id: string;
          location: string;
          capacity: number;
          fill_percentage: number;
          status: string;
          maintenance_status: string | null;
          last_cleared: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          location: string;
          capacity: number;
          fill_percentage?: number;
          status?: string;
          maintenance_status?: string | null;
          last_cleared?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          location?: string;
          capacity?: number;
          fill_percentage?: number;
          status?: string;
          maintenance_status?: string | null;
          last_cleared?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      rewards: {
        Row: {
          id: string;
          title: string;
          description: string;
          points_required: number;
          category: string;
          stock: number;
          expiry: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          points_required: number;
          category: string;
          stock?: number;
          expiry?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          points_required?: number;
          category?: string;
          stock?: number;
          expiry?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      [key: string]: {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
    };
  };
}
