import { NextRequest, NextResponse } from "next/server";

const GAS_URL = process.env.GAS_WEB_APP_URL || "";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");

  try {
    const typeParam = searchParams.get("type") || "appointment";
    const gasUrl = dateParam
      ? `${GAS_URL}?action=slots&date=${dateParam}&type=${typeParam}`
      : `${GAS_URL}?action=dates&type=${typeParam}`;

    const res = await fetch(gasUrl, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to get available slots:", error);
    return NextResponse.json(
      { error: "空き枠の取得に失敗しました" },
      { status: 500 }
    );
  }
}
