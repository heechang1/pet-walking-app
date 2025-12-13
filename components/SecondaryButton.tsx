import Link from "next/link";
import React from "react";

interface SecondaryButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: "pink" | "orange";
}

export default function SecondaryButton({
  children,
  href,
  onClick,
  className = "",
  disabled = false,
  variant = "pink",
}: SecondaryButtonProps) {
  const variantClasses =
    variant === "pink"
      ? "bg-[#FBD3D3] text-gray-900"
      : "bg-[#F6C28B] text-gray-900";

  const baseClasses = `w-full ${variantClasses} font-semibold py-4 px-6 rounded-full shadow-md transition-all duration-200 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`;

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


