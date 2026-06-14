import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import EngineeringHighlights from "./components/EngineeringHighlights";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/footer";
import FileUploader from "./components/FileUploader";
import { generateStudyGuide } from "./services/apiService";
import { Loader2, AlertCircle } from "lucide-react";
import MarkdownViewer from "./components/MarkdownViewer";
import AuroraBackground from "./components/AuroraBackground";

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [markdownNotes, setMarkdownNotes] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = async (file) => {
    setError(null);
    setMarkdownNotes(null);

    if (!file) return;

    setIsProcessing(true);

    try {
      const result = await generateStudyGuide(file);

      if (result.status === "success" && result.data?.markdown) {
        setMarkdownNotes(result.data.markdown);
      } else {
        throw new Error("Unexpected response format from server.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AuroraBackground>
      <div className="min-h-screen p-8">
        <Navbar />
        <Hero />
        <Features />
        <HowItWorks />
        <EngineeringHighlights />
        <FinalCTA />

        {!markdownNotes && !isProcessing && (
          <div id="upload" className="max-w-3xl mx-auto scroll-mt-28">
            <FileUploader onFileSelect={handleFileSelect} />
          </div>
        )}

        {isProcessing && (
          <div className="mt-12 flex flex-col items-center justify-center text-blue-600 space-y-4 animate-pulse">
            <Loader2 className="w-12 h-12 animate-spin" />
            <p className="text-lg font-medium text-slate-600">
              Analyzing transcript... this may take a moment.
            </p>
          </div>
        )}

        {error && !isProcessing && (
          <div className="mt-8 max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start shadow-sm">
            <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">
                Generation Failed
              </h3>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {markdownNotes && !isProcessing && (
          <div className="mt-8">
            <div className="max-w-4xl mx-auto flex justify-end px-2">
              <button
                onClick={() => setMarkdownNotes(null)}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all"
              >
                Upload a different lecture
              </button>
            </div>
            <MarkdownViewer markdown={markdownNotes} />
          </div>
        )}

        <Footer />
      </div>
    </AuroraBackground>
  );
}

export default App;
