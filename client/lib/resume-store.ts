import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ResumeFormData } from "./types";

interface ResumeStore {
    // Current resume data
    resumeData: Partial<ResumeFormData> | null;
    selectedTemplateId: string | null;

    // Actions
    setSelectedTemplate: (templateId: string) => void;
    updateResumeData: (data: Partial<ResumeFormData>) => void;
    clearResumeData: () => void;

    // AI generation cache
    aiGeneratedContent: Record<string, string>;
    cacheAIContent: (key: string, content: string) => void;
    getCachedAIContent: (key: string) => string | null;
}

export const useResumeStore = create<ResumeStore>()(
    persist(
        (set, get) => ({
            resumeData: null,
            selectedTemplateId: null,
            aiGeneratedContent: {},

            setSelectedTemplate: (templateId) =>
                set({ selectedTemplateId: templateId }),

            updateResumeData: (data) =>
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        ...data,
                    } as ResumeFormData,
                })),

            clearResumeData: () =>
                set({
                    resumeData: null,
                    selectedTemplateId: null,
                    aiGeneratedContent: {},
                }),

            cacheAIContent: (key, content) =>
                set((state) => ({
                    aiGeneratedContent: {
                        ...state.aiGeneratedContent,
                        [key]: content,
                    },
                })),

            getCachedAIContent: (key) => {
                return get().aiGeneratedContent[key] || null;
            },
        }),
        {
            name: "resume-storage",
            partialize: (state) => ({
                resumeData: state.resumeData,
                selectedTemplateId: state.selectedTemplateId,
                aiGeneratedContent: state.aiGeneratedContent,
            }),
        }
    )
);
