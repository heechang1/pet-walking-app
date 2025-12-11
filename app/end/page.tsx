import Image from "next/image";
import Link from "next/link";
import React from "react";
const pet = {
  name: "콩이",
  image:
    "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=240&q=80",
};

const summary = {
  total: "32분",
  start: "10:00",
  end: "10:32",
};

export default function EndPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md text-center space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">오늘 산책 완료!</h1>

        <div className="flex flex-col items-center gap-3">
          <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-[#A8DED0] shadow-sm">
            <Image
              src={pet.image}
              alt={pet.name}
              width={96}
              height={96}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <p className="text-lg font-semibold text-gray-800">{pet.name}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-[#FBD3D3]/60 p-5 text-left space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>총 산책시간</span>
            <span className="font-semibold text-gray-900">{summary.total}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>시작시간</span>
            <span className="font-semibold text-gray-900">{summary.start}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>종료시간</span>
            <span className="font-semibold text-gray-900">{summary.end}</span>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-[#A8DED0] text-gray-900 font-semibold py-4 rounded-full shadow-md transition active:scale-95"
          >
            기록 저장하기
          </Link>
          <Link
            href="/start"
            className="block w-full bg-[#FBD3D3] text-gray-900 font-semibold py-4 rounded-full shadow-md transition active:scale-95"
          >
            처음으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}




