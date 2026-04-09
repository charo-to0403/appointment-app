import { NextRequest, NextResponse } from "next/server";

const GAS_URL = process.env.GAS_WEB_APP_URL || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { start, end, companyName, contactName, email, phone, purpose, bookingType } = body;

    if (!start || !end || !companyName || !contactName || !email || !phone || !purpose) {
      return NextResponse.json(
        { error: "全ての項目を入力してください" },
        { status: 400 }
      );
    }

    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ start, end, companyName, contactName, email, phone, purpose, bookingType }),
    });

    const data = await res.json();

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to create booking:", error);
    return NextResponse.json(
      { error: "予約の作成に失敗しました" },
      { status: 500 }
    );
  }
}
