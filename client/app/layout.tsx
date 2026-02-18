import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@/lib/analytics";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://resumepro.com'),
  title: {
    default: "ResumePro - Professional ATS-Optimized Resume Builder",
    template: "%s | ResumePro"
  },
  description: "Create professional, ATS-friendly resumes with AI assistance in minutes. Premium templates designed for tech, business, creative, and executive roles. Download as PDF for just ₹49.",
  keywords: [
    "resume builder",
    "ATS resume",
    "professional resume",
    "AI resume builder",
    "resume templates",
    "ATS-optimized resume",
    "CV builder",
    "job application",
    "career tools",
    "resume download"
  ],
  authors: [{ name: "ResumePro" }],
  creator: "ResumePro",
  publisher: "ResumePro",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "ResumePro - Build ATS-Optimized Resumes in Minutes",
    description: "Create professional, ATS-friendly resumes with AI assistance. Premium templates designed for tech, business, and executive roles.",
    siteName: "ResumePro",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ResumePro - Professional Resume Builder"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumePro - Professional ATS-Optimized Resume Builder",
    description: "Create professional, ATS-friendly resumes with AI assistance in minutes.",
    images: ["/og-image.png"],
    creator: "@resumepro"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-verification-code-here",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
