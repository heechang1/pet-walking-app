"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PetProfile } from "@/types/pet.types";

interface PetProfileCardProps {
  profile: PetProfile;
}

export default function PetProfileCard({ profile }: PetProfileCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % profile.photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + profile.photos.length) % profile.photos.length);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Image Carousel */}
      <div className="relative w-28 h-28">
        <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-[#A8DED0] shadow-sm relative">
          <Image
            src={profile.photos[currentPhotoIndex]}
            alt={profile.name}
            width={112}
            height={112}
            className="h-full w-full object-cover"
            priority
          />
        </div>
        {profile.photos.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-white/80 rounded-full p-1 shadow-md hover:bg-white transition"
              aria-label="Previous photo"
            >
              ←
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-white/80 rounded-full p-1 shadow-md hover:bg-white transition"
              aria-label="Next photo"
            >
              →
            </button>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
              {profile.photos.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 w-1 rounded-full ${
                    index === currentPhotoIndex ? "bg-[#A8DED0]" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <p className="text-lg font-semibold text-gray-800">{profile.name}</p>

      {/* Info Card */}
      {(profile.breed || profile.age || profile.weight) && (
        <div className="bg-white rounded-xl shadow-md border border-[#FBD3D3]/60 p-3 w-full max-w-xs">
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            {profile.breed && (
              <div>
                <div className="text-gray-500">견종</div>
                <div className="font-semibold text-gray-900">{profile.breed}</div>
              </div>
            )}
            {profile.age !== undefined && (
              <div>
                <div className="text-gray-500">나이</div>
                <div className="font-semibold text-gray-900">{profile.age}세</div>
              </div>
            )}
            {profile.weight !== undefined && (
              <div>
                <div className="text-gray-500">체중</div>
                <div className="font-semibold text-gray-900">{profile.weight}kg</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}




