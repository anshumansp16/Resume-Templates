"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowRight, Check, Download, FileText, Sparkles, Zap } from "lucide-react";
import { templates, TemplateMetadata } from "@/lib/template-config";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with PDF.js
const TemplatePreviewModal = dynamic(
  () => import("./template-preview-modal").then((mod) => ({ default: mod.TemplatePreviewModal })),
  { ssr: false }
);

export function LandingPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateMetadata | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePreview = (template: TemplateMetadata) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  return (
    <div className="min-h-screen font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-background to-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border backdrop-blur-xl bg-background/80">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg">
                R
              </div>
              <span className="text-lg font-bold text-foreground tracking-tight">ResumePro</span>
            </Link>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              <Link href="#features" className="text-foreground-muted hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#templates" className="text-foreground-muted hover:text-foreground transition-colors">
                Templates
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="#templates"
                className="hidden sm:inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-foreground-muted hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="#templates"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-electric transition-all"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center pb-24 bg-gradient-to-b from-[#0c0c0c] to-[#000]">
        <div className="relative mx-auto max-w-4xl px-6 text-center w-full">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] px-3 py-1 text-xs font-medium text-primary-light">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI-Powered Resume Builder</span>
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight leading-[1.1] max-w-3xl mx-auto">
            <span className="text-foreground">Build Resumes That Land Interviews Fast</span>
          </h1>

          <p className="text-lg md:text-xl text-foreground-muted max-w-2xl mx-auto mb-12 leading-relaxed">
            AI-powered platform that crafts professional, ATS-optimized resumes in minutes.
            Stand out to recruiters and hiring managers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              href="#templates"
              className="group inline-flex items-center justify-center gap-3 rounded-lg bg-primary px-8 py-4 text-base font-bold text-white hover:bg-primary-electric transition-all"
            >
              Build My Resume For Free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/[0.02] border border-white/[0.10] px-8 py-4 text-base font-semibold text-foreground hover:bg-white/[0.08] hover:border-white/[0.18] transition-all"
            >
              Explore Features
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm text-foreground-muted">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success flex-shrink-0" />
              <span>No signup required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success flex-shrink-0" />
              <span>Privacy-first</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success flex-shrink-0" />
              <span>ATS-Optimized</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 border-b border-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
              A Smarter Way to Build Your Resume
            </h2>
            <p className="text-lg text-foreground-muted max-w-3xl mx-auto">
              Expert-designed templates combined with powerful AI to help you stand out.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Sparkles, title: "AI-Powered Writing", description: "Get intelligent suggestions for your resume content, tailored to your industry." },
              { icon: FileText, title: "Expert Templates", description: "Choose from a library of professionally designed and ATS-friendly templates." },
              { icon: Zap, title: "Real-Time Preview", description: "See your changes instantly and edit your resume with a live preview." },
              { icon: Download, title: "Instant PDF Export", description: "Download a pixel-perfect PDF of your resume with a single click." },
              { icon: Check, title: "ATS Optimization", description: "Ensure your resume gets past automated screeners and into human hands." },
              { icon: Sparkles, title: "Privacy First", description: "Your data is your own. Resumes are processed locally, no data is stored on our servers." },
            ].map((feature, i) => (
              <div key={i} className="card-feature p-6 h-44 sm:h-48 flex flex-col">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-royal/80 text-primary-light">
                  <feature.icon className="h-5 w-5" />
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-foreground-muted leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Preview Section */}
      <section id="templates" className="py-16 border-b border-border">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
              Find Your Perfect Template
            </h2>
            <p className="text-lg text-foreground-muted max-w-3xl mx-auto">
              5 expert-designed templates covering 90% of career paths. More added every month.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {templates.map((template) => (
              <div
                key={template.id}
                className="group card-template cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10 transition-all duration-300"
                onClick={() => handlePreview(template)}
              >
                {/* Glowing top bar with gradient */}
                <div className="h-0.5 bg-gradient-to-r from-primary-electric to-primary-light opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="h-64 bg-gradient-to-br from-neutral-100 to-neutral-50 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center relative overflow-hidden">
                  <div className="relative w-full h-full">
                    <Image
                      src={`/images/previews/${template.id}.png`}
                      alt={`${template.name} template preview`}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="text-white text-sm font-semibold px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                      Preview Template
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-2 tracking-tight">
                    {template.name}
                  </h3>
                  <p className="text-sm text-foreground-muted mb-5 leading-relaxed">
                    {template.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-light group-hover:gap-3 transition-all">
                    Preview
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-foreground-muted text-sm">
              All templates are ATS-optimized and industry-tested.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 border-b border-border overflow-hidden">
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight text-foreground">
            Ready to Build Your Perfect Resume?
          </h2>
          <p className="text-lg text-foreground-muted mb-10 max-w-xl mx-auto">
            Join thousands of professionals creating ATS-ready resumes with our AI-powered platform.
          </p>
          <a
            href="#templates"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-bold text-white hover:bg-primary-electric transition-all"
          >
            Start Creating Free
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-12 border-t border-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
                R
              </div>
              <span className="text-base font-bold text-foreground tracking-tight">ResumePro</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 ResumePro. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Preview Modal */}
      <TemplatePreviewModal
        template={selectedTemplate}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
      />
    </div>
  );
}
