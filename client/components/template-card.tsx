"use client";

import { TemplateMetadata } from "@/lib/template-config";
import { Eye } from "lucide-react";

interface TemplateCardProps {
    template: TemplateMetadata;
    onPreview: (template: TemplateMetadata) => void;
}

export function TemplateCard({ template, onPreview }: TemplateCardProps) {
    return (
        <div className="group card-template cursor-pointer" onClick={() => onPreview(template)}>
            {/* Card Content */}
            <div className="relative h-full overflow-hidden rounded-xl">
                {/* Gradient Background Accent */}
                <div
                    className={`absolute right-0 top-0 h-32 w-32 bg-gradient-to-br ${template.gradient} opacity-10 blur-3xl transition-opacity duration-300 group-hover:opacity-20`}
                />

                {/* Content */}
                <div className="relative z-10 flex h-full flex-col p-6">
                    {/* Category Badge */}
                    <div className="mb-4 inline-flex w-fit items-center rounded-full border border-white/[0.07] px-3 py-1 text-xs font-medium text-foreground-muted">
                        {template.category}
                    </div>

                    {/* Template Name */}
                    <h3 className="mb-2 text-xl font-bold text-foreground tracking-tight">
                        {template.name}
                    </h3>

                    {/* Description */}
                    <p className="mb-6 flex-1 text-sm leading-relaxed text-foreground-muted">
                        {template.description}
                    </p>

                    {/* Action Button - Centered */}
                    <div className="flex justify-center">
                        <button
                            className="group/btn relative inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-electric"
                        >
                            <Eye className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
                            Use This Template
                        </button>
                    </div>
                </div>

                {/* Subtle Color Indicator */}
                <div
                    className="absolute bottom-0 left-0 h-0.5 w-full opacity-30"
                    style={{
                        background: `linear-gradient(to right, ${template.themeColor}, transparent)`,
                    }}
                />
            </div>
        </div>
    );
}
