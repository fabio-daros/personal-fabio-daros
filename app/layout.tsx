import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClientScripts from "@/components/ClientScripts";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Fabio Daros | Software Engineer • Biotechnology & AI",
  description: "Fabio Daros is a software engineer transitioning into biotechnology and biomedical AI, focusing on data analysis, cancer research and health technology.",
  icons: {
    icon: "/assets/img/favicon.png",
    apple: "/assets/img/apple-touch-icon.png",
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
    <html lang="en">
      <head>
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
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/img/apple-touch-icon.png" />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              setTimeout(function(){var e=document.querySelector('[data-aos]');if(e&&!e.classList.contains('aos-animate'))document.body.classList.add('aos-fallback');},2000);
              setTimeout(function(){document.body.classList.add('preloader-released');var p=document.getElementById('preloader');if(p)p.style.pointerEvents='none';},1500);
            })();`,
          }}
        />
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
        <a href="#" id="scroll-top" className="scroll-top d-flex align-items-center justify-content-center">
          <i className="bi bi-arrow-up-short"></i>
        </a>
        <div id="preloader"></div>
        <ClientScripts />
      </body>
    </html>
  );
}
