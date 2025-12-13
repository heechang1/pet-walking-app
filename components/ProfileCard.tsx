import Image from "next/image";
import React from "react";

interface ProfileCardProps {
  name: string;
  image: string;
  size?: "sm" | "md" | "lg";
}

export default function ProfileCard({
  name,
  image,
  size = "md",
}: ProfileCardProps) {
  const sizeClasses = {
    sm: "h-20 w-20 border-2",
    md: "h-28 w-28 border-4",
    lg: "h-32 w-32 border-4",
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden border-[#A8DED0] shadow-soft hover:shadow-soft-lg transition-all duration-300 bg-white hover:scale-105`}
      >
        <Image
          src={image}
          alt={name}
          width={size === "sm" ? 80 : size === "md" ? 112 : 128}
          height={size === "sm" ? 80 : size === "md" ? 112 : 128}
          className="h-full w-full object-cover"
          priority
        />
      </div>
      <p className="text-lg font-semibold text-gray-800">{name}</p>
    </div>
  );
}

