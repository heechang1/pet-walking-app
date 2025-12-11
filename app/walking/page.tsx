import React from "react";

import Link from "next/link";

const pet = {
  name: "콩이",
};

export default function WalkingPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {pet.name}와 산책 중…
          </h1>
          <div className="flex justify-center text-3xl space-x-2 text-[#FBD3D3]">
            <span>🐾</span>
            <span>🐾</span>
            <span className="animate-pulse">🐾</span>
          </div>
        </div>

        <div className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-widest">
          00:00:00
        </div>

        <Link
          href="/end"
          className="block w-full bg-[#F6C28B] text-gray-900 font-semibold py-4 rounded-full shadow-md transition active:scale-95"
        >
          산책 종료
        </Link>
      </div>
    </div>
  );
}

