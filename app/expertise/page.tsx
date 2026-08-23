import SectionHashPage, { sectionMetadata } from "@/components/SectionHashPage";
import { translations } from "@/lib/translations";

const { title, pageDescription } = translations.en.expertise;

export const metadata = sectionMetadata({
  title,
  description: pageDescription,
  path: "/expertise",
});

export default function ExpertisePage() {
  return (
    <SectionHashPage
      id="expertise"
      title={title}
      description={pageDescription}
    />
  );
}
