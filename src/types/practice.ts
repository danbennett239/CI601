export interface Practice {
  practice_id: string;
  practice_name: string;
  email: string;
  phone_number: string;
  photo?: string;
  address: Record<string, any>;
  opening_hours: Array<{ dayName: string; open: string; close: string }>;
  verified: boolean;
  created_at?: string;
  updated_at?: string;
  verified_at?: string;
}
