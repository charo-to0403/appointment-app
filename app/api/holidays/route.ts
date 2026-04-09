import { NextResponse } from "next/server";
import holidayJp from "@holiday-jp/holiday_jp";

export async function GET() {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 3, 0);

    const holidays = holidayJp.between(start, end);
    const dates = holidays.map((h: { date: Date; name: string }) => ({
      date: h.date.toISOString().split("T")[0],
      name: h.name,
    }));

    return NextResponse.json({ holidays: dates });
  } catch (error) {
    console.error("Failed to get holidays:", error);
    return NextResponse.json({ holidays: [] });
  }
}
