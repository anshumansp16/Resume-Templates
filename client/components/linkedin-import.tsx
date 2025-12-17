"use client";

import { useState } from "react";
import { Loader2, Linkedin, CheckCircle2, AlertCircle } from "lucide-react";
import axios from "axios";

interface LinkedInImportProps {
    onDataExtracted: (data: any) => void;
}

export function LinkedInImport({ onDataExtracted }: LinkedInImportProps) {
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleExtract = async () => {
        if (!linkedinUrl.trim()) {
            setError("Please enter a LinkedIn URL");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await axios.post("/api/extract-linkedin", {
                linkedinUrl: linkedinUrl.trim(),
            });

            if (response.data.success) {
                setSuccess(true);
                onDataExtracted(response.data.data);

                // Clear after 3 seconds
                setTimeout(() => {
                    setSuccess(false);
                    setLinkedinUrl("");
                }, 3000);
            } else {
                setError(response.data.error || "Failed to extract data");
            }
        } catch (err: any) {
            console.error("LinkedIn extraction error:", err);
            setError(
                err.response?.data?.error ||
                "Failed to extract LinkedIn profile. Make sure Ollama is running and the profile is public."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 dark:border-blue-900 dark:from-blue-950/30 dark:to-cyan-950/30">
            <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-blue-500 p-2">
                    <Linkedin className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                        Import from LinkedIn
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Auto-fill your resume with your LinkedIn profile
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex gap-2">
                    <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleExtract()}
                        placeholder="https://www.linkedin.com/in/your-profile"
                        disabled={loading}
                        className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                    <button
                        onClick={handleExtract}
                        disabled={loading || !linkedinUrl.trim()}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Extracting...
                            </>
                        ) : (
                            <>
                                <Linkedin className="h-4 w-4" />
                                Import
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}

                {success && (
                    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <p>Successfully imported data from LinkedIn!</p>
                    </div>
                )}

                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    💡 <strong>Note:</strong> This works best with public LinkedIn profiles. Make sure your profile visibility is set to public or provide the public profile URL.
                </p>
            </div>
        </div>
    );
}
