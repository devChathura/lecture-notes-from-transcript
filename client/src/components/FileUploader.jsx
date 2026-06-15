import { useState, useRef } from "react";
import { AlertCircle, Check, FileText, UploadCloud, X } from "lucide-react";

export default function FileUploader({
  onFileSelect,
  disabled = false,
  readyLabel = "Ready to generate",
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const clearSelectedFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileSelect?.(null);
  };

  const validateAndSetFile = (selectedFile) => {
    setError(null);

    if (!selectedFile) return;

    const validExtensions = [".srt", ".vtt"];
    const fileExtension = selectedFile.name
      .substring(selectedFile.name.lastIndexOf("."))
      .toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      setError("Please upload a valid .srt or .vtt subtitle file.");
      clearSelectedFile();
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("This file is too large. Please upload a file under 5MB.");
      clearSelectedFile();
      return;
    }

    setFile(selectedFile);
    onFileSelect?.(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
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
    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      validateAndSetFile(droppedFiles[0]);
    }
  };

  const handleManualSelect = (e) => {
    if (disabled) return;
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      validateAndSetFile(selectedFiles[0]);
    }
  };

  const clearFile = () => {
    setError(null);
    clearSelectedFile();
  };

  const openFilePicker = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openFilePicker();
    }
  };

  const fileExtension = file
    ? file.name.substring(file.name.lastIndexOf(".")).toUpperCase()
    : "";

  return (
    <div className="mt-5 w-full">
      <div
        role={file ? undefined : "button"}
        tabIndex={file || disabled ? undefined : 0}
        aria-label={file ? undefined : "Upload subtitle file"}
        aria-disabled={!file ? disabled : undefined}
        className={`group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed px-4 py-5 text-center transition-all duration-200 ease-out sm:px-5
          ${file ? "min-h-[190px] sm:min-h-[200px]" : "min-h-[230px] sm:min-h-[250px] lg:min-h-[260px]"}
          ${
            isDragging
              ? "border-slate-500 bg-white/90 ring-4 ring-slate-200/60 motion-safe:scale-[1.005]"
              : "border-slate-300/80 bg-slate-50/55 hover:border-slate-400/80 hover:bg-white/80"
          } ${
            disabled
              ? "cursor-wait opacity-70"
              : file
                ? ""
                : "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={file ? undefined : openFilePicker}
        onKeyDown={file ? undefined : handleKeyDown}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleManualSelect}
          accept=".srt,.vtt"
          aria-label="Choose a subtitle file"
          className="hidden"
          disabled={disabled}
        />

        {!file ? (
          <>
            <span
              className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl border shadow-sm transition-all duration-200 ${
                isDragging
                  ? "border-slate-300 bg-white text-slate-800"
                  : "border-slate-200/80 bg-white/85 text-slate-500"
              }`}
              aria-hidden="true"
            >
              <UploadCloud
                className={`h-5 w-5 transition-transform duration-200 ${
                  isDragging ? "-translate-y-0.5" : ""
                }`}
              />
            </span>
            <h3 className="text-lg font-semibold text-slate-900">
              {isDragging
                ? "Release to upload your file"
                : "Drop your subtitle file here"}
            </h3>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              Supports .srt and .vtt files up to 5MB
            </p>
            <span className="mt-4 inline-flex min-h-9 items-center justify-center rounded-full border border-slate-200/90 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors duration-200 group-hover:border-slate-300 group-hover:text-slate-950">
              Browse file
            </span>
            <div className="mt-3 flex flex-wrap justify-center gap-2 text-[11px] font-bold tracking-wide text-slate-500">
              <span className="rounded-md border border-slate-200/70 bg-white/70 px-2 py-1">
                .SRT
              </span>
              <span className="rounded-md border border-slate-200/70 bg-white/70 px-2 py-1">
                .VTT
              </span>
            </div>
          </>
        ) : (
          <div className="try-state-enter w-full max-w-md">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/85 p-3 text-left shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:p-4">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50 text-slate-700"
                aria-hidden="true"
              >
                <FileText className="h-5 w-5" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {file.name}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>

              <span className="shrink-0 rounded-md border border-slate-200/80 bg-slate-50 px-2 py-1 text-[11px] font-bold tracking-wide text-slate-600">
                {fileExtension}
              </span>

              <button
                type="button"
                disabled={disabled}
                aria-label="Remove selected file"
                onClick={clearFile}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                {readyLabel}
              </span>
              <span className="h-4 w-px bg-slate-200" aria-hidden="true" />
              <button
                type="button"
                disabled={disabled}
                onClick={openFilePicker}
                className="rounded-full border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
              >
                Change file
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div
          className="try-state-enter mt-3 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0"
            aria-hidden="true"
          />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
