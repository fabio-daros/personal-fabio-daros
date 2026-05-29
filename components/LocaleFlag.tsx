"use client";

type LocaleFlagProps = {
  locale: "pt" | "en";
  className?: string;
};

export default function LocaleFlag({ locale, className }: LocaleFlagProps) {
  if (locale === "pt") {
    return (
      <svg
        className={className}
        viewBox="0 0 60 40"
        width="22"
        height="15"
        aria-hidden="true"
        focusable="false"
      >
        <rect width="60" height="40" fill="#009739" />
        <polygon fill="#FEDD00" points="30,3 57,20 30,37 3,20" />
        <circle cx="30" cy="20" r="9" fill="#002776" />
        <path
          fill="#fff"
          d="M18.5 20c2.8-3.2 9.2-3.2 12 0-2.8 3.2-9.2 3.2-12 0z"
        />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 60 40"
      width="22"
      height="15"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="60" height="40" fill="#fff" />
      <g fill="#B22234">
        <rect y="0" width="60" height="3.08" />
        <rect y="6.15" width="60" height="3.08" />
        <rect y="12.31" width="60" height="3.08" />
        <rect y="18.46" width="60" height="3.08" />
        <rect y="24.62" width="60" height="3.08" />
        <rect y="30.77" width="60" height="3.08" />
        <rect y="36.92" width="60" height="3.08" />
      </g>
      <rect width="24" height="21.54" fill="#3C3B6E" />
      <g fill="#fff">
        <circle cx="4" cy="3.5" r="0.85" />
        <circle cx="8" cy="3.5" r="0.85" />
        <circle cx="12" cy="3.5" r="0.85" />
        <circle cx="16" cy="3.5" r="0.85" />
        <circle cx="20" cy="3.5" r="0.85" />
        <circle cx="6" cy="7" r="0.85" />
        <circle cx="10" cy="7" r="0.85" />
        <circle cx="14" cy="7" r="0.85" />
        <circle cx="18" cy="7" r="0.85" />
        <circle cx="4" cy="10.5" r="0.85" />
        <circle cx="8" cy="10.5" r="0.85" />
        <circle cx="12" cy="10.5" r="0.85" />
        <circle cx="16" cy="10.5" r="0.85" />
        <circle cx="20" cy="10.5" r="0.85" />
        <circle cx="6" cy="14" r="0.85" />
        <circle cx="10" cy="14" r="0.85" />
        <circle cx="14" cy="14" r="0.85" />
        <circle cx="18" cy="14" r="0.85" />
        <circle cx="4" cy="17.5" r="0.85" />
        <circle cx="8" cy="17.5" r="0.85" />
        <circle cx="12" cy="17.5" r="0.85" />
        <circle cx="16" cy="17.5" r="0.85" />
        <circle cx="20" cy="17.5" r="0.85" />
      </g>
    </svg>
  );
}
