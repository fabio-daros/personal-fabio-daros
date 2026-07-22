import HeroSection from "@/components/HeroSection";
import AboutContent from "@/components/AboutContent";
import ResumeContent from "@/components/ResumeContent";
import ResearchContent from "@/components/ResearchContent";
import ExpertiseContent from "@/components/ExpertiseContent";
import ContactSection from "@/components/ContactSection";
import HashScroll from "@/components/HashScroll";
import GsapScrollReveal from "@/components/GsapScrollReveal";

export default function Home() {
  return (
    <main className="main">
      <GsapScrollReveal>
        <HashScroll />
        <HeroSection />
        <AboutContent />
        <ResumeContent />
        <ResearchContent />
        <ExpertiseContent />
        <ContactSection />
      </GsapScrollReveal>
    </main>
  );
}
