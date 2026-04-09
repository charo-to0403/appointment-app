import { google, calendar_v3 } from "googleapis";
import { getSettings } from "./settings";
import {
  startOfDay,
  endOfDay,
  addMinutes,
  format,
  parseISO,
  isAfter,
  isBefore,
  addDays,
  getDay,
} from "date-fns";

function getCalendarClient(): calendar_v3.Calendar {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
  return google.calendar({ version: "v3", auth });
}

export interface TimeSlot {
  start: string; // ISO string
  end: string;
  display: string; // "09:00 - 09:30"
}

export async function getAvailableSlots(date: Date): Promise<TimeSlot[]> {
  const settings = getSettings();
  const dayOfWeek = getDay(date);

  if (!settings.availableDays.includes(dayOfWeek)) {
    return [];
  }

  const calendar = getCalendarClient();
  const calendarId =
    process.env.GOOGLE_CALENDAR_ID || settings.calendarId || "primary";

  const timeMin = startOfDay(date).toISOString();
  const timeMax = endOfDay(date).toISOString();

  const freeBusyResponse = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      items: [{ id: calendarId }],
    },
  });

  const busyPeriods =
    freeBusyResponse.data.calendars?.[calendarId]?.busy || [];

  const [startHour, startMin] = settings.timeSlots.start.split(":").map(Number);
  const [endHour, endMin] = settings.timeSlots.end.split(":").map(Number);

  const dayStart = new Date(date);
  dayStart.setHours(startHour, startMin, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(endHour, endMin, 0, 0);

  const slots: TimeSlot[] = [];
  let current = dayStart;

  while (isBefore(current, dayEnd)) {
    const slotEnd = addMinutes(current, settings.slotDuration);
    if (isAfter(slotEnd, dayEnd)) break;

    const isBusy = busyPeriods.some((busy) => {
      const busyStart = parseISO(busy.start!);
      const busyEnd = parseISO(busy.end!);
      return isBefore(current, busyEnd) && isAfter(slotEnd, busyStart);
    });

    if (!isBusy) {
      slots.push({
        start: current.toISOString(),
        end: slotEnd.toISOString(),
        display: `${format(current, "HH:mm")} - ${format(slotEnd, "HH:mm")}`,
      });
    }

    current = slotEnd;
  }

  return slots;
}

export interface BookingData {
  start: string;
  end: string;
  companyName: string;
  contactName: string;
  phone: string;
  purpose: string;
}

export async function createBooking(data: BookingData) {
  const calendar = getCalendarClient();
  const settings = getSettings();
  const calendarId =
    process.env.GOOGLE_CALENDAR_ID || settings.calendarId || "primary";

  const event = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: `【MR面談】${data.companyName} - ${data.contactName}`,
      description: [
        `会社名: ${data.companyName}`,
        `担当者: ${data.contactName}`,
        `電話番号: ${data.phone}`,
        `面談目的: ${data.purpose}`,
      ].join("\n"),
      start: { dateTime: data.start, timeZone: "Asia/Tokyo" },
      end: { dateTime: data.end, timeZone: "Asia/Tokyo" },
    },
  });

  return event.data;
}

export function getAvailableDates(): Date[] {
  const settings = getSettings();
  const dates: Date[] = [];
  const today = new Date();

  for (let i = 1; i <= settings.bookingWindowDays; i++) {
    const date = addDays(today, i);
    if (settings.availableDays.includes(getDay(date))) {
      dates.push(date);
    }
  }

  return dates;
}
