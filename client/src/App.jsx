import { useState } from "react";
import FileUploader from "./components/FileUploader";
import { generateStudyGuide } from "./services/apiService";
import { Loader2, AlertCircle } from "lucide-react";

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [markdownNotes, setMarkdownNotes] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = async (file) => {
    // Reset state
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
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto text-center mb-12 mt-8">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          AI Lecture Companion
        </h1>
        <p className="text-lg text-slate-500 mt-3">
          Upload your subtitles to generate a beautifully structured study
          guide.
        </p>
      </div>

      {!markdownNotes && (
        <div className="max-w-3xl mx-auto">
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
            <h3 className="font-semibold text-red-800">Generation Failed</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {}
      {markdownNotes && !isProcessing && (
        <div className="mt-12 max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-800">
              Generated Study Guide
            </h2>
            <button
              onClick={() => setMarkdownNotes(null)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Upload Another File
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono bg-slate-50 p-6 rounded-lg overflow-x-auto">
            {markdownNotes}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;
