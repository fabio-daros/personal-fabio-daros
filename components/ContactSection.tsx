"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { SiOrcid } from "react-icons/si";
import TurnstileWidget, {
  isTurnstileConfigured,
  type TurnstileFailure,
  type TurnstileStatus,
} from "@/components/TurnstileWidget";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

type ConfettiPiece = {
  id: string;
  color: string;
  size: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  rotate: number;
  delay: number;
  duration: number;
};

type CaptchaChallenge = {
  question: string;
  token: string;
};

type CaptchaMode = "turnstile" | "math";

const CONFETTI_COLORS = ["#ef4444", "#2563eb", "#facc15", "#18d26e", "#0d9e4e", "#38bdf8"];

function createConfettiBurst(button: HTMLButtonElement, burstId: number): ConfettiPiece[] {
  const rect = button.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  return Array.from({ length: 30 }, (_, index) => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.15;
    const distance = 72 + Math.random() * 96;

    return {
      id: `${burstId}-${index}`,
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
      size: 5 + Math.random() * 5,
      x: originX,
      y: originY,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance + Math.random() * 30,
      rotate: (Math.random() - 0.5) * 720,
      delay: Math.random() * 0.08,
      duration: 0.78 + Math.random() * 0.34,
    };
  });
}

export default function ContactSection() {
  const { locale } = useLanguage();
  const t = translations[locale].contact;
  const turnstileAvailable = isTurnstileConfigured();

  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const [captchaMode, setCaptchaMode] = useState<CaptchaMode>(
    turnstileAvailable ? "turnstile" : "math"
  );
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [turnstileStatus, setTurnstileStatus] = useState<TurnstileStatus>(
    turnstileAvailable ? "loading" : "error"
  );
  const [turnstileFailure, setTurnstileFailure] = useState<TurnstileFailure | null>(null);
  const [showMathAlternative, setShowMathAlternative] = useState(!turnstileAvailable);

  const [captcha, setCaptcha] = useState<CaptchaChallenge | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const burstIdRef = useRef(0);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const loadMathCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    setCaptchaAnswer("");
    try {
      const response = await fetch("/api/contact/challenge", { cache: "no-store" });
      if (!response.ok) throw new Error("challenge failed");
      const data = (await response.json()) as CaptchaChallenge;
      if (!data.question || !data.token) throw new Error("invalid challenge");
      setCaptcha(data);
    } catch {
      setCaptcha(null);
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  const retryTurnstile = useCallback(() => {
    setCaptchaMode("turnstile");
    setShowMathAlternative(false);
    setTurnstileToken("");
    setTurnstileFailure(null);
    setTurnstileStatus("loading");
    setCaptchaAnswer("");
    setTurnstileReset((value) => value + 1);
  }, []);

  const useMathAlternative = useCallback(() => {
    setCaptchaMode("math");
    setShowMathAlternative(true);
    setTurnstileToken("");
  }, []);

  useEffect(() => {
    if (captchaMode === "math") {
      void loadMathCaptcha();
    }
  }, [captchaMode, loadMathCaptcha]);

  useEffect(() => {
    if (!turnstileAvailable) return;
    if (captchaMode !== "turnstile") return;
    if (turnstileStatus !== "error" || !turnstileFailure) return;

    const id = window.setTimeout(() => {
      setShowMathAlternative(true);
    }, 500);

    return () => window.clearTimeout(id);
  }, [turnstileAvailable, captchaMode, turnstileStatus, turnstileFailure]);

  const triggerConfetti = () => {
    if (!submitButtonRef.current) return;

    burstIdRef.current += 1;
    const burst = createConfettiBurst(submitButtonRef.current, burstIdRef.current);
    setConfetti(burst);
    window.setTimeout(() => setConfetti([]), 1400);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (captchaMode === "turnstile") {
      if (!turnstileToken) {
        setError(t.captchaRequired);
        return;
      }
    } else if (!captcha?.token || !captchaAnswer.trim()) {
      setError(t.captchaRequired);
      return;
    }

    setLoading(true);
    setSent(false);
    setError("");

    try {
      const body = new FormData(form);
      if (captchaMode === "turnstile") {
        body.set("cf-turnstile-response", turnstileToken);
        body.delete("captcha_token");
        body.delete("captcha_answer");
      } else {
        body.set("captcha_token", captcha!.token);
        body.set("captcha_answer", captchaAnswer.trim());
        body.delete("cf-turnstile-response");
      }

      const response = await fetch(form.action, {
        method: "POST",
        body,
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });

      const data = await response.text();
      if (!response.ok || data.trim() !== "OK") {
        throw new Error(data || `${response.status} ${response.statusText}`);
      }

      setSent(true);
      form.reset();
      setTurnstileToken("");
      setCaptchaAnswer("");
      if (captchaMode === "turnstile") {
        setTurnstileReset((value) => value + 1);
      } else {
        await loadMathCaptcha();
      }
      triggerConfetti();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setTurnstileToken("");
      setCaptchaAnswer("");
      if (captchaMode === "turnstile") {
        setTurnstileReset((value) => value + 1);
      } else {
        await loadMathCaptcha();
      }
    } finally {
      setLoading(false);
    }
  };

  const captchaLabel = captcha
    ? t.captchaLabel.replace("{question}", captcha.question)
    : t.captchaLabel.replace("{question}", "…");

  const turnstileHasError = captchaMode === "turnstile" && turnstileStatus === "error" && turnstileFailure;

  const turnstileErrorText = turnstileFailure
    ? turnstileFailure.isClientBlock
      ? t.captchaBlocked.replace("{code}", turnstileFailure.code)
      : t.captchaError.replace("{code}", turnstileFailure.code)
    : "";

  const submitDisabled =
    loading ||
    (captchaMode === "turnstile"
      ? turnstileStatus === "loading" || !turnstileToken
      : captchaLoading || !captcha);

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
              <a
                href="https://wa.me/353834677853"
                target="_blank"
                rel="noopener noreferrer"
                className="icon flex-shrink-0"
                aria-label="WhatsApp"
              >
                <i className="bi bi-whatsapp"></i>
              </a>
              <div>
                <h3>{t.callMe}</h3>
                <p>
                  <a href="https://wa.me/353834677853" target="_blank" rel="noopener noreferrer">
                    +353 83 467 7853
                  </a>
                </p>
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
                  <a href="https://github.com/fabio-daros" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i className="bi bi-github"></i></a>
                  <a href="https://www.facebook.com/fabio.daros.7/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
                  <a href="https://www.instagram.com/fabio__daros/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="bi bi-instagram"></i></a>
                  <a href="https://wa.me/353834677853" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><i className="bi bi-whatsapp"></i></a>
                  <a href="https://www.linkedin.com/in/daros-fabio" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i className="bi bi-linkedin"></i></a>
                  <a
                    href="https://orcid.org/0009-0000-7734-2971"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="ORCID"
                    title="ORCID"
                  >
                    <SiOrcid size={24} aria-hidden="true" />
                  </a>
                  {locale === "pt" && (
                    <a
                      href="https://lattes.cnpq.br/9283661108380889"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Currículo Lattes"
                      title="Currículo Lattes"
                    >
                      <span className="lattes-icon" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <form id="contact-form" action="/api/contact" method="post" className="php-email-form" data-aos-delay="600" onSubmit={handleSubmit}>
          <input type="hidden" name="locale" value={locale} />
          <div className="contact-honeypot" aria-hidden="true">
            <label htmlFor="company_website">Company website</label>
            <input
              type="text"
              id="company_website"
              name="company_website"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          <div className="row gy-4">
            <div className="col-md-6">
              <input type="text" name="name" className="form-control" placeholder={t.yourName} required maxLength={120} />
            </div>
            <div className="col-md-6">
              <input type="email" className="form-control" name="email" placeholder={t.yourEmail} required maxLength={254} />
            </div>
            <div className="col-md-12">
              <input type="text" className="form-control" name="subject" placeholder={t.subject} required maxLength={200} />
            </div>
            <div className="col-md-12">
              <textarea className="form-control" name="message" rows={6} placeholder={t.message} required maxLength={5000}></textarea>
            </div>

            {turnstileAvailable && captchaMode === "turnstile" ? (
              <div className="col-md-12 d-flex flex-column align-items-center gap-2">
                <TurnstileWidget
                  onTokenChange={setTurnstileToken}
                  onStatusChange={setTurnstileStatus}
                  onFailureChange={setTurnstileFailure}
                  resetSignal={turnstileReset}
                />
                {turnstileStatus === "loading" ? (
                  <p className="contact-captcha-hint">{t.captchaLoading}</p>
                ) : null}
                {turnstileHasError ? (
                  <div className="contact-captcha-blocked" role="status">
                    <p className="contact-captcha-blocked__text">{turnstileErrorText}</p>
                    <button
                      type="button"
                      className="contact-captcha-refresh contact-captcha-retry"
                      onClick={retryTurnstile}
                    >
                      {t.captchaRetry}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {(captchaMode === "math" || showMathAlternative) && (
              <div className="col-md-12">
                {turnstileAvailable && turnstileHasError && captchaMode === "turnstile" ? (
                  <p className="contact-captcha-hint">{t.captchaFallbackHint}</p>
                ) : null}
                {captchaMode === "math" && turnstileAvailable ? (
                  <div className="contact-captcha-blocked contact-captcha-blocked--compact" role="status">
                    <p className="contact-captcha-blocked__text">
                      {turnstileFailure
                        ? turnstileFailure.isClientBlock
                          ? t.captchaBlocked.replace("{code}", turnstileFailure.code)
                          : t.captchaError.replace("{code}", turnstileFailure.code)
                        : t.captchaError.replace("{code}", "fallback")}
                    </p>
                    <button
                      type="button"
                      className="contact-captcha-refresh contact-captcha-retry"
                      onClick={retryTurnstile}
                    >
                      {t.captchaRetry}
                    </button>
                  </div>
                ) : null}
                {captchaMode === "turnstile" && showMathAlternative && turnstileHasError ? (
                  <button
                    type="button"
                    className="contact-captcha-alt"
                    onClick={useMathAlternative}
                  >
                    {t.captchaUseAlternative}
                  </button>
                ) : null}
                {captchaMode === "math" ? (
                  <>
                    <label className="contact-captcha-label" htmlFor="captcha_answer">
                      {captchaLabel}
                    </label>
                    <div className="contact-captcha-row">
                      <input
                        id="captcha_answer"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        className="form-control"
                        name="captcha_answer"
                        value={captchaAnswer}
                        onChange={(event) => setCaptchaAnswer(event.target.value)}
                        placeholder={t.captchaPlaceholder}
                        required
                        disabled={captchaLoading || !captcha}
                      />
                      <button
                        type="button"
                        className="contact-captcha-refresh"
                        onClick={() => void loadMathCaptcha()}
                        disabled={captchaLoading}
                        aria-label={t.captchaRefresh}
                        title={t.captchaRefresh}
                      >
                        <i className="bi bi-arrow-clockwise" aria-hidden="true" />
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            )}

            <div className="col-md-12 text-center">
              <div className={`loading${loading ? " d-block" : ""}`}>{t.loading}</div>
              <div className={`error-message${error ? " d-block" : ""}`}>{error}</div>
              <div className={`sent-message${sent ? " d-block" : ""}`}>{t.sentMessage}</div>
              <button type="submit" ref={submitButtonRef} disabled={submitDisabled}>
                {t.sendMessage}
              </button>
            </div>
          </div>
        </form>
      </div>
      <div className="contact-confetti" aria-hidden="true">
        {confetti.map((piece) => (
          <span
            key={piece.id}
            className="contact-confetti__piece"
            style={
              {
                "--confetti-x": `${piece.x}px`,
                "--confetti-y": `${piece.y}px`,
                "--confetti-dx": `${piece.dx}px`,
                "--confetti-dy": `${piece.dy}px`,
                "--confetti-rotate": `${piece.rotate}deg`,
                "--confetti-delay": `${piece.delay}s`,
                "--confetti-duration": `${piece.duration}s`,
                "--confetti-size": `${piece.size}px`,
                "--confetti-color": piece.color,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </section>
  );
}
