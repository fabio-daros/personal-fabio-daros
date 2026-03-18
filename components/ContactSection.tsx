"use client";

import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

export default function ContactSection() {
  const { locale } = useLanguage();
  const t = translations[locale].contact;

  return (
    <section id="contact" className="contact section">
      <div className="container section-title" data-aos="fade-up">
        <h2>{t.title}</h2>
        <div><span className="description-title">{t.getInTouch}</span></div>
      </div>
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row gy-4">
          <div className="col-md-6">
            <div className="info-item d-flex align-items-center" data-aos="fade-up" data-aos-delay="200">
              <i className="icon bi bi-geo-alt flex-shrink-0"></i>
              <div>
                <h3>{t.location}</h3>
                <p>Florianópolis, SC, Brazil</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="info-item d-flex align-items-center" data-aos="fade-up" data-aos-delay="300">
              <i className="icon bi bi-telephone flex-shrink-0"></i>
              <div>
                <h3>{t.callMe}</h3>
                <p>+353 83 467 7853</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="info-item d-flex align-items-center" data-aos="fade-up" data-aos-delay="400">
              <i className="icon bi bi-envelope flex-shrink-0"></i>
              <div>
                <h3>{t.emailMe}</h3>
                <p>{t.contactEmail}</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="info-item d-flex align-items-center" data-aos="fade-up" data-aos-delay="500">
              <i className="icon bi bi-share flex-shrink-0"></i>
              <div>
                <h3>{t.socialProfiles}</h3>
                <div className="social-links">
                  <a href="https://github.com/fabio-daros" target="_blank" rel="noopener noreferrer"><i className="bi bi-github"></i></a>
                  <a href="https://www.facebook.com/fabio.daros.7/" target="_blank" rel="noopener noreferrer"><i className="bi bi-facebook"></i></a>
                  <a href="https://www.instagram.com/fabio__daros/" target="_blank" rel="noopener noreferrer"><i className="bi bi-instagram"></i></a>
                  <a href="https://wa.me/353834677853" target="_blank" rel="noopener noreferrer"><i className="bi bi-whatsapp"></i></a>
                  <a href="https://www.linkedin.com/in/daros-fabio" target="_blank" rel="noopener noreferrer"><i className="bi bi-linkedin"></i></a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form action="/api/contact" method="post" className="php-email-form" data-aos="fade-up" data-aos-delay="600">
          <input type="hidden" name="locale" value={locale} />
          <div className="row gy-4">
            <div className="col-md-6">
              <input type="text" name="name" className="form-control" placeholder={t.yourName} required />
            </div>
            <div className="col-md-6">
              <input type="email" className="form-control" name="email" placeholder={t.yourEmail} required />
            </div>
            <div className="col-md-12">
              <input type="text" className="form-control" name="subject" placeholder={t.subject} required />
            </div>
            <div className="col-md-12">
              <textarea className="form-control" name="message" rows={6} placeholder={t.message} required></textarea>
            </div>
            <div className="col-md-12 text-center">
              <div className="loading">{t.loading}</div>
              <div className="error-message"></div>
              <div className="sent-message">{t.sentMessage}</div>
              <button type="submit">{t.sendMessage}</button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
