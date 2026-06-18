"use client";

import Script from "next/script";

export default function ClientScripts() {
  return (
    <>
      <Script
        src="/assets/vendor/aos/aos.js"
        strategy="afterInteractive"
      />
      <Script
        src="/assets/js/main.js"
        strategy="afterInteractive"
      />
    </>
  );
}
