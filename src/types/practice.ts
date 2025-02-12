export interface Practice {
  practice_id: string;
  practice_name: string;
  email: string;
  phone_number: string;
  photo?: string;
  address: Address
  opening_hours: Array<{ dayName: string; open: string; close: string }>;
  verified: boolean;
  created_at?: string;
  updated_at?: string;
  verified_at?: string;
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
  id: number;
  title: string;
  start: string; // ISO string
  end: string;   // ISO string
  booked: boolean;
}

export interface OpeningHoursItem {
  open: string;    // e.g., "closed" or "08:15"
  close: string;   // e.g., "closed" or "17:30"
  dayName: string; // e.g., "Monday"
}

export type ViewType = "day" | "calendarWeek" | "workWeek" | "month";