"use client";

import { useState } from "react";
import { templates, TemplateMetadata } from "@/lib/template-config";
import { TemplateCard } from "./template-card";
import { TemplatePreviewModal } from "./template-preview-modal";

export function TemplateGallery() {
    const [selectedTemplate, setSelectedTemplate] =
        useState<TemplateMetadata | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const handlePreview = (template: TemplateMetadata) => {
        setSelectedTemplate(template);
        setIsPreviewOpen(true);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="relative overflow-hidden border-b border-border bg-card/50 backdrop-blur-xl">
                {/* Gradient Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />

                <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-24">
                    <div className="text-center">
                        <h1 className="mb-4 font-serif bg-gradient-to-r from-primary via-foreground to-primary bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl">
                            Choose Your Resume Template
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg leading-8 text-muted-foreground">
                            Select from our professionally designed resume templates. Each
                            template is crafted for specific industries and career levels.
                            Click preview to see the full template.
                        </p>
                    </div>
                </div>
            </div>

            {/* Templates Grid */}
            <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            onPreview={handlePreview}
                        />
                    ))}
                </div>
            </div>

            {/* Preview Modal */}
            <TemplatePreviewModal
                template={selectedTemplate}
                open={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
            />
        </div>
    );
}
