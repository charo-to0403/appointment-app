import fs from "fs";
import path from "path";

export interface AppSettings {
  availableDays: number[]; // 0=日, 1=月, ..., 6=土
  timeSlots: { start: string; end: string };
  slotDuration: number; // 分
  calendarId: string;
  bookingWindowDays: number;
}

const SETTINGS_PATH = path.join(process.cwd(), "settings.json");

export function getSettings(): AppSettings {
  const raw = fs.readFileSync(SETTINGS_PATH, "utf-8");
  return JSON.parse(raw);
}

export function updateSettings(partial: Partial<AppSettings>): AppSettings {
  const current = getSettings();
  const updated = { ...current, ...partial };
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(updated, null, 2) + "\n");
  return updated;
}
