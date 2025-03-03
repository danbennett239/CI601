export interface Practice {
  practice_id: string;
  practice_name: string;
  email: string;
  phone_number: string;
  photo?: string;
  address: Address
  opening_hours: Array<{ dayName: string; open: string; close: string }>;
  verified: boolean;
  verified_at?: string;
  practice_preferences: PracticePreferences;
  practice_services: Record<string, number>;
  created_at?: string;
  updated_at?: string;
}

export interface NearbyPractice extends Omit<Practice, 'practice_preferences'> {
  distance: number;
  location: {
    type: string;
    coordinates: [number, number];
  };
}

export interface PracticePreferences {
  practice_id: string;
  enable_notifications: boolean;
  enable_mobile_notifications: boolean;
  enable_email_notifications: boolean;
  notify_on_new_booking: boolean;
  hide_delete_confirmation: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Address {
  line1: string;
  line2?: string;
  line3?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
}
export interface Appointment {
  appointment_id: string;
  practice_id: string;
  user_id: string;
  title: string;
  start_time: string;
  end_time: string;
  services?: Record<string, number>;
  booked_service?: { type: string; price: number };
  booked: boolean;
  created_at: string;
  updated_at: string;
}


export interface OpeningHoursItem {
  open: string;    // e.g., "closed" or "08:15"
  close: string;   // e.g., "closed" or "17:30"
  dayName: string; // e.g., "Monday"
}

export type ViewType = "day" | "calendarWeek" | "workWeek" | "month";