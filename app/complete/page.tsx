"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function CompleteContent() {
  const searchParams = useSearchParams();
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const company = searchParams.get("company");
  const name = searchParams.get("name");
  const type = searchParams.get("type");

  return (
    <main className="flex-1 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            予約が完了しました
          </h1>
          <p className="text-gray-600">
            カレンダーに予約が反映されました
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-2">
          {type && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">種別</span>
              <span className="text-sm font-medium text-gray-900">{type}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">日付</span>
            <span className="text-sm font-medium text-gray-900">{date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">時間</span>
            <span className="text-sm font-medium text-gray-900">{time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">会社名</span>
            <span className="text-sm font-medium text-gray-900">{company}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">担当者</span>
            <span className="text-sm font-medium text-gray-900">{name}</span>
          </div>
        </div>

        <Link
          href="/"
          className="inline-block w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
        >
          トップに戻る
        </Link>
      </div>
    </main>
  );
}

export default function CompletePage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center">読み込み中...</div>}>
      <CompleteContent />
    </Suspense>
  );
}
