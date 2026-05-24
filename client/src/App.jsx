import FileUploader from "./components/FileUploader";

function App() {
  const handleFileSelect = (file) => {
    console.log("Selected file:", file);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          AI Lecture Companion
        </h1>
        <p className="text-slate-500 mt-2">
          Upload your subtitles to generate a smart study guide.
        </p>
      </div>

      <FileUploader onFileSelect={handleFileSelect} />
    </div>
  );
}

export default App;
