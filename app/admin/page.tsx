"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface PresentationSlot {
  start: string;
  end: string;
}

interface Settings {
  presentationDays: number[];
  appointmentDays: number[];
  presentationSlots: PresentationSlot[];
  presentationDuration: number;
  appointmentTimes: string[];
  appointmentDuration: number;
}

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!authenticated) return;
    fetch("/api/settings")
      .then((res) => res.json())
      .then(setSettings)
      .catch(() =>
        setMessage({ type: "error", text: "設定の取得に失敗しました" })
      );
  }, [authenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setMessage({ type: "error", text: "パスワードを入力してください" });
      return;
    }
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ action: "checkAuth" }),
      });
      if (!res.ok) {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "パスワードが正しくありません" });
        return;
      }
      setAuthenticated(true);
      setMessage(null);
    } catch {
      setMessage({ type: "error", text: "認証に失敗しました" });
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ action: "updateSettings", ...settings }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "エラー");
      setMessage({ type: "success", text: "設定を保存しました" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "保存に失敗しました",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (field: "presentationDays" | "appointmentDays", day: number) => {
    if (!settings) return;
    const current = settings[field];
    const days = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort();
    setSettings({ ...settings, [field]: days });
  };

  if (!authenticated) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-6 text-center">
            管理画面ログイン
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              トップに戻る
            </Link>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="管理者パスワード"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
            >
              ログイン
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (!settings) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            トップに戻る
          </Link>
        </div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">予約設定</h1>
          <Link href="/book" className="text-sm text-blue-600 hover:text-blue-700">
            予約ページを見る
          </Link>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* 説明会 曜日選択 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              説明会の対応曜日
            </h2>
            <p className="text-sm text-gray-500 mb-3">説明会を受け付ける曜日</p>
            <div className="flex gap-2">
              {DAY_LABELS.map((label, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleDay("presentationDays", idx)}
                  className={`w-12 h-12 rounded-lg font-medium text-sm transition-all ${
                    settings.presentationDays.includes(idx)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* アポイント 曜日選択 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              アポイントの対応曜日
            </h2>
            <p className="text-sm text-gray-500 mb-3">アポイントを受け付ける曜日</p>
            <div className="flex gap-2">
              {DAY_LABELS.map((label, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleDay("appointmentDays", idx)}
                  className={`w-12 h-12 rounded-lg font-medium text-sm transition-all ${
                    settings.appointmentDays.includes(idx)
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 説明会 設定 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              説明会の時間枠
            </h2>
            <p className="text-sm text-gray-500 mb-3">各枠 {settings.presentationDuration}分</p>
            <div className="space-y-3">
              {settings.presentationSlots.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 w-12">枠{idx + 1}</span>
                  <input
                    type="time"
                    value={slot.start}
                    onChange={(e) => {
                      const newSlots = [...settings.presentationSlots];
                      newSlots[idx] = { ...newSlots[idx], start: e.target.value };
                      // 自動で終了時刻を計算
                      const [h, m] = e.target.value.split(":").map(Number);
                      const endMin = h * 60 + m + settings.presentationDuration;
                      const endH = String(Math.floor(endMin / 60)).padStart(2, "0");
                      const endM = String(endMin % 60).padStart(2, "0");
                      newSlots[idx].end = `${endH}:${endM}`;
                      setSettings({ ...settings, presentationSlots: newSlots });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                  <span className="text-sm text-gray-400">〜 {slot.end}</span>
                  {settings.presentationSlots.length > 1 && (
                    <button
                      onClick={() => {
                        const newSlots = settings.presentationSlots.filter((_, i) => i !== idx);
                        setSettings({ ...settings, presentationSlots: newSlots });
                      }}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      削除
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  const last = settings.presentationSlots[settings.presentationSlots.length - 1];
                  const [h, m] = last.end.split(":").map(Number);
                  const newStartMin = h * 60 + m;
                  const newEndMin = newStartMin + settings.presentationDuration;
                  const newStart = `${String(Math.floor(newStartMin / 60)).padStart(2, "0")}:${String(newStartMin % 60).padStart(2, "0")}`;
                  const newEnd = `${String(Math.floor(newEndMin / 60)).padStart(2, "0")}:${String(newEndMin % 60).padStart(2, "0")}`;
                  setSettings({
                    ...settings,
                    presentationSlots: [...settings.presentationSlots, { start: newStart, end: newEnd }],
                  });
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + 枠を追加（20分後）
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                1枠あたりの時間（分）
              </label>
              <select
                value={settings.presentationDuration}
                onChange={(e) =>
                  setSettings({ ...settings, presentationDuration: Number(e.target.value) })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value={10}>10分</option>
                <option value={15}>15分</option>
                <option value={20}>20分</option>
                <option value={30}>30分</option>
              </select>
            </div>
          </div>

          {/* アポイント 設定 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              アポイントの時間枠
            </h2>
            <p className="text-sm text-gray-500 mb-3">各枠 {settings.appointmentDuration}分</p>
            <div className="space-y-3">
              {settings.appointmentTimes.map((time, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 w-12">枠{idx + 1}</span>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => {
                      const newTimes = [...settings.appointmentTimes];
                      newTimes[idx] = e.target.value;
                      setSettings({ ...settings, appointmentTimes: newTimes });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                  {settings.appointmentTimes.length > 1 && (
                    <button
                      onClick={() => {
                        const newTimes = settings.appointmentTimes.filter((_, i) => i !== idx);
                        setSettings({ ...settings, appointmentTimes: newTimes });
                      }}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      削除
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    appointmentTimes: [...settings.appointmentTimes, "13:30"],
                  })
                }
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + 枠を追加
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                1枠あたりの時間（分）
              </label>
              <select
                value={settings.appointmentDuration}
                onChange={(e) =>
                  setSettings({ ...settings, appointmentDuration: Number(e.target.value) })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value={5}>5分</option>
                <option value={10}>10分</option>
                <option value={15}>15分</option>
                <option value={20}>20分</option>
                <option value={30}>30分</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm"
          >
            {saving ? "保存中..." : "設定を保存"}
          </button>
        </div>
      </div>
    </main>
  );
}
