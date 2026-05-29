import { useState } from "react";
import FileUploader from "./components/FileUploader";
import { generateStudyGuide } from "./services/apiService";
import { Loader2, AlertCircle } from "lucide-react";
import MarkdownViewer from "./components/MarkdownViewer";

const DUMMY_MARKDOWN = `
# Big O Notation: A Study Guide

## Introduction to Time Complexity
Big O notation is a mathematical notation that describes the limiting behavior of a function when the argument tends towards a particular value or infinity. 

In computer science, it is used to classify algorithms according to how their run time or space requirements grow as the input size grows.

### Common Complexities
Here is a breakdown of the most common time complexities you will encounter:

* **O(1) Constant Time:** The algorithm takes the same amount of time regardless of input size.
* **O(n) Linear Time:** The algorithm's performance grows linearly with the input size.
* **O(n^2) Quadratic Time:** Usually the result of nested loops.

## Key Takeaways
> "Premature optimization is the root of all evil in programming." 
> — Donald Knuth

### Essential Terminology
1. **Algorithm:** A set of instructions designed to perform a specific task.
2. **Data Structure:** A specialized format for organizing and storing data.
3. **Worst-case Scenario:** The maximum maximum amount of time an algorithm could possibly take.
`;

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

      {markdownNotes && !isProcessing && (
        <div className="mt-8">
          <div className="max-w-4xl mx-auto flex justify-end px-2">
            <button
              onClick={() => setMarkdownNotes(null)}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all"
            >
              ← Upload a different lecture
            </button>
          </div>
          <MarkdownViewer markdown={markdownNotes} />
        </div>
      )}
    </div>
  );
}

export default App;
