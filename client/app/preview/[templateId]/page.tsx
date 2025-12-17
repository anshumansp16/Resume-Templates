"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useResumeStore } from "@/lib/resume-store";
import { templates } from "@/lib/template-config";
import { ArrowLeft, Download, Edit, Loader2 } from "lucide-react";
import { renderTemplate } from "@/lib/template-renderer";
import { initiatePayment, RazorpayResponse } from "@/lib/payment";
import axios from "axios";
import toast from "react-hot-toast";

interface PreviewPageProps {
    params: Promise<{ templateId: string }>;
}

export default function PreviewPage({ params }: PreviewPageProps) {
    const router = useRouter();
    const { resumeData } = useResumeStore();
    const [templateId, setTemplateId] = useState<string | null>(null);
    const [htmlContent, setHtmlContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    // Unwrap params
    useEffect(() => {
        params.then((p) => setTemplateId(p.templateId));
    }, [params]);

    const template = templates.find((t) => t.id === templateId);

    useEffect(() => {
        if (!templateId || !resumeData) return;

        // Load and render template
        fetch(`/templates/${template?.filename}`)
            .then((response) => response.text())
            .then((html) => {
                const rendered = renderTemplate(html, resumeData);
                setHtmlContent(rendered);
                setLoading(false);
            });
    }, [templateId, resumeData, template]);

    const handleDownloadPDF = async () => {
        if (!htmlContent || !resumeData || !resumeData.personalInfo || !template) return;

        const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5001";

        setDownloading(true);
        try {
            // Step 1: Create payment order
            const orderResponse = await axios.post(`${serverUrl}/api/payment/create-order`, {
                email: resumeData.personalInfo.email,
                resumeData: resumeData,
                templateId: template.id,
                templateName: template.name,
            });

            const { orderId, amount, currency, keyId } = orderResponse.data;

            // Step 2: Initiate Razorpay payment
            await initiatePayment({
                orderId,
                amount,
                currency,
                keyId,
                email: resumeData.personalInfo.email,
                name: resumeData.personalInfo.name,
                onSuccess: async (response: RazorpayResponse) => {
                    try {
                        // Step 3: Verify payment
                        const verifyResponse = await axios.post(
                            `${serverUrl}/api/payment/verify`,
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                templateName: template.name,
                            }
                        );

                        const { downloadToken } = verifyResponse.data;

                        toast.success("Payment successful! Redirecting...");

                        // Step 4: Redirect to success page with token
                        setTimeout(() => {
                            router.push(
                                `/payment-success?token=${downloadToken}&templateId=${templateId}&paymentId=${response.razorpay_payment_id}`
                            );
                        }, 1500);
                    } catch (error) {
                        console.error("Payment verification error:", error);
                        toast.error("Payment verification failed. Please contact support.");
                        setDownloading(false);
                    }
                },
                onError: (error: any) => {
                    console.error("Payment failed:", error);
                    toast.error("Payment failed. Please try again.");
                    setDownloading(false);
                },
            });
        } catch (error) {
            console.error("Error initiating payment:", error);
            toast.error("Failed to initiate payment. Please try again.");
            setDownloading(false);
        }
    };

    const downloadPDFWithToken = async (token: string) => {
        try {
            const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5001";

            // Get resume data from server using token
            const response = await axios.get(`${serverUrl}/api/download/${token}`);
            const { resumeData: serverResumeData } = response.data;

            // Render template with resume data
            const templateHtml = await fetch(`/templates/${template?.filename}`).then((res) =>
                res.text()
            );
            const renderedHtml = renderTemplate(templateHtml, serverResumeData);

            // Generate PDF
            const pdfResponse = await axios.post(
                "/api/download-pdf",
                {
                    html: renderedHtml,
                    filename: `${serverResumeData?.personalInfo?.name || "resume"}.pdf`,
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
                `${serverResumeData?.personalInfo?.name || "resume"}.pdf`
            );
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success("Resume downloaded successfully!");
        } catch (error) {
            console.error("Error downloading PDF:", error);
            toast.error("Failed to download PDF. Please try again.");
        }
    };

    if (!template || !resumeData) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            {/* Header */}
            <div className="border-b border-zinc-200 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
                <div className="mx-auto max-w-6xl px-6 py-6">
                    <button
                        onClick={() => router.push(`/customize/${templateId}`)}
                        className="mb-4 flex items-center gap-2 text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to editor
                    </button>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div
                                className={`h-12 w-12 rounded-lg bg-gradient-to-br ${template.gradient} flex items-center justify-center text-white font-bold text-lg`}
                            >
                                {template.name.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    Resume Preview
                                </h1>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    {template.name} · {resumeData.personalInfo?.name}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => router.push(`/customize/${templateId}`)}
                                className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            >
                                <Edit className="h-4 w-4" />
                                Edit
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                disabled={downloading}
                                className={`flex items-center gap-2 rounded-lg bg-gradient-to-r ${template.gradient} px-6 py-2 font-semibold text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100`}
                            >
                                {downloading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Download className="h-4 w-4" />
                                )}
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview */}
            <div className="mx-auto px-6 py-12 flex justify-center items-start">
                {loading ? (
                    <div className="flex min-h-[600px] items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                    </div>
                ) : (
                    // A4 Size PDF Sheet Preview - Larger and clearer
                    <div className="w-full max-w-4xl">
                        <div
                            className="bg-white shadow-2xl border border-zinc-200 dark:border-zinc-700 mx-auto"
                            style={{
                                width: '100%',
                                maxWidth: '850px',
                                height: 'auto',
                                minHeight: '1100px'
                            }}
                        >
                            <iframe
                                srcDoc={htmlContent}
                                className="w-full border-0"
                                title="Resume Preview"
                                sandbox="allow-same-origin"
                                style={{
                                    display: 'block',
                                    height: '1100px',
                                    transformOrigin: 'top center'
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
