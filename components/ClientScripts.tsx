"use client";

import Script from "next/script";

export default function ClientScripts() {
  return (
    <>
      <Script
        src="/assets/vendor/bootstrap/js/bootstrap.bundle.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="/assets/vendor/php-email-form/validate.js"
        strategy="afterInteractive"
      />
      <Script
        src="/assets/vendor/aos/aos.js"
        strategy="afterInteractive"
      />
      <Script
        src="/assets/vendor/typed.js/typed.umd.js"
        strategy="afterInteractive"
      />
      <Script
        src="/assets/vendor/purecounter/purecounter_vanilla.js"
        strategy="afterInteractive"
      />
      <Script
        src="/assets/vendor/waypoints/noframework.waypoints.js"
        strategy="afterInteractive"
      />
      <Script
        src="/assets/vendor/swiper/swiper-bundle.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="/assets/vendor/glightbox/js/glightbox.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="/assets/vendor/imagesloaded/imagesloaded.pkgd.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="/assets/vendor/isotope-layout/isotope.pkgd.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="/assets/js/main.js"
        strategy="afterInteractive"
      />
    </>
  );
}
