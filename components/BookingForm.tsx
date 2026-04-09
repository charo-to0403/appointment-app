"use client";

import { useState } from "react";

interface TimeSlot {
  start: string;
  end: string;
  display: string;
}

interface BookingFormProps {
  selectedDate: string;
  selectedSlot: TimeSlot;
  onSubmit: (data: {
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    purpose: string;
  }) => Promise<void>;
  submitting: boolean;
}

export default function BookingForm({
  selectedDate,
  selectedSlot,
  onSubmit,
  submitting,
}: BookingFormProps) {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ companyName, contactName, email, phone, purpose });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">予約内容を入力</h3>
      <p className="text-sm text-gray-500 mb-6">
        {selectedDate} {selectedSlot.display}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            会社名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="例: ○○製薬株式会社"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            担当者名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="例: 山田太郎"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="例: yamada@example.com"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            電話番号 <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="例: 090-1234-5678"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="例: 新薬○○の情報提供について"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-gray-900"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !companyName || !contactName || !email || !phone || !purpose}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              予約処理中...
            </span>
          ) : (
            "予約を確定する"
          )}
        </button>
      </form>
    </div>
  );
}
