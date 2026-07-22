import HeroSection from "@/components/HeroSection";
import AboutContent from "@/components/AboutContent";
import ResumeContent from "@/components/ResumeContent";
import ResearchContent from "@/components/ResearchContent";
import ExpertiseContent from "@/components/ExpertiseContent";
import ContactSection from "@/components/ContactSection";
import HashScroll from "@/components/HashScroll";

export default function Home() {
  return (
    <main className="main">
      <HashScroll />
      <HeroSection />
      <AboutContent />
      <ResumeContent />
      <ResearchContent />
      <ExpertiseContent />
      <ContactSection />
    </main>
  );
}
