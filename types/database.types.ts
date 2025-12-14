// Database types matching Supabase schema

export interface Database {
  public: {
    Tables: {
      pets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          age: number | null;
          weight: number | null;
          breed: string | null;
          photos: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          age?: number | null;
          weight?: number | null;
          breed?: string | null;
          photos?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          age?: number | null;
          weight?: number | null;
          breed?: string | null;
          photos?: string[] | null;
          created_at?: string;
        };
      };
      walks: {
        Row: {
          id: string;
          pet_id: string;
          start_time: string;
          end_time: string;
          duration_sec: number;
          distance_m: number;
          steps: number | null;
          path: any; // JSON
          created_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          start_time: string;
          end_time: string;
          duration_sec: number;
          distance_m: number;
          steps?: number | null;
          path?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          pet_id?: string;
          start_time?: string;
          end_time?: string;
          duration_sec?: number;
          distance_m?: number;
          steps?: number | null;
          path?: any;
          created_at?: string;
        };
      };
      calendar_stamp: {
        Row: {
          id: string;
          pet_id: string;
          walk_date: string; // date
          stamp_count: number;
          goal_achieved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          walk_date: string;
          stamp_count?: number;
          goal_achieved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          pet_id?: string;
          walk_date?: string;
          stamp_count?: number;
          goal_achieved?: boolean;
          created_at?: string;
        };
      };
    };
  };
}



