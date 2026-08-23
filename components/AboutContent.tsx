"use client";

import Image from "next/image";
import Link from "next/link";
import PageTitle from "@/components/PageTitle";
import ProfileLinks from "@/components/ProfileLinks";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { scrollToSection } from "@/lib/nav";
import { DiAws } from "react-icons/di";
import { FaBrain } from "react-icons/fa";
import {
  SiDjango,
  SiDocker,
  SiGit,
  SiHtml5,
  SiJavascript,
  SiJupyter,
  SiLinux,
  SiNextdotjs,
  SiNumpy,
  SiPandas,
  SiPostgresql,
  SiPython,
  SiPytorch,
  SiR,
  SiTensorflow,
} from "react-icons/si";

const SKILLS = [
  { name: "R", Icon: SiR },
  { name: "Python", Icon: SiPython },
  { name: "JavaScript", Icon: SiJavascript },
  { name: "HTML5", Icon: SiHtml5 },
  { name: "Next.js", Icon: SiNextdotjs },
  { name: "Django", Icon: SiDjango },
  { name: "SQL", Icon: SiPostgresql },
  { name: "Machine Learning", Icon: SiTensorflow },
  { name: "Deep Learning", Icon: FaBrain },
  { name: "PyTorch", Icon: SiPytorch },
  { name: "Data Analysis", Icon: SiPandas },
  { name: "Scientific Computing", Icon: SiNumpy },
  { name: "Jupyter Notebook", Icon: SiJupyter },
  { name: "Git", Icon: SiGit },
  { name: "Docker", Icon: SiDocker },
  { name: "AWS", Icon: DiAws },
  { name: "Linux", Icon: SiLinux },
] as const;

export default function AboutContent() {
  const { locale } = useLanguage();
  const t = translations[locale].about;
  const researchCta = translations[locale].home.researchCta;

  return (
    <div id="about" className="site-section">
      <PageTitle
        title={t.title}
        description={t.pageDescription}
      />

      <section className="about section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4 justify-content-center">
            <div className="col-lg-4">
              <div className="about-profile__frame">
                <Image
                  src="/assets/img/profile-img.png"
                  className="img-fluid about-profile__photo"
                  alt="Fabio Daros"
                  width={819}
                  height={1024}
                  sizes="(max-width: 991px) 320px, 320px"
                  unoptimized
                />
              </div>
              <ProfileLinks />
              <div className="about-research-cta">
                <Link
                  href="/#research"
                  className="home-research-cta__btn"
                  aria-label={researchCta}
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToSection("research");
                  }}
                >
                  <span>{researchCta}</span>
                  <i className="bi bi-arrow-right" aria-hidden="true" />
                </Link>
              </div>
            </div>
            <div className="col-lg-8 content">
              <h2>{t.heading}</h2>
              <p className="fst-italic py-3">{t.bio1}</p>
              <div className="row">
                <div className="col-lg-6">
                  <ul>
                    <li><i className="bi bi-chevron-right"></i> <b>{t.whatsapp}:{'\u00A0'}</b><span>+353 83 467 7853</span></li>
                    <li>
                      <i className="bi bi-chevron-right"></i>{" "}
                      <b>{t.city}:{'\u00A0'}</b>
                      <span>
                        <span className="resume-flag" aria-hidden>
                          {t.cityFlag}
                        </span>
                        {t.cityValue}
                      </span>
                    </li>
                    <li><i className="bi bi-chevron-right"></i> <b>{t.citizenship}:{'\u00A0'}</b><span>{t.citizenshipValue}</span></li>
                  </ul>
                </div>
                <div className="col-lg-6">
                  <ul>
                    <li><i className="bi bi-chevron-right"></i> <b>{t.degree}:{'\u00A0'}</b><span>{t.degreeValue}</span></li>
                    <li><i className="bi bi-chevron-right"></i> <b>{t.focus}:{'\u00A0'}</b><span>{t.focusValue}</span></li>
                    <li><i className="bi bi-chevron-right"></i> <b>{t.openTo}:{'\u00A0'}</b><span>{t.openToValue}</span></li>
                  </ul>
                </div>
              </div>
              <p className="py-3">{t.bio2}</p>
              {t.bio3 && <p className="py-3">{t.bio3}</p>}
              {t.bio4 && <p className="py-3">{t.bio4}</p>}
            </div>
          </div>
        </div>
      </section>

      <section id="skills" className="skills section">
        <div className="container section-title" data-aos="fade-up">
          <h2>{t.skillsTitle}</h2>
          <div><span>{t.skillsSubtitleMy}</span> <span className="description-title">{t.skillsSubtitleWord}</span></div>
        </div>
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row skills-content">
            <div className="col-12">
              <ul className="skills-list list-unstyled d-flex flex-wrap gap-2">
                {SKILLS.map(({ name, Icon }) => (
                  <li key={name} className="skill-tag">
                    <Icon className="skill-icon me-2" size={22} />
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
