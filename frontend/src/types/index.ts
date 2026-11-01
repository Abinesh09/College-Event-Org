export interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'teacher' | 'student';
  created_at: string;
  updated_at: string;
  profile?: StudentProfile;
}

export interface StudentProfile {
  user_id: string;
  college_name: string;
  student_id: string;
  department: string;
  year_of_study: string;
  date_of_birth?: string;
  age?: number;
  gender?: string;
  phone_number?: string;
}

export interface Event {
  id: string;
  organizer_id: string;
  organizer_name?: string;
  title: string;
  short_description: string;
  description: string;
  category: string;
  event_type: 'technical' | 'cultural' | 'sports' | 'workshop' | 'seminar' | 'other' | string;
  event_date: string; // YYYY-MM-DD
  start_time: string;
  end_time: string;
  venue: string;
  organizing_department: string;
  registration_open_at: string;
  registration_deadline: string;
  max_participants: number;
  eligibility_criteria?: string;
  poster_url?: string;
  contact_info?: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  computed_status: 'Draft' | 'Upcoming' | 'Registration Open' | 'Registration Closed' | 'Full' | 'Completed' | 'Cancelled';
  current_registrations: number;
  available_seats: number;
  is_registered?: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  student_id: string;
  registered_at: string;
  status: 'confirmed' | 'cancelled';
  event?: Event;
}

export interface ParticipantDetail {
  registration_id: string;
  registered_at: string;
  status: 'confirmed' | 'cancelled';
  user_id: string;
  full_name: string;
  email: string;
  college_name: string;
  student_id: string;
  department: string;
  year_of_study: string;
  date_of_birth?: string;
  age?: number;
  gender?: string;
  phone_number?: string;
}

export interface TeacherDashboardStats {
  total_events_created: number;
  active_events: number;
  total_registrations: number;
  upcoming_events: number;
  completed_events: number;
}

export interface LabelCount {
  label: string;
  count: number;
}

export interface DateCount {
  date: string;
  count: number;
}

export interface EventStatistics {
  event_id: string;
  event_title: string;
  total_registrations: number;
  max_participants: number;
  capacity_percentage: number;
  by_department: LabelCount[];
  by_year: LabelCount[];
  by_gender: LabelCount[];
  by_age_group: LabelCount[];
  over_time: DateCount[];
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export interface PaginatedApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T[];
  pagination: PaginationMeta;
}

