import SectionHashPage, { sectionMetadata } from "@/components/SectionHashPage";
import { translations } from "@/lib/translations";

const { title, pageDescription } = translations.en.about;

export const metadata = sectionMetadata({
  title,
  description: pageDescription,
  path: "/about",
});

export default function AboutPage() {
  return (
    <SectionHashPage
      id="about"
      title={title}
      description={pageDescription}
    />
  );
}
