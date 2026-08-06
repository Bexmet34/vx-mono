"use client";

import { Info } from "lucide-react";
import React, { useState } from "react";

export default function InfoTooltip({ text }) {
  const [show, setShow] = useState(false);

  if (!text) return null;

  return (
    <span 
      className="relative inline-flex items-center ml-1.5 cursor-pointer normal-case select-none align-middle"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <Info 
        size={14} 
        className="text-on-surface-variant hover:text-primary-container transition-colors shrink-0" 
        onMouseEnter={(e) => {
          e.stopPropagation();
          setShow(true);
        }}
        onMouseLeave={(e) => {
          e.stopPropagation();
          setShow(false);
        }}
      />
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2.5 bg-[#0e1726] border border-primary-container/40 text-on-surface text-xs rounded-md shadow-2xl z-[9999] pointer-events-none whitespace-pre-wrap normal-case tracking-normal font-normal leading-normal">
          {text}
          {/* Triangle arrow */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-primary-container/40"></span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-[2px] border-4 border-transparent border-t-[#0e1726]"></span>
        </span>
      )}
    </span>
  );
}
