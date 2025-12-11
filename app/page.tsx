export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-[#FFFDF8]">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">NFC Pet Walking</h1>
        <p className="text-gray-600">
          아래 페이지를 직접 방문해 산책 플로우를 확인하세요.
        </p>
        <div className="grid grid-cols-1 gap-3">
          <a
            className="w-full bg-[#A8DED0] text-gray-900 font-semibold py-3 rounded-full shadow-sm transition active:scale-95"
            href="/start"
          >
            산책 시작 페이지
          </a>
          <a
            className="w-full bg-[#F6C28B] text-gray-900 font-semibold py-3 rounded-full shadow-sm transition active:scale-95"
            href="/walking"
          >
            산책 중 페이지
          </a>
          <a
            className="w-full bg-[#FBD3D3] text-gray-900 font-semibold py-3 rounded-full shadow-sm transition active:scale-95"
            href="/end"
          >
            산책 종료 페이지
          </a>
        </div>
      </div>
    </main>
  );
}



