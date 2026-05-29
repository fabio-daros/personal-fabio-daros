"use client";

import { useEffect, useRef, useState } from "react";
import PageTitle from "@/components/PageTitle";
import { ResearchProjectCard, ResearchProjectPanel } from "@/components/ResearchAccordion";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

const ONCOPIXEL_IMAGES = [
  {
    src: "/assets/img/research/oncopixel/summary-results.png",
    altPt: "OncoPixel — tela de resultados resumidos com detecções em imagem de citologia",
    altEn: "OncoPixel — summary results screen with cytology image detections",
  },
  {
    src: "/assets/img/research/oncopixel/oncobrain-api.png",
    altPt: "OncoBrain — página da API com documentação Swagger",
    altEn: "OncoBrain — API landing page with Swagger documentation",
  },
  {
    src: "/assets/img/research/oncopixel/training-loss-kfold.png",
    altPt: "Gráfico de perda de treinamento — produção vs. validação cruzada K-Fold",
    altEn: "Training loss chart — production vs. K-Fold cross-validation",
  },
  {
    src: "/assets/img/research/oncopixel/training-accuracy-kfold.png",
    altPt: "Gráfico de acurácia de treinamento — produção vs. validação cruzada K-Fold",
    altEn: "Training accuracy chart — production vs. K-Fold cross-validation",
  },
  {
    src: "/assets/img/research/oncopixel/training-metrics.png",
    altPt: "Métricas de treinamento — perda e acurácia em treino e hold-out",
    altEn: "Training metrics — train and hold-out loss and accuracy",
  },
] as const;

type ResearchProjectId = "oncopixel" | "inpunto";

export default function ResearchContent() {
  const [openId, setOpenId] = useState<ResearchProjectId | null>(null);
  const panelAnchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { locale } = useLanguage();
  const t = translations[locale].research;
  const r = translations[locale].resume;

  const closePanel = () => setOpenId(null);

  useEffect(() => {
    const aos = (window as Window & { AOS?: { refresh: () => void } }).AOS;
    aos?.refresh();
  }, []);

  useEffect(() => {
    if (!openId || !panelAnchorRef.current) return;
    panelAnchorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [openId]);

  useEffect(() => {
    if (!openId) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panelRef.current?.contains(target)) return;
      setOpenId(null);
    };

    const timer = window.setTimeout(() => {
      document.addEventListener("mousedown", onPointerDown);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [openId]);

  return (
    <main className="main">
      <PageTitle
        title={t.title}
        description={t.pageDescription}
        breadcrumbs={[{ label: t.breadcrumbHome, href: "/" }, { label: t.breadcrumbResearch }]}
      />

      <section id="research" className={`research section${openId ? " is-panel-open" : ""}`}>
        <div className="container">
          <div className="row">
            <div className="col-lg-10 mx-auto" data-aos="fade-up" data-aos-delay="100">
              <div ref={panelAnchorRef} className="research-accordions">
                {openId ? (
                  <ResearchProjectPanel
                    panelRef={panelRef}
                    onClose={closePanel}
                    title={openId === "oncopixel" ? r.research1Title : t.inpuntoTitle}
                    description={openId === "oncopixel" ? r.research1Desc : undefined}
                    closeLabel={t.closeProject}
                  >
                    {openId === "oncopixel" ? (
                      <div className="research-gallery research-gallery--modal">
                        {ONCOPIXEL_IMAGES.map((image, index) => (
                          <figure key={image.src} className="research-gallery__item">
                            <img
                              src={image.src}
                              alt={locale === "pt" ? image.altPt : image.altEn}
                              className="img-fluid research-gallery__img"
                              loading={index === 0 ? "eager" : "lazy"}
                            />
                          </figure>
                        ))}
                      </div>
                    ) : (
                      <p className="research-accordion__placeholder research-accordion__placeholder--modal">
                        {t.comingSoon}
                      </p>
                    )}
                  </ResearchProjectPanel>
                ) : (
                  <div className="research-accordions__cards">
                    <ResearchProjectCard
                      title={r.research1Title}
                      description={r.research1Desc}
                      onOpen={() => setOpenId("oncopixel")}
                      expandLabel={t.expandProject}
                    />

                    <ResearchProjectCard
                      title={t.inpuntoTitle}
                      onOpen={() => setOpenId("inpunto")}
                      expandLabel={t.expandProject}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
