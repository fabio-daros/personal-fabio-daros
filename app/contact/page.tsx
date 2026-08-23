import SectionHashPage, { sectionMetadata } from "@/components/SectionHashPage";
import { translations } from "@/lib/translations";

const title = translations.en.contact.title;
const description =
  "Get in touch with Fabio Daros — software engineer focused on biotechnology, biomedical AI and health technology.";

export const metadata = sectionMetadata({
  title,
  description,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <SectionHashPage
      id="contact"
      title={title}
      description={description}
    />
  );
}
