"use client";

import { useEffect } from "react";

export default function AdSenseUnit({
  slot = "1234567890",
  format = "auto",
  responsive = "true",
  style = { display: "block" }
}) {
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error("AdSense Error:", e);
    }
  }, []);

  return (
    <div className="my-6 text-center overflow-hidden">
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-1315540294941790"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
