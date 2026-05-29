"use client";

import { useEffect, useId, type RefObject } from "react";
import type { ReactNode } from "react";

type ResearchProjectCardProps = {
  title: string;
  description?: string;
  onOpen: () => void;
  expandLabel: string;
};

export function ResearchProjectCard({
  title,
  description,
  onOpen,
  expandLabel,
}: ResearchProjectCardProps) {
  const triggerId = useId();

  return (
    <article className="research-accordion research-accordion--card">
      <button
        id={triggerId}
        type="button"
        className="research-accordion__trigger research-accordion__trigger--card"
        aria-haspopup="dialog"
        onClick={onOpen}
      >
        <span className="research-accordion__trigger-row">
          <span className="research-accordion__title">{title}</span>
          <i className="bi bi-chevron-down research-accordion__icon" aria-hidden />
        </span>
        {description ? <span className="research-accordion__desc">{description}</span> : null}
        <span className="visually-hidden">{expandLabel}</span>
      </button>
    </article>
  );
}

type ResearchProjectPanelProps = {
  panelRef?: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  title: string;
  description?: string;
  closeLabel: string;
  children: ReactNode;
};

export function ResearchProjectPanel({
  panelRef,
  onClose,
  title,
  description,
  closeLabel,
  children,
}: ResearchProjectPanelProps) {
  const titleId = useId();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="research-modal-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button type="button" className="research-modal__close" onClick={onClose} aria-label={closeLabel}>
        <i className="bi bi-x-lg" aria-hidden />
      </button>

      <header className="research-modal__header">
        <h2 id={titleId} className="research-modal__title">
          {title}
        </h2>
        {description ? <p className="research-modal__desc">{description}</p> : null}
      </header>

      <div className="research-modal__body">{children}</div>
    </div>
  );
}
