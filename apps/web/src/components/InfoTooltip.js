import { Info } from "lucide-react";
import React from "react";

export default function InfoTooltip({ text }) {
  if (!text) return null;

  return (
    <div className="group relative inline-flex items-center ml-2 cursor-help align-middle">
      <Info size={14} className="text-on-surface-variant hover:text-primary-container transition-colors" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-3 bg-surface-container-highest border border-outline-variant text-on-surface text-xs rounded-md shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none whitespace-pre-wrap">
        {text}
        {/* Triangle arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-outline-variant"></div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[2px] border-4 border-transparent border-t-surface-container-highest"></div>
      </div>
    </div>
  );
}
