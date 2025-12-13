"use client";

import React from "react";

interface TimerDisplayProps {
  time: string; // HH:MM:SS format
  className?: string;
}

export default function TimerDisplay({ time, className = "" }: TimerDisplayProps) {
  return (
    <div
      className={`text-5xl sm:text-6xl font-bold text-gray-900 tracking-widest ${className}`}
    >
      {time}
    </div>
  );
}


