"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Download, FileText, Home, Loader2 } from "lucide-react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

function PaymentSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [downloading, setDownloading] = useState(false);
    const [downloadingReceipt, setDownloadingReceipt] = useState(false);
    const [redirecting, setRedirecting] = useState(false);
    const [countdown, setCountdown] = useState(30);

    const downloadToken = searchParams.get("token");
    const templateId = searchParams.get("templateId");
    const paymentId = searchParams.get("paymentId");

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Auto redirect when countdown reaches 0
    useEffect(() => {
        if (countdown === 0) {
            setRedirecting(true);
            router.push("/");
        }
    }, [countdown, router]);

    const handleDownloadResume = async () => {
        if (!downloadToken || !templateId) {
            toast.error("Missing download information");
            return;
        }

        setDownloading(true);
        try {
            const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5001";

            // Get resume data from server
            const response = await axios.get(`${serverUrl}/api/download/${downloadToken}`);
            const { resumeData } = response.data;

            // Get template
            const templateResponse = await fetch(`/templates/${templateId}.html`);
            const templateHtml = await templateResponse.text();

            // Render template
            const { renderTemplate } = await import("@/lib/template-renderer");
            const renderedHtml = renderTemplate(templateHtml, resumeData);

            // Generate PDF
            const pdfResponse = await axios.post(
                "/api/download-pdf",
                {
                    html: renderedHtml,
                    filename: `${resumeData?.personalInfo?.name || "resume"}.pdf`,
                },
                {
                    responseType: "blob",
                }
            );

            // Download PDF
            const url = window.URL.createObjectURL(new Blob([pdfResponse.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${resumeData?.personalInfo?.name || "resume"}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success("Resume downloaded successfully!");
        } catch (error) {
            console.error("Error downloading resume:", error);
            toast.error("Failed to download resume. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    const handleDownloadReceipt = async () => {
        if (!paymentId) {
            toast.error("Payment ID not found");
            return;
        }

        setDownloadingReceipt(true);
        try {
            // Create a simple receipt HTML
            const receiptHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Payment Receipt</title>
                    <style>
                        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
                        .header { text-align: center; margin-bottom: 40px; }
                        .header h1 { color: #2563EB; margin: 0; }
                        .header p { color: #6B7280; margin: 5px 0; }
                        .receipt-details { background: #F9FAFB; padding: 30px; border-radius: 8px; margin: 20px 0; }
                        .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E5E7EB; }
                        .receipt-row:last-child { border-bottom: none; }
                        .label { font-weight: 600; color: #374151; }
                        .value { color: #6B7280; }
                        .amount { font-size: 24px; font-weight: bold; color: #2563EB; }
                        .success-badge { background: #10B981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 40px; color: #9CA3AF; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>ResumePro</h1>
                        <p>Professional Resume Builder</p>
                        <div class="success-badge">✓ Payment Successful</div>
                    </div>

                    <div class="receipt-details">
                        <h2>Payment Receipt</h2>
                        <div class="receipt-row">
                            <span class="label">Payment ID:</span>
                            <span class="value">${paymentId}</span>
                        </div>
                        <div class="receipt-row">
                            <span class="label">Date:</span>
                            <span class="value">${new Date().toLocaleString()}</span>
                        </div>
                        <div class="receipt-row">
                            <span class="label">Description:</span>
                            <span class="value">Professional Resume Download</span>
                        </div>
                        <div class="receipt-row">
                            <span class="label">Amount Paid:</span>
                            <span class="amount">₹49.00</span>
                        </div>
                    </div>

                    <div class="footer">
                        <p>Thank you for your purchase!</p>
                        <p>For support, contact us at support@resumepro.com</p>
                    </div>
                </body>
                </html>
            `;

            // Generate PDF receipt
            const pdfResponse = await axios.post(
                "/api/download-pdf",
                {
                    html: receiptHtml,
                    filename: `receipt-${paymentId}.pdf`,
                },
                {
                    responseType: "blob",
                }
            );

            // Download receipt
            const url = window.URL.createObjectURL(new Blob([pdfResponse.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `receipt-${paymentId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success("Receipt downloaded successfully!");
        } catch (error) {
            console.error("Error downloading receipt:", error);
            toast.error("Failed to download receipt. Please try again.");
        } finally {
            setDownloadingReceipt(false);
        }
    };

    const handleGoHome = () => {
        setRedirecting(true);
        router.push("/");
    };

    if (!downloadToken) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-50">
                <div className="text-center">
                    <p className="text-zinc-600">Invalid access. Redirecting to home...</p>
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-400 mx-auto mt-4" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            <Toaster position="top-right" />

            <div className="mx-auto max-w-4xl px-6 py-20">
                {/* Success Icon */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                        <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-3">
                        Payment Successful!
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        Your resume is ready to download
                    </p>
                </div>

                {/* Payment Details Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-lg p-8 mb-6">
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6">
                        Transaction Details
                    </h2>

                    <div className="space-y-4">
                        {paymentId && (
                            <div className="flex justify-between items-center py-3 border-b border-zinc-200 dark:border-zinc-700">
                                <span className="text-zinc-600 dark:text-zinc-400">Payment ID</span>
                                <span className="font-mono text-sm text-zinc-900 dark:text-white">
                                    {paymentId}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between items-center py-3 border-b border-zinc-200 dark:border-zinc-700">
                            <span className="text-zinc-600 dark:text-zinc-400">Amount Paid</span>
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                ₹49.00
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <span className="text-zinc-600 dark:text-zinc-400">Date</span>
                            <span className="text-zinc-900 dark:text-white">
                                {new Date().toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    {/* Download Resume */}
                    <button
                        onClick={handleDownloadResume}
                        disabled={downloading}
                        className="flex items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {downloading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Download className="h-5 w-5" />
                        )}
                        Download Resume
                    </button>

                    {/* Download Receipt */}
                    <button
                        onClick={handleDownloadReceipt}
                        disabled={downloadingReceipt}
                        className="flex items-center justify-center gap-3 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 px-8 py-4 text-lg font-semibold text-zinc-700 dark:text-zinc-300 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50"
                    >
                        {downloadingReceipt ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <FileText className="h-5 w-5" />
                        )}
                        Download Receipt
                    </button>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                        📧 Check Your Email
                    </h3>
                    <p className="text-blue-800 dark:text-blue-400 text-sm">
                        We've sent a download link to your email. You can use it to download your resume anytime within the next 365 days.
                    </p>
                </div>

                {/* Return Home Button */}
                <div className="text-center">
                    <button
                        onClick={handleGoHome}
                        disabled={redirecting}
                        className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 dark:bg-white px-6 py-3 font-semibold text-white dark:text-zinc-900 transition-all hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-50"
                    >
                        {redirecting ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Home className="h-5 w-5" />
                        )}
                        Return to Home
                    </button>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3">
                        Auto-redirecting in {countdown} seconds...
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-50">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                </div>
            }
        >
            <PaymentSuccessContent />
        </Suspense>
    );
}
