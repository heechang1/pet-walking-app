import React from "react";

interface SummaryItem {
  label: string;
  value: string;
}

interface SummaryCardProps {
  items: SummaryItem[];
  className?: string;
}

export default function SummaryCard({
  items,
  className = "",
}: SummaryCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-300 border border-[#FBD3D3]/60 p-6 sm:p-8 text-left space-y-4 ${className}`}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className="flex justify-between items-center text-sm border-b border-gray-100 last:border-0 pb-3 last:pb-0 hover:bg-gray-50/50 -mx-2 px-2 rounded transition-colors"
        >
          <span className="text-gray-600">{item.label}</span>
          <span className="font-semibold text-gray-900 text-base">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

