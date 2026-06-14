import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import EngineeringHighlights from "../components/EngineeringHighlights";
import FinalCTA from "../components/FinalCTA";
import Footer from "../components/footer";
import AuroraBackground from "../components/AuroraBackground";

const LandingPage = () => {
  return (
    <AuroraBackground>
      <div className="min-h-screen p-8">
        <Navbar />
        <Hero />
        <Features />
        <HowItWorks />
        <EngineeringHighlights />
        <FinalCTA />
        <Footer />
      </div>
    </AuroraBackground>
  );
};

export default LandingPage;
