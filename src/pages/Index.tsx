import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import GuideSection from "@/components/GuideSection";
import PlanSection from "@/components/PlanSection";
import WhyDifferentSection from "@/components/WhyDifferentSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import ComparisonTable from "@/components/ComparisonTable";
import NoFeedbackSection from "@/components/NoFeedbackSection";
import SuccessSection from "@/components/SuccessSection";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <ProblemSection />
      <GuideSection />
      <PlanSection />
      <WhyDifferentSection />
      <TestimonialsSection />
      <PricingSection />
      <ComparisonTable />
      <NoFeedbackSection />
      <SuccessSection />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Index;
