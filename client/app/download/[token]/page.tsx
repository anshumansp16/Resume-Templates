"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { templates } from "@/lib/template-config";
import { Download, Loader2, CheckCircle, XCircle, Mail } from "lucide-react";
import { renderTemplate } from "@/lib/template-renderer";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";

interface DownloadPageProps {
    params: Promise<{ token: string }>;
}

export default function DownloadPage({ params }: DownloadPageProps) {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [orderData, setOrderData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Unwrap params
    useEffect(() => {
        params.then((p) => setToken(p.token));
    }, [params]);

    useEffect(() => {
        if (!token) return;

        const fetchOrderData = async () => {
            try {
                const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5001";
                const response = await axios.get(`${serverUrl}/api/download/${token}`);
                setOrderData(response.data);
                setLoading(false);
            } catch (err: any) {
                console.error("Error fetching order:", err);
                setError(
                    err.response?.data?.message ||
                        "Invalid or expired download link. Please check your email or contact support."
                );
                setLoading(false);
            }
        };

        fetchOrderData();
    }, [token]);

    const handleDownload = async () => {
        if (!orderData || !token) return;

        setDownloading(true);
        try {
            const template = templates.find((t) => t.id === orderData.templateId);
            if (!template) {
                toast.error("Template not found");
                return;
            }

            // Render template with resume data
            const templateHtml = await fetch(`/templates/${template.filename}`).then((res) =>
                res.text()
            );
            const renderedHtml = renderTemplate(templateHtml, orderData.resumeData);

            // Generate PDF
            const pdfResponse = await axios.post(
                "/api/download-pdf",
                {
                    html: renderedHtml,
                    filename: `${orderData.resumeData?.personalInfo?.name || "resume"}.pdf`,
                },
                {
                    responseType: "blob",
                }
            );

            // Download PDF
            const url = window.URL.createObjectURL(new Blob([pdfResponse.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `${orderData.resumeData?.personalInfo?.name || "resume"}.pdf`
            );
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success("Resume downloaded successfully!");
        } catch (error) {
            console.error("Error downloading PDF:", error);
            toast.error("Failed to download PDF. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        Verifying download link...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
                <div className="max-w-md text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="rounded-full bg-red-100 p-6 dark:bg-red-900/20">
                            <XCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                    <h1 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-white">
                        Invalid Download Link
                    </h1>
                    <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">{error}</p>
                    <div className="space-y-4">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90"
                        >
                            Go to Homepage
                        </Link>
                        <p className="text-sm text-zinc-500 dark:text-zinc-500">
                            Need help? Contact support with your email address.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const template = templates.find((t) => t.id === orderData?.templateId);

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            {/* Header */}
            <div className="border-b border-zinc-200 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
                <div className="mx-auto max-w-4xl px-6 py-8">
                    <Link href="/" className="mb-6 inline-flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
                            R
                        </div>
                        <span className="text-lg font-bold text-foreground tracking-tight">
                            ResumePro
                        </span>
                    </Link>
                </div>
            </div>

            {/* Download Section */}
            <div className="mx-auto max-w-2xl px-6 py-16">
                <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="mb-8 flex justify-center">
                        <div className="rounded-full bg-green-100 p-6 dark:bg-green-900/20">
                            <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
                        </div>
                    </div>

                    <h1 className="mb-4 text-center text-3xl font-bold text-zinc-900 dark:text-white">
                        Your Resume is Ready!
                    </h1>

                    <p className="mb-8 text-center text-lg text-zinc-600 dark:text-zinc-400">
                        Click the button below to download your professional resume.
                    </p>

                    {template && (
                        <div className="mb-8 rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
                            <div className="flex items-center gap-4">
                                <div
                                    className={`h-16 w-16 flex-shrink-0 rounded-lg bg-gradient-to-br ${template.gradient} flex items-center justify-center text-white font-bold text-xl`}
                                >
                                    {template.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                                        {template.name}
                                    </h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        {orderData.resumeData?.personalInfo?.name}
                                    </p>
                                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                                        Downloaded {orderData.downloadCount} time
                                        {orderData.downloadCount !== 1 ? "s" : ""}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className={`w-full flex items-center justify-center gap-3 rounded-lg bg-gradient-to-r ${template?.gradient || "from-blue-600 to-blue-700"} px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100`}
                    >
                        {downloading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Generating PDF...
                            </>
                        ) : (
                            <>
                                <Download className="h-5 w-5" />
                                Download Resume PDF
                            </>
                        )}
                    </button>

                    <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
                        <div className="flex gap-3">
                            <Mail className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                            <div>
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                                    Save This Link
                                </h4>
                                <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                                    This download link is valid for 1 year. Save this email to
                                    download your resume anytime.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-500">
                        Need to make changes?{" "}
                        <Link href="/" className="font-semibold text-primary hover:underline">
                            Create a new resume
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
