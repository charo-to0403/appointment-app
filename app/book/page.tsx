"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CalendarView from "@/components/CalendarView";
import TimeSlotList from "@/components/TimeSlotList";
import BookingForm from "@/components/BookingForm";

interface TimeSlot {
  start: string;
  end: string;
  display: string;
}

type BookingType = "presentation" | "appointment";

export default function BookPage() {
  const router = useRouter();
  const [bookingType, setBookingType] = useState<BookingType | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingType) return;
    setAvailableDates([]);
    setSelectedDate(null);
    setSelectedSlot(null);
    fetch(`/api/available-slots?type=${bookingType}`)
      .then((res) => res.json())
      .then((data) => setAvailableDates(data.dates || []))
      .catch(() => setError("予約可能日の取得に失敗しました"));
  }, [bookingType]);

  useEffect(() => {
    if (!selectedDate || !bookingType) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    setError(null);
    fetch(`/api/available-slots?date=${selectedDate}&type=${bookingType}`)
      .then((res) => res.json())
      .then((data) => setSlots(data.slots || []))
      .catch(() => setError("空き枠の取得に失敗しました"))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, bookingType]);

  const handleTypeSelect = (type: BookingType) => {
    setBookingType(type);
    setSelectedSlot(null);
    setSlots([]);
  };

  const handleBook = async (formData: {
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    purpose: string;
  }) => {
    if (!selectedSlot) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: selectedSlot.start,
          end: selectedSlot.end,
          bookingType,
          ...formData,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "予約に失敗しました");
      }

      const typeLabel = bookingType === "presentation" ? "説明会" : "アポイント";
      const params = new URLSearchParams({
        date: selectedDate!,
        time: selectedSlot.display,
        company: formData.companyName,
        name: formData.contactName,
        type: typeLabel,
      });
      router.push(`/complete?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "予約に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1">
      <div className="max-w-4xl mx-auto px-4 py-8">
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">説明会・アポイント</h1>
          <p className="text-gray-600">
            ご希望の種別・日時を選択し、予約内容をご入力ください
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: タイプ選択 */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Step 1: 予約種別を選択
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleTypeSelect("presentation")}
              className={`p-5 rounded-xl border-2 text-left transition-all ${
                bookingType === "presentation"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className={`text-lg font-bold ${bookingType === "presentation" ? "text-blue-700" : "text-gray-900"}`}>
                説明会
              </div>
            </button>
            <button
              onClick={() => handleTypeSelect("appointment")}
              className={`p-5 rounded-xl border-2 text-left transition-all ${
                bookingType === "appointment"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className={`text-lg font-bold ${bookingType === "appointment" ? "text-blue-700" : "text-gray-900"}`}>
                アポイント
              </div>
            </button>
          </div>
        </div>

        {bookingType && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Step 2: 日付選択 */}
              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Step 2: 日付を選択
                </h2>
                <CalendarView
                  availableDates={availableDates}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />
              </div>

              {/* Step 3: 時間選択 */}
              {selectedDate && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Step 3: 時間を選択
                  </h2>
                  <TimeSlotList
                    slots={slots}
                    selectedSlot={selectedSlot}
                    onSelectSlot={setSelectedSlot}
                    loading={loadingSlots}
                  />
                </div>
              )}
            </div>

            <div>
              {selectedSlot && selectedDate ? (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Step 4: 予約情報を入力
                  </h2>
                  <BookingForm
                    selectedDate={selectedDate}
                    selectedSlot={selectedSlot}
                    bookingType={bookingType || undefined}
                    onSubmit={handleBook}
                    submitting={submitting}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">
                    日付と時間を選択すると
                    <br />
                    予約フォームが表示されます
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
