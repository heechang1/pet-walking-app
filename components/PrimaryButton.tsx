import Link from "next/link";
import React from "react";

interface PrimaryButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function PrimaryButton({
  children,
  href,
  onClick,
  className = "",
  disabled = false,
}: PrimaryButtonProps) {
  const baseClasses =
    "w-full bg-[#A8DED0] text-gray-900 font-semibold py-4 px-6 rounded-full shadow-md transition-all duration-200 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed";

  if (href) {
    return (
      <Link
        href={href}
        className={`${baseClasses} ${className}`}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${className}`}
    >
      {children}
    </button>
  );
}


