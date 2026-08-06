"use client";

import { Info } from "lucide-react";
import React, { useState } from "react";

export default function InfoTooltip({ text }) {
  const [show, setShow] = useState(false);

  if (!text) return null;

  return (
    <div 
      className="relative inline-flex items-center ml-1.5 cursor-help align-middle"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      <Info size={14} className="text-on-surface-variant hover:text-primary-container transition-colors" />
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2.5 bg-surface-container-highest border border-primary-container/40 text-on-surface text-xs rounded-md shadow-2xl z-50 pointer-events-none whitespace-pre-wrap animate-scale-in">
          {text}
          {/* Triangle arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-primary-container/40"></div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[2px] border-4 border-transparent border-t-surface-container-highest"></div>
        </div>
      )}
    </div>
  );
}
