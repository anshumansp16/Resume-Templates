"use client";

import { TemplateMetadata } from "@/lib/template-config";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useResumeStore } from "@/lib/resume-store";
import { ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";

interface TemplatePreviewModalProps {
  template: TemplateMetadata | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplatePreviewModal({ template, open, onOpenChange }: TemplatePreviewModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();
  const setSelectedTemplate = useResumeStore((state) => state.setSelectedTemplate);

  const handleUseTemplate = () => {
    if (!template) return;
    setSelectedTemplate(template.id);
    router.push(`/customize/${template.id}`);
    onOpenChange(false);
  };

  if (!template) return null;

  // Try template-specific preview first, fallback to default
  const previewImagePath = `/images/previews/${template.id}.png`;
  const fallbackImagePath = "/images/preview.png";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[95vh] p-0 flex flex-col gradient-card border-border-strong overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${template.gradient} flex items-center justify-center text-white font-bold`}>
              {template.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{template.name}</h2>
              <p className="text-sm text-muted-foreground font-normal">
                {template.description}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-b from-neutral-100 to-neutral-200 dark:from-neutral-900 dark:to-neutral-950 overflow-y-auto min-h-0">
          {!imageLoaded && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 text-primary-light animate-spin" />
              <p className="text-sm text-muted-foreground">Generating PDF Preview...</p>
            </div>
          )}

          {/* A4 PDF Sheet Preview - Fitted to container without scrolling */}
          <div className={`${imageLoaded ? 'flex' : 'hidden'} w-full items-center justify-center`}>
            <div
              className="relative bg-white shadow-2xl my-auto"
              style={{
                width: '100%',
                maxWidth: '595px',
                height: 'auto',
                maxHeight: 'calc(95vh - 200px)',
                borderRadius: '4px',
                border: '1px solid rgba(0,0,0,0.1)',
                aspectRatio: '595 / 842',
                overflow: 'hidden'
              }}
            >
              <Image
                src={previewImagePath}
                alt={`${template.name} Preview`}
                width={595}
                height={842}
                className="w-full h-full object-contain"
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  // Fallback to default preview image
                  const img = e.target as HTMLImageElement;
                  img.src = fallbackImagePath;
                  setImageLoaded(true);
                }}
                priority
              />
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-border-subtle px-6 py-4 surface-glass">
          <div className="flex items-center justify-end">
            <button
              onClick={handleUseTemplate}
              className="group inline-flex items-center gap-2 rounded-lg gradient-blue px-6 py-3 font-semibold text-white transition-all duration-300 hover:opacity-90 glow-blue shadow-premium"
            >
              Use this template
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
