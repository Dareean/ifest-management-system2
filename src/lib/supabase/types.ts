export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      committee_years: {
        Row: {
          id: string;
          label: string;
          is_active: boolean;
          started_at: string;
          ended_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          label: string;
          is_active?: boolean;
          started_at: string;
          ended_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          label?: string;
          is_active?: boolean;
          started_at?: string;
          ended_at?: string | null;
          created_at?: string;
        };
      };
      divisions: {
        Row: {
          id: string;
          committee_year_id: string;
          name: string;
          slug: string;
          description: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          committee_year_id: string;
          name: string;
          slug: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          committee_year_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      roles: {
        Row: {
          id: string;
          committee_year_id: string;
          name: string;
          slug: string;
          level: number;
          is_approver: boolean;
          is_meeting_creator: boolean;
          is_report_creator: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          committee_year_id: string;
          name: string;
          slug: string;
          level?: number;
          is_approver?: boolean;
          is_meeting_creator?: boolean;
          is_report_creator?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          committee_year_id?: string;
          name?: string;
          slug?: string;
          level?: number;
          is_approver?: boolean;
          is_meeting_creator?: boolean;
          is_report_creator?: boolean;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          nim: string;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          nim: string;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          nim?: string;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      committee_assignments: {
        Row: {
          id: string;
          committee_year_id: string;
          user_id: string;
          division_id: string;
          role_id: string;
          is_active: boolean;
          can_submit_report: boolean;
          can_create_meeting: boolean;
          assigned_at: string;
        };
        Insert: {
          id?: string;
          committee_year_id: string;
          user_id: string;
          division_id: string;
          role_id: string;
          is_active?: boolean;
          can_submit_report?: boolean;
          can_create_meeting?: boolean;
          assigned_at?: string;
        };
        Update: {
          id?: string;
          committee_year_id?: string;
          user_id?: string;
          division_id?: string;
          role_id?: string;
          is_active?: boolean;
          can_submit_report?: boolean;
          can_create_meeting?: boolean;
          assigned_at?: string;
        };
      };
      letter_requests: {
        Row: {
          id: string;
          committee_year_id: string;
          requester_id: string;
          current_handler_id: string | null;
          division_id: string;
          letter_type: string;
          subject: string;
          body: string;
          status: string;
          revision_count: number;
          final_document_url: string | null;
          deadline_at: string | null;
          target_institution: string | null;
          category: string | null;
          request_options: string | null;
          priority: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          committee_year_id: string;
          requester_id: string;
          current_handler_id?: string | null;
          division_id: string;
          letter_type: string;
          subject: string;
          body: string;
          status?: string;
          revision_count?: number;
          final_document_url?: string | null;
          deadline_at?: string | null;
          target_institution?: string | null;
          category?: string | null;
          request_options?: string | null;
          priority?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          committee_year_id?: string;
          requester_id?: string;
          current_handler_id?: string | null;
          division_id?: string;
          letter_type?: string;
          subject?: string;
          body?: string;
          status?: string;
          revision_count?: number;
          final_document_url?: string | null;
          deadline_at?: string | null;
          target_institution?: string | null;
          category?: string | null;
          request_options?: string | null;
          priority?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      meetings: {
        Row: {
          id: string;
          committee_year_id: string;
          creator_id: string;
          title: string;
          agenda: string | null;
          meeting_type: string;
          meeting_link: string | null;
          location: string | null;
          attachment_url: string | null;
          started_at: string;
          ended_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          committee_year_id: string;
          creator_id: string;
          title: string;
          agenda?: string | null;
          meeting_type?: string;
          meeting_link?: string | null;
          location?: string | null;
          attachment_url?: string | null;
          started_at: string;
          ended_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          committee_year_id?: string;
          creator_id?: string;
          title?: string;
          agenda?: string | null;
          meeting_type?: string;
          meeting_link?: string | null;
          location?: string | null;
          attachment_url?: string | null;
          started_at?: string;
          ended_at?: string | null;
          created_at?: string;
        };
      };
      meeting_invitees: {
        Row: {
          id: string;
          meeting_id: string;
          committee_assignment_id: string;
          rsvp_status: string;
          email_sent: boolean;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          committee_assignment_id: string;
          rsvp_status?: string;
          email_sent?: boolean;
        };
        Update: {
          id?: string;
          meeting_id?: string;
          committee_assignment_id?: string;
          rsvp_status?: string;
          email_sent?: boolean;
        };
      };
      meeting_notes: {
        Row: {
          id: string;
          meeting_id: string;
          writer_id: string;
          content: string;
          decision_points: Json | null;
          action_items: Json | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          writer_id: string;
          content: string;
          decision_points?: Json | null;
          action_items?: Json | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          meeting_id?: string;
          writer_id?: string;
          content?: string;
          decision_points?: Json | null;
          action_items?: Json | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      kpi_items: {
        Row: {
          id: string;
          committee_year_id: string;
          division_id: string;
          title: string;
          target: string;
          deadline: string | null;
          is_milestone: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          committee_year_id: string;
          division_id: string;
          title: string;
          target: string;
          deadline?: string | null;
          is_milestone?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          committee_year_id?: string;
          division_id?: string;
          title?: string;
          target?: string;
          deadline?: string | null;
          is_milestone?: boolean;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          committee_year_id: string;
          kpi_item_id: string | null;
          division_id: string;
          assignee_id: string | null;
          title: string;
          description: string | null;
          status: string;
          priority: string;
          deadline: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          committee_year_id: string;
          kpi_item_id?: string | null;
          division_id: string;
          assignee_id?: string | null;
          title: string;
          description?: string | null;
          status?: string;
          priority?: string;
          deadline?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          committee_year_id?: string;
          kpi_item_id?: string | null;
          division_id?: string;
          assignee_id?: string | null;
          title?: string;
          description?: string | null;
          status?: string;
          priority?: string;
          deadline?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          committee_assignment_id: string;
          type: string;
          title: string;
          body: string | null;
          is_read: boolean;
          email_sent: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          committee_assignment_id: string;
          type: string;
          title: string;
          body?: string | null;
          is_read?: boolean;
          email_sent?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          committee_assignment_id?: string;
          type?: string;
          title?: string;
          body?: string | null;
          is_read?: boolean;
          email_sent?: boolean;
          created_at?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          committee_year_id: string;
          division_id: string;
          total_budget: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          committee_year_id: string;
          division_id: string;
          total_budget?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          committee_year_id?: string;
          division_id?: string;
          total_budget?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      budget_transactions: {
        Row: {
          id: string;
          budget_id: string;
          type: string;
          amount: number;
          description: string;
          category: string | null;
          attachment_url: string | null;
          receipt_number: string | null;
          transaction_date: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          budget_id: string;
          type: string;
          amount: number;
          description: string;
          category?: string | null;
          attachment_url?: string | null;
          receipt_number?: string | null;
          transaction_date?: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          budget_id?: string;
          type?: string;
          amount?: number;
          description?: string;
          category?: string | null;
          attachment_url?: string | null;
          receipt_number?: string | null;
          transaction_date?: string;
          created_by?: string;
          created_at?: string;
        };
      };
      budget_requests: {
        Row: {
          id: string;
          committee_year_id: string;
          requester_id: string;
          division_id: string;
          amount: number;
          purpose: string;
          status: string;
          handler_id: string | null;
          handled_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          committee_year_id: string;
          requester_id: string;
          division_id: string;
          amount: number;
          purpose: string;
          status?: string;
          handler_id?: string | null;
          handled_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          committee_year_id?: string;
          requester_id?: string;
          division_id?: string;
          amount?: number;
          purpose?: string;
          status?: string;
          handler_id?: string | null;
          handled_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      email_queue: {
        Row: {
          id: string;
          recipient_email: string;
          recipient_name: string | null;
          subject: string;
          html_content: string;
          priority: number;
          status: string;
          error_message: string | null;
          retry_count: number;
          max_retries: number;
          created_at: string;
          sent_at: string | null;
        };
        Insert: {
          id?: string;
          recipient_email: string;
          recipient_name?: string | null;
          subject: string;
          html_content: string;
          priority?: number;
          status?: string;
          error_message?: string | null;
          retry_count?: number;
          max_retries?: number;
          created_at?: string;
          sent_at?: string | null;
        };
        Update: {
          id?: string;
          recipient_email?: string;
          recipient_name?: string | null;
          subject?: string;
          html_content?: string;
          priority?: number;
          status?: string;
          error_message?: string | null;
          retry_count?: number;
          max_retries?: number;
          created_at?: string;
          sent_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
