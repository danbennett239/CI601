// constants/calendarConstants.ts
export const CALENDAR_START_HOUR = 6; // 6:00 AM
export const CALENDAR_END_HOUR = 22;  // 10:00 PM
export const SLOT_DURATION = 30;      // minutes per slot
export const TOTAL_MINUTES = (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * 60;
export const NUM_SLOTS = TOTAL_MINUTES / SLOT_DURATION;
