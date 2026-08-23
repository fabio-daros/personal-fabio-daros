import type { Metadata } from "next";
import HashRedirect from "@/components/HashRedirect";
import { SITE_URL } from "@/lib/site";

type SectionMetaInput = {
  title: string;
  description: string;
  path: string;
};

export function sectionMetadata({
  title,
  description,
  path,
}: SectionMetaInput): Metadata {
  const url = `${SITE_URL}${path}`;
  const fullTitle = `${title} | Fabio Daros`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      type: "website",
    },
  };
}

type SectionHashPageProps = {
  id: string;
  title: string;
  description: string;
};

/** SSR text for crawlers; clients are sent to the matching home hash. */
export default function SectionHashPage({
  id,
  title,
  description,
}: SectionHashPageProps) {
  return (
    <>
      <HashRedirect id={id} />
      <main
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "4rem 1.5rem",
        }}
      >
        <h1>{title}</h1>
        <p>{description}</p>
        <p>
          <a href={`/#${id}`}>View on homepage</a>
        </p>
      </main>
    </>
  );
}
