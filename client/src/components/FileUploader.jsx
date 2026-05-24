import { useState, useRef } from "react";
import { UploadCloud, FileText, X } from "lucide-react";

export default function FileUploader({ onFileSelect }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Validate file type and size before accepting
  const validateAndSetFile = (selectedFile) => {
    setError(null);

    if (!selectedFile) return;

    const validExtensions = [".srt", ".vtt"];
    const fileExtension = selectedFile.name
      .substring(selectedFile.name.lastIndexOf("."))
      .toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      setError("Invalid file type. Please upload a .srt or .vtt file.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File is too large. Maximum size is 5MB.");
      return;
    }

    setFile(selectedFile);

    // Pass the file up to the parent component (App.jsx)
    if (onFileSelect) {
      onFileSelect(selectedFile);
    }
  };

  // Drag and Drop Event Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      validateAndSetFile(droppedFiles[0]);
    }
  };

  const handleManualSelect = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      validateAndSetFile(selectedFiles[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      {/* The Dropzone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 transition-all duration-200 ease-in-out flex flex-col items-center justify-center cursor-pointer
          ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleManualSelect}
          accept=".srt,.vtt"
          className="hidden"
        />

        {!file ? (
          <>
            <UploadCloud
              className={`w-12 h-12 mb-4 transition-colors duration-200 ${isDragging ? "text-blue-500" : "text-slate-400"}`}
            />
            <h3 className="text-lg font-semibold text-slate-700 mb-1">
              Drag & drop your transcript
            </h3>
            <p className="text-sm text-slate-500">
              or click to browse your computer
            </p>
            <div className="mt-4 flex gap-2 text-xs font-medium text-slate-400">
              <span className="bg-slate-100 px-2 py-1 rounded">.SRT</span>
              <span className="bg-slate-100 px-2 py-1 rounded">.VTT</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center w-full">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-md font-semibold text-slate-800 truncate max-w-full px-4">
              {file.name}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {(file.size / 1024).toFixed(1)} KB
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the file input click
                clearFile();
              }}
              className="mt-6 flex items-center gap-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
            >
              <X className="w-4 h-4" /> Remove File
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center">
          <span className="font-semibold mr-2">Error:</span> {error}
        </div>
      )}
    </div>
  );
}
