"use client";

import { useRouter } from "next/navigation";
import ProfileCard from "@/components/ProfileCard";
import Button from "@/components/Button";

const pet = {
  name: "콩이",
  image:
    "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=240&q=80",
};

export default function StartPage() {
  const router = useRouter();

  const handleStart = () => {
    // 산책 시작 시간 저장
    const startTime = new Date().toISOString();
    localStorage.setItem("walkingStartTime", startTime);
    localStorage.setItem("walkingElapsed", "0");
    localStorage.setItem("walkingIsActive", "true");

    router.push("/walking");
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center px-4 sm:px-6 py-8 sm:py-10">
      <div className="w-full max-w-md text-center space-y-10">
        <div className="hover-lift">
          <ProfileCard name={pet.name} image={pet.image} size="md" />
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            산책을 시작해볼까요?
          </h1>
          <p className="text-gray-600 text-sm">
            {pet.name}와 함께 즐거운 산책 시간을 보내세요
          </p>
        </div>

        <Button onClick={handleStart} variant="primary" size="md">
          산책 시작하기
        </Button>
      </div>
    </div>
  );
}
