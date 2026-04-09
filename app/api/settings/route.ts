import { NextRequest, NextResponse } from "next/server";

const GAS_URL = process.env.GAS_WEB_APP_URL || "";

export async function GET() {
  try {
    const res = await fetch(`${GAS_URL}?action=settings`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to get settings:", error);
    return NextResponse.json(
      { error: "設定の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const password = request.headers.get("x-admin-password");
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "管理者パスワードが正しくありません" },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (body.action === "checkAuth") {
      return NextResponse.json({ success: true });
    }

    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json(
      { error: "設定の更新に失敗しました" },
      { status: 500 }
    );
  }
}
