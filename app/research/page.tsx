import SectionHashPage, { sectionMetadata } from "@/components/SectionHashPage";
import { translations } from "@/lib/translations";

const { title, pageDescription } = translations.en.research;

export const metadata = sectionMetadata({
  title,
  description: pageDescription,
  path: "/research",
});

export default function ResearchPage() {
  return (
    <SectionHashPage
      id="research"
      title={title}
      description={pageDescription}
    />
  );
}
