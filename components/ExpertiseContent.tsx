"use client";

import PageTitle from "@/components/PageTitle";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

const expertiseIcons = [
  "bi bi-activity",
  "bi bi-broadcast",
  "bi bi-easel",
  "bi bi-bounding-box-circles",
  "bi bi-calendar4-week",
  "bi bi-chat-square-text",
];

export default function ExpertiseContent() {
  const { locale } = useLanguage();
  const t = translations[locale].expertise;

  return (
    <main className="main">
      <PageTitle
        title={t.title}
        description={t.pageDescription}
        breadcrumbs={[{ label: t.breadcrumbHome, href: "/" }, { label: t.breadcrumbExpertise }]}
      />

      <section id="expertise" className="services section">
        <div className="container">
          <div className="row gy-4">
            {t.items.map((item, i) => (
              <div key={i} className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={100 + i * 100}>
                <div className="service-item position-relative">
                  <div className="icon">
                    <i className={expertiseIcons[i]}></i>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
