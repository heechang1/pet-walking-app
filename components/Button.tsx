import Link from "next/link";
import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: "primary" | "secondary-pink" | "secondary-orange";
  size?: "sm" | "md" | "lg";
}

const variantClasses = {
  primary: "bg-[#A8DED0] text-gray-900 hover:bg-[#8bc9bb]",
  "secondary-pink": "bg-[#FBD3D3] text-gray-900 hover:bg-[#f9c0c0]",
  "secondary-orange": "bg-[#F6C28B] text-gray-900 hover:bg-[#f4b570]",
};

const sizeClasses = {
  sm: "py-2 px-4 text-sm",
  md: "py-4 px-6 text-base",
  lg: "py-5 px-8 text-lg",
};

export default function Button({
  children,
  href,
  onClick,
  className = "",
  disabled = false,
  variant = "primary",
  size = "md",
}: ButtonProps) {
  const baseClasses = `w-full font-semibold rounded-full shadow-md transition-all duration-200 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]}`;

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


