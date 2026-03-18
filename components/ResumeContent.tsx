"use client";

import PageTitle from "@/components/PageTitle";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

export default function ResumeContent() {
  const { locale } = useLanguage();
  const t = translations[locale].resume;

  return (
    <main className="main">
      <PageTitle
        title={t.title}
        description={t.pageDescription}
        breadcrumbs={[{ label: t.breadcrumbHome, href: "/" }, { label: t.breadcrumbResume }]}
      />

      <section id="resume" className="resume section">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 order-lg-2" data-aos="fade-up" data-aos-delay="100">
              <h3 className="resume-title">{t.education}</h3>
              <div className="resume-item">
                <h4>{t.edu1Title}</h4>
                <h5>{t.edu1Period}</h5>
                <p><em>{t.edu1Location}</em></p>
              </div>
              <div className="resume-item">
                <h4>{t.edu2Title}</h4>
                <h5>{t.edu2Period}</h5>
                <p><em>{t.edu2Location}</em></p>
              </div>
              <div className="resume-item">
                <h4>{t.edu3Title}</h4>
                <h5>{t.edu3Period}</h5>
                <p><em>{t.edu3Location}</em></p>
              </div>

              <h3 className="resume-title">{t.researchExperience}</h3>
              <div className="resume-item">
                <h4>{t.research1Title}</h4>
                <h5>{t.research1Period}</h5>
                <p><em>{t.research1Advisor}</em></p>
                <p><em>{t.research1Location}</em></p>
                <p>{t.research1Desc}</p>
              </div>
              <div className="resume-item">
                <h4>{t.research2Title}</h4>
                <h5>{t.research2Period}</h5>
                <p><em>{t.research2Advisor}</em></p>
                <p><em>{t.research2Location}</em></p>
              </div>
              <div className="resume-item">
                <h4>{t.research3Title}</h4>
                <h5>{t.research3Period}</h5>
                <p><em>{t.research3Advisor}</em></p>
                <p><em>{t.research3Location}</em></p>
              </div>

              <h3 className="resume-title">{t.communityService}</h3>
              <div className="resume-item">
                <h4>{t.comm1Title}</h4>
                <h5>{t.comm1Period}</h5>
                <p><em>{t.comm1Location}</em></p>
              </div>
            </div>

            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="200">
              <h3 className="resume-title">{t.professionalExperience}</h3>
              <div className="resume-item">
                <h4>{t.prof1Title}</h4>
                <h5>{t.prof1Period}</h5>
                <p><em>{t.prof1Company}</em></p>
                <ul>
                  <li>{t.prof1Li1}</li>
                  <li>{t.prof1Li2}</li>
                  <li>{t.prof1Li3}</li>
                  <li>{t.prof1Li4}</li>
                  <li>{t.prof1Li5}</li>
                </ul>
              </div>
              <div className="resume-item">
                <h4>{t.prof2Title}</h4>
                <h5>{t.prof2Period}</h5>
                <p><em>{t.prof2Company}</em></p>
                <ul>
                  <li>{t.prof2Li1}</li>
                  <li>{t.prof2Li2}</li>
                  <li>{t.prof2Li3}</li>
                  <li>{t.prof2Li4}</li>
                </ul>
              </div>
              <div className="resume-item">
                <h4>{t.prof3Title}</h4>
                <h5>{t.prof3Period}</h5>
                <p><em>{t.prof3Company}</em></p>
                <ul>
                  <li>{t.prof3Li1}</li>
                  <li>{t.prof3Li2}</li>
                  <li>{t.prof3Li3}</li>
                  <li>{t.prof3Li4}</li>
                </ul>
              </div>
              <div className="resume-item">
                <h4>{t.prof4Title}</h4>
                <h5>{t.prof4Period}</h5>
                <p><em>{t.prof4Company}</em></p>
                <ul>
                  <li>{t.prof4Li1}</li>
                  <li>{t.prof4Li2}</li>
                  <li>{t.prof4Li3}</li>
                  <li>{t.prof4Li4}</li>
                </ul>
              </div>
              <div className="resume-item">
                <h4>{t.prof5Title}</h4>
                <h5>{t.prof5Period}</h5>
                <p><em>{t.prof5Company}</em></p>
                <ul>
                  <li>{t.prof5Li1}</li>
                  <li>{t.prof5Li2}</li>
                </ul>
              </div>
              <div className="resume-item">
                <h4>{t.prof6Title}</h4>
                <h5>{t.prof6Period}</h5>
                <p><em>{t.prof6Company}</em></p>
                <ul>
                  <li>{t.prof6Li1}</li>
                  <li>{t.prof6Li2}</li>
                </ul>
              </div>

              <h3 className="resume-title">{t.earlyCareer}</h3>
              <div className="resume-item">
                <h4>{t.early1Title}</h4>
                <h5>{t.early1Period}</h5>
                <p><em>{t.early1Company}</em></p>
              </div>
              <div className="resume-item">
                <h4>{t.early2Title}</h4>
                <h5>{t.early2Period}</h5>
                <p><em>{t.early2Company}</em></p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
