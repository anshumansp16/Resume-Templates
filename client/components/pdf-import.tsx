"use client";

import { useState, useCallback } from "react";
import { Loader2, FileText, CheckCircle2, AlertCircle, Upload, X } from "lucide-react";
import axios from "axios";

interface PDFImportProps {
    onDataExtracted: (data: any) => void;
}

export function PDFImport({ onDataExtracted }: PDFImportProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === "application/pdf") {
                setSelectedFile(file);
                setError(null);
            } else {
                setError("Please upload a PDF file");
            }
        }
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type === "application/pdf") {
                setSelectedFile(file);
                setError(null);
            } else {
                setError("Please upload a PDF file");
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("Please select a PDF file first");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            const response = await axios.post("/api/parse-pdf", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                timeout: 180000, // 3 minute timeout
            });

            if (response.data.success) {
                setSuccess(true);
                onDataExtracted(response.data.data);

                // Clear after 3 seconds
                setTimeout(() => {
                    setSuccess(false);
                    setSelectedFile(null);
                }, 3000);
            } else {
                setError(response.data.error || "Failed to parse PDF");
            }
        } catch (err: any) {
            console.error("PDF parsing error:", err);
            setError(
                err.response?.data?.error ||
                "Failed to parse PDF resume. Make sure Ollama is running and the PDF contains readable text."
            );
        } finally {
            setLoading(false);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setError(null);
        setSuccess(false);
    };

    return (
        <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 dark:border-purple-900 dark:from-purple-950/30 dark:to-pink-950/30">
            <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-purple-500 p-2">
                    <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                        Import from PDF
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Upload your existing resume in PDF format
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                {/* Drag and Drop Area */}
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-all ${
                        dragActive
                            ? "border-purple-500 bg-purple-100 dark:bg-purple-900/20"
                            : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-800/50"
                    }`}
                >
                    <input
                        type="file"
                        id="pdf-upload"
                        accept=".pdf"
                        onChange={handleFileInput}
                        disabled={loading}
                        className="hidden"
                    />

                    {selectedFile ? (
                        <div className="flex items-center justify-center gap-3">
                            <FileText className="h-8 w-8 text-purple-500" />
                            <div className="flex-1 text-left">
                                <p className="font-medium text-zinc-900 dark:text-white">
                                    {selectedFile.name}
                                </p>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    {(selectedFile.size / 1024).toFixed(2)} KB
                                </p>
                            </div>
                            <button
                                onClick={clearFile}
                                disabled={loading}
                                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50 dark:hover:bg-zinc-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    ) : (
                        <label
                            htmlFor="pdf-upload"
                            className="flex cursor-pointer flex-col items-center gap-2"
                        >
                            <Upload className="h-12 w-12 text-zinc-400" />
                            <div>
                                <p className="font-medium text-zinc-700 dark:text-zinc-300">
                                    Drop your PDF here or{" "}
                                    <span className="text-purple-600 dark:text-purple-400">
                                        browse
                                    </span>
                                </p>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Maximum file size: 10MB
                                </p>
                            </div>
                        </label>
                    )}
                </div>

                {/* Upload Button */}
                {selectedFile && (
                    <button
                        onClick={handleUpload}
                        disabled={loading || !selectedFile}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-all hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Parsing Resume...
                            </>
                        ) : (
                            <>
                                <FileText className="h-5 w-5" />
                                Parse Resume
                            </>
                        )}
                    </button>
                )}

                {/* Error Message */}
                {error && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <p>Successfully parsed resume from PDF!</p>
                    </div>
                )}

                {/* Info Note */}
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    💡 <strong>Note:</strong> Make sure your PDF contains selectable text (not scanned images). The AI will extract your information and auto-fill the resume form.
                </p>
            </div>
        </div>
    );
}
