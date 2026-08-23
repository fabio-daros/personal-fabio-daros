import SectionHashPage, { sectionMetadata } from "@/components/SectionHashPage";
import { translations } from "@/lib/translations";

const { title, pageDescription } = translations.en.resume;

export const metadata = sectionMetadata({
  title,
  description: pageDescription,
  path: "/resume",
});

export default function ResumePage() {
  return (
    <SectionHashPage
      id="resume"
      title={title}
      description={pageDescription}
    />
  );
}
