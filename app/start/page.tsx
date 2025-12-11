import Image from "next/image";
import Link from "next/link";
import React from "react";

const pet = {
  name: "콩이",
  image:
    "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=240&q=80",
};

export default function StartPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md text-center space-y-10">
        <div className="flex flex-col items-center gap-3">
          <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-[#A8DED0] shadow-sm">
            <Image
              src={pet.image}
              alt={pet.name}
              width={112}
              height={112}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <p className="text-lg font-semibold text-gray-800">{pet.name}</p>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          산책을 시작해볼까요?
        </h1>

        <Link
          href="/walking"
          className="block w-full bg-[#A8DED0] text-gray-900 font-semibold py-4 rounded-full shadow-md transition active:scale-95"
        >
          산책 시작하기
        </Link>
      </div>
    </div>
  );
}




