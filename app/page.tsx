import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          予約システム
        </h1>
        <p className="text-gray-500 mb-10">
          説明会やアポイントのご予約はこちらからお願いします
        </p>

        <div className="space-y-4">
          <Link
            href="/book"
            className="block w-full py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm"
          >
            予約する（入力はこちら）
          </Link>

          <Link
            href="/admin"
            className="block w-full py-4 bg-white text-gray-700 text-lg font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-all"
          >
            管理画面
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-8">
          管理画面にはパスワードが必要です
        </p>

        <div className="mt-10 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            説明会やアポイント以外のお問い合わせはこちらへお願いします
          </p>
          <a
            href="mailto:libeclinic.tochigi@gmail.com"
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            libeclinic.tochigi@gmail.com
          </a>
          <p className="text-sm text-gray-600 mt-2 font-medium">
            うつのみやLA泌尿器科クリニック
          </p>
        </div>
      </div>
    </main>
  );
}
