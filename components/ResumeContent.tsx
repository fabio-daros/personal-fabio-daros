"use client";

import PageTitle from "@/components/PageTitle";
import ResumeCvDownloadButton from "@/components/ResumeCvDownloadButton";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

function ResearchAdvisor({
  name,
  linkedinUrl,
  linkedinLabel,
}: {
  name: string;
  linkedinUrl?: string;
  linkedinLabel?: string;
}) {
  return (
    <p className="resume-advisor">
      <em>{name}</em>
      {linkedinUrl ? (
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="resume-link resume-advisor__link"
          aria-label={linkedinLabel ?? "LinkedIn"}
        >
          <i className="bi bi-linkedin" aria-hidden="true" />
        </a>
      ) : null}
    </p>
  );
}

export default function ResumeContent() {
  const { locale } = useLanguage();
  const t = translations[locale].resume;

  return (
    <div id="resume" className="site-section">
      <PageTitle
        title={t.title}
        description={t.pageDescription}
        action={<ResumeCvDownloadButton />}
      />

      <section className="resume section">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 order-2 order-lg-2" data-aos="fade-up" data-aos-delay="100">
              <h3 className="resume-title">{t.education}</h3>
              <div className="resume-item">
                <h4><span className="resume-flag" aria-hidden>{t.edu1Flag}</span> {t.edu1Title}</h4>
                <h5>{t.edu1Period}</h5>
                <p><em>{t.edu1Location}</em></p>
              </div>
              <div className="resume-item">
                <h4><span className="resume-flag" aria-hidden>{t.edu2Flag}</span> {t.edu2Title}</h4>
                <h5>{t.edu2Period}</h5>
                <p><em>{t.edu2Location}</em></p>
              </div>
              <div className="resume-item">
                <h4><span className="resume-flag" aria-hidden>{t.edu3Flag}</span> {t.edu3Title}</h4>
                <h5>{t.edu3Period}</h5>
                <p><em>{t.edu3Location}</em></p>
              </div>

              <h3 className="resume-title">{t.researchExperience}</h3>
              <div className="resume-item">
                <h4><span className="resume-flag" aria-hidden>{t.researchMsFlag}</span> {t.researchMsTitle}</h4>
                <p><em>{t.researchMsLocation}</em></p>
                <h5>{t.researchMsPeriod}</h5>
                <p><em>{t.researchMsRole}</em></p>
                <ResearchAdvisor
                  name={t.researchMsAdvisor}
                  linkedinUrl="https://www.linkedin.com/in/eegkozlova0587/"
                  linkedinLabel="Edgar Gonzalez-Kozlova LinkedIn"
                />
                <div className="resume-research-links">
                  <span className="resume-research-links-label">{t.research1LabLabel}</span>
                  <a href="https://eegk.github.io/" target="_blank" rel="noopener noreferrer" className="resume-link" aria-label="Gonzalez-Kozlova Lab website">
                    <i className="bi bi-globe" />
                  </a>
                  <a href="https://www.linkedin.com/school/icahnmountsinai/" target="_blank" rel="noopener noreferrer" className="resume-link" aria-label="Icahn School of Medicine at Mount Sinai LinkedIn">
                    <i className="bi bi-linkedin" />
                  </a>
                </div>
                <ul>
                  <li>{t.researchMsLi1}</li>
                  <li>{t.researchMsLi2}</li>
                </ul>
              </div>
              <div className="resume-item">
                <h4><span className="resume-flag" aria-hidden>{t.research1Flag}</span> {t.research1Title}</h4>
                <p><em>{t.research1Location}</em></p>
                <h5>{t.research1Period}</h5>
                <p><em>{t.research1Role}</em></p>
                <ResearchAdvisor
                  name={t.research1Advisor}
                  linkedinUrl="https://www.linkedin.com/in/edroaldo-lummertz-da-rocha-6b976033/"
                  linkedinLabel="Edroaldo Lummertz da Rocha LinkedIn"
                />
                <div className="resume-research-links">
                  <span className="resume-research-links-label">{t.research1LabLabel}</span>
                  <a href="https://www.lummertzdarocha-lab.org/" target="_blank" rel="noopener noreferrer" className="resume-link" aria-label="Lummertz da Rocha Lab website">
                    <i className="bi bi-globe" />
                  </a>
                  <a href="https://www.linkedin.com/company/lummertz-da-rocha-lab/" target="_blank" rel="noopener noreferrer" className="resume-link" aria-label="Lummertz da Rocha Lab LinkedIn">
                    <i className="bi bi-linkedin" />
                  </a>
                </div>
                <ul>
                  <li>{t.research1Desc}</li>
                </ul>
              </div>
              <div className="resume-item">
                <h4><span className="resume-flag" aria-hidden>{t.research2Flag}</span> {t.research2Title}</h4>
                <p><em>{t.research2Location}</em></p>
                <h5>{t.research2Period}</h5>
                <p><em>{t.research2Role}</em></p>
                <ResearchAdvisor name={t.research2Advisor} />
              </div>
              <div className="resume-item">
                <h4><span className="resume-flag" aria-hidden>{t.research3Flag}</span> {t.research3Title}</h4>
                <p><em>{t.research3Location}</em></p>
                <h5>{t.research3Period}</h5>
                <p><em>{t.research3Role}</em></p>
                <ResearchAdvisor name={t.research3Advisor} />
              </div>

              <h3 className="resume-title">{t.communityService}</h3>
              <div className="resume-item">
                <h4><span className="resume-flag" aria-hidden>{t.comm1Flag}</span> {t.comm1Title}</h4>
                <h5>{t.comm1Period}</h5>
                <p><em>{t.comm1Location}</em></p>
              </div>
            </div>

            <div className="col-lg-6 order-1 order-lg-1" data-aos="fade-up" data-aos-delay="200">
              <h3 className="resume-title">{t.professionalExperience}</h3>
              <div className="resume-item">
                <h4><span className="resume-flag" aria-hidden>{t.prof1Flag}</span> {t.prof1Title}</h4>
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
                <h4><span className="resume-flag" aria-hidden>{t.prof2Flag}</span> {t.prof2Title}</h4>
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
                <h4><span className="resume-flag" aria-hidden>{t.prof3Flag}</span> {t.prof3Title}</h4>
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
                <h4><span className="resume-flag" aria-hidden>{t.prof4Flag}</span> {t.prof4Title}</h4>
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
                <h4><span className="resume-flag" aria-hidden>{t.prof5Flag}</span> {t.prof5Title}</h4>
                <h5>{t.prof5Period}</h5>
                <p><em>{t.prof5Company}</em></p>
                <ul>
                  <li>{t.prof5Li1}</li>
                  <li>{t.prof5Li2}</li>
                </ul>
              </div>
              <div className="resume-item">
                <h4><span className="resume-flag" aria-hidden>{t.prof6Flag}</span> {t.prof6Title}</h4>
                <h5>{t.prof6Period}</h5>
                <p><em>{t.prof6Company}</em></p>
                <ul>
                  <li>{t.prof6Li1}</li>
                  <li>{t.prof6Li2}</li>
                </ul>
              </div>

              <h3 className="resume-title">{t.earlyCareer}</h3>
              <div className="resume-item">
                <h4><span className="resume-flag" aria-hidden>{t.early1Flag}</span> {t.early1Title}</h4>
                <h5>{t.early1Period}</h5>
                <p><em>{t.early1Company}</em></p>
              </div>
              <div className="resume-item">
                <h4><span className="resume-flag" aria-hidden>{t.early2Flag}</span> {t.early2Title}</h4>
                <h5>{t.early2Period}</h5>
                <p><em>{t.early2Company}</em></p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
