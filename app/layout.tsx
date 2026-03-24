import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { ViewTransitions } from "next-view-transitions";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClientScripts from "@/components/ClientScripts";
import Providers from "@/components/Providers";
import SwipeNavigation from "@/components/SwipeNavigation";
import SwipeDragWrapper from "@/components/SwipeDragWrapper";
import GetInTouchButton from "@/components/GetInTouchButton";
import LegacyBrowserNotice from "@/components/LegacyBrowserNotice";

export const metadata: Metadata = {
  title: "Fabio Daros | Software Engineer • Biotechnology & AI",
  description: "Fabio Daros is a software engineer transitioning into biotechnology and biomedical AI, focusing on data analysis, cancer research and health technology.",
  icons: {
    icon: "/assets/img/favicon_v2.png",
    apple: "/assets/img/apple-touch-icon_v2.png",
  },
  verification: {
    google: "HX3rX0v_c7uj975CdpCE_7bxRQAb4dJ9WmcbCtXmOvo",
  },
  openGraph: {
    title: "Fabio Daros | Software Engineer • Biotechnology & AI",
    description: "Software engineer transitioning into biotechnology and biomedical AI. Focused on health technology, data analysis and cancer research.",
    url: "https://fabiodaros.com",
    type: "website",
    images: ["https://fabiodaros.com/assets/img/profile-img.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Fabio Daros",
              url: "https://fabiodaros.com",
              image: "https://fabiodaros.com/assets/img/profile-img.jpg",
              jobTitle: "Software Engineer",
              description: "Software engineer transitioning into biotechnology and biomedical AI, focused on data analysis, cancer research and health technology.",
              sameAs: [
                "https://github.com/fabio-daros",
                "https://www.linkedin.com/in/daros-fabio",
              ],
            }),
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Raleway:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
        <link href="/assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
        <link href="/assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet" />
        <link href="/assets/vendor/aos/aos.css" rel="stylesheet" />
        <link href="/assets/vendor/swiper/swiper-bundle.min.css" rel="stylesheet" />
        <link href="/assets/vendor/glightbox/css/glightbox.min.css" rel="stylesheet" />
        <link href="/assets/css/main.css" rel="stylesheet" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/img/apple-touch-icon_v2.png" />
        <style id="vt-dir-styles" suppressHydrationWarning />
      </head>
      <body suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){window.__legacyLoadId=Date.now();var ua=navigator.userAgent||"";var legacy=!1;if(/MSIE|Trident/i.test(ua))legacy=!0;else if(/iPad|iPhone|iPod/.test(ua)){var m=ua.match(/OS (\\d+)[_.]?(\\d+)?/);legacy=m?parseInt(m[1],10)<16:!0}else if(/Safari/.test(ua)&&!/Chrome|Chromium|CriOS/.test(ua)){var v=ua.match(/Version\\/(\\d+)[.\\d]*/);legacy=!!(v&&parseInt(v[1],10)<16)}else if(typeof IntersectionObserver==="undefined"||typeof Promise==="undefined")legacy=!0;if(legacy){try{if(sessionStorage.getItem("lb-dismiss")===String(window.__legacyLoadId))return}catch(e){}var dismiss=function(){var el=document.getElementById("legacy-browser-root");if(el)el.style.display="none";try{sessionStorage.setItem("lb-dismiss",String(window.__legacyLoadId))}catch(e){}};var lang=(navigator.language||"").toLowerCase().indexOf("pt")===0?"pt":"en";var t=lang==="pt"?{title:"Navegador desatualizado",msg:"Seu navegador ou dispositivo parece ser antigo. Algumas funcionalidades podem não funcionar corretamente.",btn:"Entendi"}:{title:"Outdated Browser",msg:"Your browser or device appears to be outdated. Some features may not work correctly.",btn:"Understood"};var s=document.createElement("style");s.textContent="#legacy-browser-root{position:fixed;top:0;right:0;bottom:0;left:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;pointer-events:none}#legacy-browser-root .lb-backdrop{position:absolute;top:0;right:0;bottom:0;left:0;background:rgba(0,0,0,0.5);pointer-events:auto;cursor:pointer}#legacy-browser-root .lb-modal{position:relative;max-width:420px;width:100%;padding:24px;text-align:center;color:#fff;background:rgba(0,0,0,0.92);border-radius:8px;box-shadow:0 4px 24px rgba(0,0,0,0.5);pointer-events:auto}#legacy-browser-root .lb-icon{font-size:48px;color:#ffc107;margin-bottom:12px;line-height:1}#legacy-browser-root .lb-title{font-size:20px;font-weight:600;margin:0 0 8px}#legacy-browser-root .lb-msg{font-size:16px;line-height:1.5;margin:0 0 20px;opacity:0.95}#legacy-browser-root .lb-btn{display:inline-block;padding:10px 24px;font-size:16px;font-weight:500;color:#000;background:#ffc107;border:none;border-radius:4px;cursor:pointer}";document.head.appendChild(s);var r=document.createElement("div");r.id="legacy-browser-root";r.innerHTML='<div class="lb-backdrop"></div><div class="lb-modal"><div class="lb-icon">⚠</div><h2 class="lb-title">'+t.title+'</h2><p class="lb-msg">'+t.msg+'</p><button type="button" class="lb-btn">'+t.btn+'</button></div>';r.querySelector(".lb-backdrop").onclick=r.querySelector(".lb-btn").onclick=function(){var el=document.getElementById("legacy-browser-root");if(el)el.style.display="none";try{sessionStorage.setItem("lb-dismiss",String(window.__legacyLoadId))}catch(e){}};document.body.appendChild(r)}})();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              setTimeout(function(){var e=document.querySelector('[data-aos]');if(e&&!e.classList.contains('aos-animate'))document.body.classList.add('aos-fallback');},2000);
              setTimeout(function(){document.body.classList.add('preloader-released');},1500);
            })();`,
          }}
        />
        <Providers>
          <LegacyBrowserNotice />
          <SwipeDragWrapper>
            <Header />
            {children}
            <Footer />
          </SwipeDragWrapper>
          <GetInTouchButton />
        </Providers>
        <a href="#" id="scroll-top" className="scroll-top d-flex align-items-center justify-content-center">
          <i className="bi bi-arrow-up-short"></i>
        </a>
        <div id="preloader"></div>
        <ClientScripts />
        <SwipeNavigation />
        {process.env.NODE_ENV === "production" && <Analytics mode="production" />}
      </body>
    </html>
    </ViewTransitions>
  );
}
