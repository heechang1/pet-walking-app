"use client";

import React from "react";

interface StampProps {
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  delay?: number;
  className?: string;
}

export default function Stamp({
  size = "md",
  animated = false,
  delay = 0,
  className = "",
}: StampProps) {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-base",
    lg: "text-xl",
  };

  const delayStyle = delay > 0 ? { animationDelay: `${delay}ms` } : {};

  return (
    <span
      className={`inline-block ${sizeClasses[size]} ${animated ? "stamp-bounce" : ""} ${className}`}
      style={delayStyle}
      role="img"
      aria-label="paw print"
    >
      🐾
    </span>
  );
}

