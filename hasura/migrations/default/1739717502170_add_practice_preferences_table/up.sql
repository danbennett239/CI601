CREATE TABLE practice_preferences (
  practice_id uuid PRIMARY KEY REFERENCES practices(practice_id),

  -- Notification Settings
  enable_notifications boolean DEFAULT true, -- Master toggle for all notifications
  enable_mobile_notifications boolean DEFAULT false, -- Enable push/SMS notifications
  enable_email_notifications boolean DEFAULT true, -- Enable email notifications
  notify_on_new_booking boolean DEFAULT true, -- Notify practice when a patient books an appointment

  -- UI Preferences
  hide_delete_confirmation boolean DEFAULT false, -- Hide delete confirmation dialogs

  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
