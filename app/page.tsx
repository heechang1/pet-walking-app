import Button from "@/components/Button";
import Stamp from "@/components/Stamp";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-10 sm:py-12 bg-[#FFFDF8]">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">NFC Pet Walking</h1>
          <p className="text-gray-600 text-sm">
            반려동물과 함께하는 산책 기록 앱
          </p>
        </div>

        <div className="flex justify-center text-4xl space-x-3 text-[#A8DED0]">
          <span className="paw-animation inline-block" style={{ animationDelay: "0ms" }}>
            <Stamp size="lg" />
          </span>
          <span className="paw-animation inline-block" style={{ animationDelay: "400ms" }}>
            <Stamp size="lg" />
          </span>
          <span className="paw-animation inline-block" style={{ animationDelay: "800ms" }}>
            <Stamp size="lg" />
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Button href="/start" variant="primary" size="md">
            산책 시작하기
          </Button>
          <Button href="/walking" variant="secondary-orange" size="md">
            산책 중 페이지
          </Button>
          <Button href="/end" variant="secondary-pink" size="md">
            산책 종료 페이지
          </Button>
        </div>
      </div>
    </main>
  );
}
