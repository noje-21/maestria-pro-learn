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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          level: string | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          level?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          level?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_drafts: {
        Row: {
          connection_link: string | null
          created_at: string | null
          id: string
          manual_recipients: string | null
          message: string
          selected_recipient_ids: string[] | null
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          connection_link?: string | null
          created_at?: string | null
          id?: string
          manual_recipients?: string | null
          message: string
          selected_recipient_ids?: string[] | null
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          connection_link?: string | null
          created_at?: string | null
          id?: string
          manual_recipients?: string | null
          message?: string
          selected_recipient_ids?: string[] | null
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      enrollment_leads: {
        Row: {
          country: string
          course_id: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          payment_completed_at: string | null
          phone: string | null
          specialty: string
          status: string
          stripe_customer_id: string | null
          stripe_session_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          country: string
          course_id?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          payment_completed_at?: string | null
          phone?: string | null
          specialty: string
          status?: string
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          country?: string
          course_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          payment_completed_at?: string | null
          phone?: string | null
          specialty?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_leads_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_attempts: {
        Row: {
          answers: Json | null
          created_at: string | null
          exam_id: string | null
          id: string
          passed: boolean
          score: number
          user_id: string | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          exam_id?: string | null
          id?: string
          passed: boolean
          score: number
          user_id?: string | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          exam_id?: string | null
          id?: string
          passed?: boolean
          score?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_questions: {
        Row: {
          correct_answer: string
          created_at: string | null
          exam_id: string | null
          hint: string | null
          id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question_text: string
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          exam_id?: string | null
          hint?: string | null
          id?: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question_text: string
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          exam_id?: string | null
          hint?: string | null
          id?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string | null
          id: string
          lesson_id: string | null
          passing_score: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          passing_score?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          passing_score?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exams_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_analytics: {
        Row: {
          course_id: string | null
          created_at: string
          id: string
          lesson_id: string | null
          module_id: string | null
          session_end: string | null
          session_start: string
          time_spent_seconds: number | null
          updated_at: string
          user_id: string
          video_views: Json | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          module_id?: string | null
          session_end?: string | null
          session_start?: string
          time_spent_seconds?: number | null
          updated_at?: string
          user_id: string
          video_views?: Json | null
        }
        Update: {
          course_id?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          module_id?: string | null
          session_end?: string | null
          session_start?: string
          time_spent_seconds?: number | null
          updated_at?: string
          user_id?: string
          video_views?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_analytics_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_analytics_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_analytics_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_sessions: {
        Row: {
          course_id: string | null
          created_at: string
          id: string
          lessons_completed: number | null
          lessons_viewed: number | null
          session_date: string
          total_time_seconds: number | null
          updated_at: string
          user_id: string
          videos_watched: number | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          id?: string
          lessons_completed?: number | null
          lessons_viewed?: number | null
          session_date?: string
          total_time_seconds?: number | null
          updated_at?: string
          user_id: string
          videos_watched?: number | null
        }
        Update: {
          course_id?: string | null
          created_at?: string
          id?: string
          lessons_completed?: number | null
          lessons_viewed?: number | null
          session_date?: string
          total_time_seconds?: number | null
          updated_at?: string
          user_id?: string
          videos_watched?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_materials: {
        Row: {
          created_at: string | null
          file_url: string
          id: string
          lesson_id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          file_url: string
          id?: string
          lesson_id: string
          title: string
        }
        Update: {
          created_at?: string | null
          file_url?: string
          id?: string
          lesson_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_materials_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          lesson_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          lesson_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          lesson_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_notes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_videos: {
        Row: {
          created_at: string | null
          id: string
          lesson_id: string
          order_number: number | null
          title: string | null
          video_url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lesson_id: string
          order_number?: number | null
          title?: string | null
          video_url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lesson_id?: string
          order_number?: number | null
          title?: string | null
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_videos_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          lesson_number: number
          material_url: string | null
          module_id: string | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          lesson_number: number
          material_url?: string | null
          module_id?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          lesson_number?: number
          material_url?: string | null
          module_id?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string | null
          created_at: string | null
          date: string | null
          description: string | null
          id: string
          instructor: string | null
          is_active: boolean | null
          module_number: number
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          instructor?: string | null
          is_active?: boolean | null
          module_number: number
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          instructor?: string | null
          is_active?: boolean | null
          module_number?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          reset_code: string | null
          reset_code_expires_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          reset_code?: string | null
          reset_code_expires_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          reset_code?: string | null
          reset_code_expires_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      simposio_registros: {
        Row: {
          correo: string
          created_at: string
          documento: string
          id: string
          modalidad: string
          nombre: string
          pais: string
          telefono: string | null
        }
        Insert: {
          correo: string
          created_at?: string
          documento?: string
          id?: string
          modalidad: string
          nombre: string
          pais: string
          telefono?: string | null
        }
        Update: {
          correo?: string
          created_at?: string
          documento?: string
          id?: string
          modalidad?: string
          nombre?: string
          pais?: string
          telefono?: string | null
        }
        Relationships: []
      }
      user_courses: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string | null
          enrolled_at: string | null
          id: string
          progress: number | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string | null
          enrolled_at?: string | null
          id?: string
          progress?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string | null
          enrolled_at?: string | null
          id?: string
          progress?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_learning_profile: {
        Row: {
          avg_session_duration_minutes: number | null
          created_at: string
          id: string
          last_active_at: string | null
          learning_pace: string | null
          longest_streak: number | null
          preferred_time_slot: string | null
          streak_days: number | null
          total_study_time_minutes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_session_duration_minutes?: number | null
          created_at?: string
          id?: string
          last_active_at?: string | null
          learning_pace?: string | null
          longest_streak?: number | null
          preferred_time_slot?: string | null
          streak_days?: number | null
          total_study_time_minutes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_session_duration_minutes?: number | null
          created_at?: string
          id?: string
          last_active_at?: string | null
          learning_pace?: string | null
          longest_streak?: number | null
          preferred_time_slot?: string | null
          streak_days?: number | null
          total_study_time_minutes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_profile_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          lesson_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_course_progress: {
        Args: { _course_id: string; _user_id: string }
        Returns: number
      }
      complete_lesson: { Args: { _lesson_id: string }; Returns: Json }
      enroll_in_course: { Args: { _course_id: string }; Returns: Json }
      get_admin_learning_insights: {
        Args: never
        Returns: {
          active_students_week: number
          avg_completion_rate: number
          avg_time_per_course_hours: number
          courses_with_data: Json
          difficult_modules: Json
          stagnant_users: number
          total_students: number
        }[]
      }
      get_student_analytics: {
        Args: { _user_id?: string }
        Returns: {
          avg_session_minutes: number
          current_streak: number
          last_week_minutes: number
          learning_pace: string
          longest_streak: number
          module_times: Json
          preferred_time: string
          recent_activity: Json
          this_week_minutes: number
          total_study_time_minutes: number
        }[]
      }
      get_student_progress: {
        Args: { _user_id?: string }
        Returns: {
          completed: boolean
          completed_at: string
          course_title: string
          lesson_id: string
          lesson_number: number
          lesson_title: string
          module_number: number
          module_title: string
          user_id: string
          user_name: string
        }[]
      }
      get_user_course_progress: { Args: { _course_id: string }; Returns: Json }
      get_user_list_for_admin: {
        Args: never
        Returns: {
          created_at: string
          full_name: string
          id: string
          status: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      mark_lesson_viewed: { Args: { _lesson_id: string }; Returns: Json }
      recalculate_all_progress: { Args: never; Returns: undefined }
      submit_exam_attempt: {
        Args: {
          _answers: Json
          _exam_id: string
          _lesson_id: string
          _passed: boolean
          _score: number
        }
        Returns: Json
      }
      user_completed_all_lessons: {
        Args: { _user_id: string }
        Returns: boolean
      }
      verify_admin_access: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "student"
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
      app_role: ["admin", "student"],
    },
  },
} as const
