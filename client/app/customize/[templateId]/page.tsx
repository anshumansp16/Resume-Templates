"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useResumeStore } from "@/lib/resume-store";
import { templates } from "@/lib/template-config";
import {
    ArrowLeft,
    Sparkles,
    Loader2,
    Plus,
    Trash2,
    Briefcase,
    GraduationCap,
    Award,
    Code,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import axios from "axios";
import { WorkExperience, Education, Project, Certification } from "@/lib/types";
import { LinkedInImport } from "@/components/linkedin-import";
import { PDFImport } from "@/components/pdf-import";
import { InputDialog } from "@/components/ui/input-dialog";
import { FormInput } from "@/components/ui/form-input";
import { validateEmail, validatePhone, validateUrl, validateRequired } from "@/lib/validation";
import toast, { Toaster } from 'react-hot-toast';
import { trackResumeCreationStarted, trackResumeCompleted } from "@/lib/gtag";
import { sampleResumeData } from "@/lib/sample-data";

interface CustomizePageProps {
    params: Promise<{ templateId: string }>;
}

export default function CustomizePage({ params }: CustomizePageProps) {
    const router = useRouter();
    const { resumeData, updateResumeData } = useResumeStore();

    const [templateId, setTemplateId] = useState<string | null>(null);

    // Personal Information
    const [name, setName] = useState(resumeData?.personalInfo?.name || "");
    const [email, setEmail] = useState(resumeData?.personalInfo?.email || "");
    const [phone, setPhone] = useState(resumeData?.personalInfo?.phone || "");
    const [location, setLocation] = useState(resumeData?.personalInfo?.location || "");
    const [linkedin, setLinkedin] = useState(resumeData?.personalInfo?.linkedin || "");
    const [github, setGithub] = useState(resumeData?.personalInfo?.github || "");
    const [website, setWebsite] = useState(resumeData?.personalInfo?.website || "");

    // Professional Summary
    const [summary, setSummary] = useState(resumeData?.summary || "");

    // Work Experience (multiple)
    const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>(
        resumeData?.workExperience || [{
            id: "exp-1",
            company: "",
            role: "",
            startDate: "",
            endDate: "",
            achievements: []
        }]
    );

    // Education (multiple)
    const [educationList, setEducationList] = useState<Education[]>(
        resumeData?.education || [{
            id: "edu-1",
            degree: "",
            institution: "",
            startDate: "",
            endDate: ""
        }]
    );

    // Skills
    const [skillsText, setSkillsText] = useState("");

    // Projects (optional)
    const [projects, setProjects] = useState<Project[]>(
        resumeData?.projects || []
    );

    // Certifications (optional)
    const [certifications, setCertifications] = useState<Certification[]>(
        resumeData?.certifications || []
    );

    const [generating, setGenerating] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(1);

    // Input dialog state
    const [inputDialogOpen, setInputDialogOpen] = useState(false);
    const [currentExpId, setCurrentExpId] = useState<string | null>(null);

    // Validation errors
    const [validationErrors, setValidationErrors] = useState<Record<string, string | null>>({});

    useEffect(() => {
        params.then((p) => {
            setTemplateId(p.templateId);
            // Track resume creation started
            trackResumeCreationStarted(p.templateId);
        });
    }, [params]);

    const template = templates.find((t) => t.id === templateId);

    // Determine which fields are relevant for this template category
    const isNonTechRole = () => {
        const category = template?.category || '';
        return ['Sales', 'Marketing', 'Finance', 'Healthcare', 'Business', 'Executive'].includes(category);
    };

    const showGitHub = () => {
        return template?.category === 'Technology' || template?.category === 'Design';
    };

    const showLinkedIn = () => {
        // LinkedIn is useful for most professional roles
        return true;
    };

    // Add Work Experience
    const addWorkExperience = () => {
        setWorkExperiences([...workExperiences, {
            id: `exp-${Date.now()}`,
            company: "",
            role: "",
            startDate: "",
            endDate: "",
            achievements: []
        }]);
    };

    // Remove Work Experience
    const removeWorkExperience = (id: string) => {
        if (workExperiences.length === 1) {
            toast.error('You must have at least one work experience entry.', {
                duration: 3000,
            });
            return;
        }

        const exp = workExperiences.find(e => e.id === id);
        const companyName = exp?.company || 'this entry';

        toast((t) => (
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="font-semibold">Delete Work Experience?</span>
                </div>
                <p className="text-sm text-zinc-600">
                    Are you sure you want to remove {companyName}?
                </p>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                        }}
                        className="px-4 py-2 text-sm rounded-lg border border-zinc-300 hover:bg-zinc-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            setWorkExperiences(workExperiences.filter(e => e.id !== id));
                            toast.dismiss(t.id);
                            toast.success('Work experience removed', { duration: 2000 });
                        }}
                        className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600"
                    >
                        Delete
                    </button>
                </div>
            </div>
        ), {
            duration: Infinity,
            style: { maxWidth: '400px' }
        });
    };

    // Update Work Experience
    const updateWorkExperience = (id: string, field: keyof WorkExperience, value: any) => {
        setWorkExperiences(workExperiences.map(exp =>
            exp.id === id ? { ...exp, [field]: value } : exp
        ));
    };

    // Add Education
    const addEducation = () => {
        setEducationList([...educationList, {
            id: `edu-${Date.now()}`,
            degree: "",
            institution: "",
            startDate: "",
            endDate: ""
        }]);
    };

    // Remove Education
    const removeEducation = (id: string) => {
        if (educationList.length === 1) {
            toast.error('You must have at least one education entry.', {
                duration: 3000,
            });
            return;
        }

        const edu = educationList.find(e => e.id === id);
        const institutionName = edu?.institution || 'this entry';

        toast((t) => (
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="font-semibold">Delete Education?</span>
                </div>
                <p className="text-sm text-zinc-600">
                    Are you sure you want to remove {institutionName}?
                </p>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-4 py-2 text-sm rounded-lg border border-zinc-300 hover:bg-zinc-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            setEducationList(educationList.filter(e => e.id !== id));
                            toast.dismiss(t.id);
                            toast.success('Education entry removed', { duration: 2000 });
                        }}
                        className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600"
                    >
                        Delete
                    </button>
                </div>
            </div>
        ), {
            duration: Infinity,
            style: { maxWidth: '400px' }
        });
    };

    // Update Education
    const updateEducation = (id: string, field: keyof Education, value: string) => {
        setEducationList(educationList.map(edu =>
            edu.id === id ? { ...edu, [field]: value } : edu
        ));
    };

    // Add Project
    const addProject = () => {
        setProjects([...projects, {
            id: `proj-${Date.now()}`,
            name: "",
            description: "",
            technologies: []
        }]);
    };

    // Remove Project
    const removeProject = (id: string) => {
        setProjects(projects.filter(proj => proj.id !== id));
    };

    // Update Project
    const updateProject = (id: string, field: keyof Project, value: any) => {
        setProjects(projects.map(proj =>
            proj.id === id ? { ...proj, [field]: value } : proj
        ));
    };

    // Add Certification
    const addCertification = () => {
        setCertifications([...certifications, {
            id: `cert-${Date.now()}`,
            name: "",
            issuer: "",
            date: ""
        }]);
    };

    // Remove Certification
    const removeCertification = (id: string) => {
        setCertifications(certifications.filter(cert => cert.id !== id));
    };

    // Update Certification
    const updateCertification = (id: string, field: keyof Certification, value: string) => {
        setCertifications(certifications.map(cert =>
            cert.id === id ? { ...cert, [field]: value } : cert
        ));
    };

    // AI Generation Functions
    const handleGenerateSummary = async () => {
        setGenerating("summary");
        try {
            const response = await axios.post("/api/generate", {
                type: "professionalSummary",
                context: {
                    role: workExperiences[0]?.role,
                    skills: skillsText.split(",").map(s => s.trim()),
                    industry: template?.category,
                    years: 3 // Could calculate from work experience
                },
            });

            if (response.data.success) {
                setSummary(response.data.generated);
            }
        } catch (error) {
            console.error("Error generating summary:", error);
            toast.error("Failed to generate summary. Please try again or contact support.");
        } finally {
            setGenerating(null);
        }
    };

    const handleGenerateAchievements = async (expId: string) => {
        setGenerating(`achievements-${expId}`);
        const exp = workExperiences.find(e => e.id === expId);
        if (!exp) return;

        try {
            const response = await axios.post("/api/generate", {
                type: "achievementBullets",
                context: {
                    role: exp.role,
                    company: exp.company,
                    count: 4,
                },
            });

            if (response.data.success) {
                const bullets = response.data.generated
                    .split("\n")
                    .filter((line: string) => line.trim());
                updateWorkExperience(expId, "achievements", bullets);
            }
        } catch (error) {
            console.error("Error generating achievements:", error);
            toast.error("Failed to generate achievements. Please try again or contact support.");
        } finally {
            setGenerating(null);
        }
    };

    const handleGenerateProjectDescription = async (projId: string) => {
        setGenerating(`project-${projId}`);
        const proj = projects.find(p => p.id === projId);
        if (!proj) return;

        try {
            const response = await axios.post("/api/generate", {
                type: "projectDescription",
                context: {
                    projectName: proj.name,
                    technologies: proj.technologies,
                },
            });

            if (response.data.success) {
                updateProject(projId, "description", response.data.generated);
            }
        } catch (error) {
            console.error("Error generating project description:", error);
            toast.error("Failed to generate description. Please try again or contact support.");
        } finally {
            setGenerating(null);
        }
    };

    // LinkedIn auto-fill handler
    const handleLinkedInData = (data: any) => {
        // Auto-fill personal information
        if (data.personalInfo) {
            if (data.personalInfo.name) setName(data.personalInfo.name);
            if (data.personalInfo.location) setLocation(data.personalInfo.location);
        }

        // Auto-fill summary
        if (data.summary) {
            setSummary(data.summary);
        }

        // Auto-fill work experience
        if (data.workExperience && data.workExperience.length > 0) {
            const experiences = data.workExperience.map((exp: any, index: number) => ({
                id: `exp-linkedin-${index}`,
                company: exp.company || "",
                role: exp.role || "",
                startDate: exp.startDate || "",
                endDate: exp.endDate || "",
                achievements: exp.description ? [exp.description] : []
            }));
            setWorkExperiences(experiences);
        }

        // Auto-fill education
        if (data.education && data.education.length > 0) {
            const educations = data.education.map((edu: any, index: number) => ({
                id: `edu-linkedin-${index}`,
                degree: edu.degree || "",
                institution: edu.institution || "",
                startDate: edu.startDate || "",
                endDate: edu.endDate || ""
            }));
            setEducationList(educations);
        }

        // Auto-fill skills
        if (data.skills && data.skills.length > 0) {
            setSkillsText(data.skills.join(", "));
        }

        // Auto-fill certifications
        if (data.certifications && data.certifications.length > 0) {
            const certs = data.certifications.map((cert: any, index: number) => ({
                id: `cert-linkedin-${index}`,
                name: cert.name || "",
                issuer: cert.issuer || "",
                date: cert.date || ""
            }));
            setCertifications(certs);
        }

        // Show success message and move to step 2
        setTimeout(() => setCurrentStep(2), 1000);
    };

    // PDF auto-fill handler
    const handlePDFData = (data: any) => {
        // Auto-fill personal information
        if (data.personalInfo) {
            if (data.personalInfo.name) setName(data.personalInfo.name);
            if (data.personalInfo.email) setEmail(data.personalInfo.email);
            if (data.personalInfo.phone) setPhone(data.personalInfo.phone);
            if (data.personalInfo.location) setLocation(data.personalInfo.location);
            if (data.personalInfo.linkedin) setLinkedin(data.personalInfo.linkedin);
            if (data.personalInfo.github) setGithub(data.personalInfo.github);
            if (data.personalInfo.website) setWebsite(data.personalInfo.website);
        }

        // Auto-fill summary
        if (data.summary) {
            setSummary(data.summary);
        }

        // Auto-fill work experience
        if (data.workExperience && data.workExperience.length > 0) {
            const experiences = data.workExperience.map((exp: any) => ({
                id: exp.id || `exp-pdf-${Date.now()}-${Math.random()}`,
                company: exp.company || "",
                role: exp.role || "",
                startDate: exp.startDate || "",
                endDate: exp.endDate || "",
                location: exp.location || "",
                achievements: exp.achievements || []
            }));
            setWorkExperiences(experiences);
        }

        // Auto-fill education
        if (data.education && data.education.length > 0) {
            const educations = data.education.map((edu: any) => ({
                id: edu.id || `edu-pdf-${Date.now()}-${Math.random()}`,
                degree: edu.degree || "",
                institution: edu.institution || "",
                location: edu.location || "",
                startDate: edu.startDate || "",
                endDate: edu.endDate || "",
                gpa: edu.gpa || "",
                honors: edu.honors || ""
            }));
            setEducationList(educations);
        }

        // Auto-fill skills
        if (data.skills && data.skills.length > 0) {
            // If skills are categorized, flatten them
            if (Array.isArray(data.skills) && data.skills[0]?.items) {
                const allSkills = data.skills.flatMap((cat: any) => cat.items || []);
                setSkillsText(allSkills.join(", "));
            } else if (Array.isArray(data.skills)) {
                setSkillsText(data.skills.join(", "));
            }
        }

        // Auto-fill projects
        if (data.projects && data.projects.length > 0) {
            const projs = data.projects.map((proj: any) => ({
                id: proj.id || `proj-pdf-${Date.now()}-${Math.random()}`,
                name: proj.name || "",
                description: proj.description || "",
                technologies: proj.technologies || [],
                link: proj.link || "",
                highlights: proj.highlights || []
            }));
            setProjects(projs);
        }

        // Auto-fill certifications
        if (data.certifications && data.certifications.length > 0) {
            const certs = data.certifications.map((cert: any) => ({
                id: cert.id || `cert-pdf-${Date.now()}-${Math.random()}`,
                name: cert.name || "",
                issuer: cert.issuer || "",
                date: cert.date || "",
                link: cert.link || ""
            }));
            setCertifications(certs);
        }

        // Check for missing fields and show notifications
        checkMissingFields(data);

        // Show success message
        toast.success('Resume data extracted successfully!', {
            icon: '✅',
            duration: 3000,
        });

        // Move to step 2
        setTimeout(() => setCurrentStep(2), 1000);
    };

    // Fill with sample data
    const fillWithSampleData = () => {
        // Fill personal info
        setName(sampleResumeData.personalInfo.name);
        setEmail(sampleResumeData.personalInfo.email);
        setPhone(sampleResumeData.personalInfo.phone);
        setLocation(sampleResumeData.personalInfo.location || "");
        setLinkedin(sampleResumeData.personalInfo.linkedin || "");
        setGithub(sampleResumeData.personalInfo.github || "");
        setWebsite(sampleResumeData.personalInfo.website || "");

        // Fill summary
        setSummary(sampleResumeData.summary || "");

        // Fill work experience
        setWorkExperiences(sampleResumeData.workExperience.map(exp => ({
            ...exp,
            location: exp.location || ""
        })));

        // Fill education
        setEducationList(sampleResumeData.education.map(edu => ({
            ...edu,
            location: edu.location || "",
            gpa: edu.gpa || "",
            honors: edu.honors || ""
        })));

        // Fill skills - convert from categorized to comma-separated
        const allSkills = sampleResumeData.skills
            .flatMap(category => category.items)
            .join(", ");
        setSkillsText(allSkills);

        // Fill projects
        if (sampleResumeData.projects && sampleResumeData.projects.length > 0) {
            setProjects(sampleResumeData.projects.map(proj => ({
                ...proj,
                link: proj.link || "",
                highlights: []
            })));
        }

        // Fill certifications
        if (sampleResumeData.certifications && sampleResumeData.certifications.length > 0) {
            setCertifications(sampleResumeData.certifications.map(cert => ({
                ...cert,
                link: cert.link || ""
            })));
        }

        // Show success message
        toast.success('Sample data loaded! Feel free to edit any field.', {
            icon: '✨',
            duration: 4000,
        });

        // Move to step 2 to show the filled data
        setTimeout(() => setCurrentStep(2), 500);
    };

    // Validate and show missing fields
    const checkMissingFields = (data: any) => {
        const missing: string[] = [];

        // Check personal info
        if (!data.personalInfo?.name) missing.push('Name');
        if (!data.personalInfo?.email) missing.push('Email');
        if (!data.personalInfo?.phone) missing.push('Phone');
        // Only check GitHub/LinkedIn if relevant for template category
        if (showGitHub() && !data.personalInfo?.github) missing.push('GitHub profile');
        if (showLinkedIn() && !data.personalInfo?.linkedin) missing.push('LinkedIn profile');

        // Check professional data
        if (!data.summary) missing.push('Professional summary');
        if (!data.workExperience || data.workExperience.length === 0) {
            missing.push('Work experience');
        }
        if (!data.education || data.education.length === 0) {
            missing.push('Education');
        }
        if (!data.skills || data.skills.length === 0) {
            missing.push('Skills');
        }

        // Show missing fields notification
        if (missing.length > 0) {
            toast((t) => (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 font-semibold">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        <span>Missing Information Detected</span>
                    </div>
                    <div className="text-sm text-zinc-600">
                        The following fields were not found in your resume:
                    </div>
                    <ul className="text-sm text-zinc-700 list-disc ml-5">
                        {missing.slice(0, 5).map((field, idx) => (
                            <li key={idx}>{field}</li>
                        ))}
                        {missing.length > 5 && <li>...and {missing.length - 5} more</li>}
                    </ul>
                    <div className="text-xs text-zinc-500 mt-2">
                        You can add these manually in the following steps.
                    </div>
                </div>
            ), {
                duration: 8000,
                icon: '⚠️',
                style: {
                    maxWidth: '500px',
                },
            });
        }
    };

    // Validate current step before proceeding
    const validateAndProceed = () => {
        const missing: string[] = [];

        switch (currentStep) {
            case 1:
                if (!name) missing.push('Name');
                if (!email) missing.push('Email');
                if (!phone) missing.push('Phone');
                break;
            case 2:
                if (!workExperiences.some(exp => exp.company && exp.role)) {
                    missing.push('At least one work experience with company and role');
                }
                break;
            case 3:
                if (!educationList.some(edu => edu.degree && edu.institution)) {
                    missing.push('At least one education entry with degree and institution');
                }
                break;
            case 4:
                if (!skillsText.trim()) {
                    missing.push('Skills');
                }
                break;
        }

        if (missing.length > 0) {
            toast.error(
                <div>
                    <div className="font-semibold mb-1">Required fields missing:</div>
                    <ul className="text-sm list-disc ml-4">
                        {missing.map((field, idx) => (
                            <li key={idx}>{field}</li>
                        ))}
                    </ul>
                </div>,
                { duration: 4000 }
            );
            return false;
        }

        return true;
    };

    const handlePreview = () => {
        // Save all data to store
        updateResumeData({
            templateId: templateId!,
            personalInfo: {
                name,
                email,
                phone,
                location,
                linkedin,
                github,
                website
            },
            summary,
            workExperience: workExperiences,
            education: educationList,
            skills: [{
                category: "Technical Skills",
                items: skillsText.split(",").map(s => s.trim()).filter(s => s)
            }],
            projects,
            certifications,
            aiGenerated: {
                summary: !!summary,
                achievements: workExperiences.some(exp => exp.achievements.length > 0),
                workAchievements: workExperiences.filter(exp => exp.achievements.length > 0).map(exp => exp.id),
                projectDescriptions: projects.filter(p => p.description).map(p => p.id)
            },
        });

        // Track resume completion
        const sectionsFilled = [
            name && email, // Personal info
            summary, // Summary
            workExperiences.some(exp => exp.company && exp.role), // Work experience
            educationList.some(edu => edu.degree && edu.institution), // Education
            skillsText.trim(), // Skills
            projects.length > 0, // Projects (optional)
            certifications.length > 0 // Certifications (optional)
        ].filter(Boolean).length;

        trackResumeCompleted(templateId!, sectionsFilled);

        router.push(`/preview/${templateId}`);
    };

    const isStepValid = (step: number): boolean => {
        switch (step) {
            case 1:
                return !!(name && email && phone);
            case 2:
                return workExperiences.some(exp => exp.company && exp.role);
            case 3:
                return educationList.some(edu => edu.degree && edu.institution);
            case 4:
                return !!skillsText;
            default:
                return true;
        }
    };

    if (!template) {
        return <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>;
    }

    // Get missing fields for current data
    const getMissingFieldsForCurrentStep = () => {
        const missing: string[] = [];

        switch (currentStep) {
            case 1:
                if (!name) missing.push('Name');
                if (!email) missing.push('Email');
                if (!phone) missing.push('Phone');
                // Only check GitHub/LinkedIn if relevant for this template
                if (showGitHub() && !github) missing.push('GitHub');
                if (showLinkedIn() && !linkedin) missing.push('LinkedIn');
                break;
            case 2:
                if (workExperiences.length === 0 || !workExperiences[0].company) missing.push('Work experience');
                break;
            case 3:
                if (educationList.length === 0 || !educationList[0].degree) missing.push('Education');
                break;
            case 4:
                if (!skillsText.trim()) missing.push('Skills');
                break;
        }

        return missing;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            {/* Toast Notifications */}
            <Toaster
                position="top-right"
                toastOptions={{
                    className: 'dark:bg-zinc-800 dark:text-white',
                    duration: 4000,
                }}
            />

            {/* Header */}
            <div className="border-b border-zinc-200 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80 sticky top-0 z-10">
                <div className="mx-auto max-w-5xl px-6 py-6">
                    <button
                        onClick={() => router.back()}
                        className="mb-4 flex items-center gap-2 text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to templates
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
                                    Customize {template.name}
                                </h1>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    Step {currentStep} of 5 · AI will help generate content
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mt-6 flex gap-2">
                        {[1, 2, 3, 4, 5].map((step) => (
                            <div
                                key={step}
                                className={`h-1 flex-1 rounded-full transition-colors ${step === currentStep
                                    ? `bg-gradient-to-r ${template.gradient}`
                                    : step < currentStep
                                        ? "bg-green-500"
                                        : "bg-zinc-200 dark:bg-zinc-700"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="mx-auto max-w-5xl px-6 py-8">
                <div className="space-y-6">

                    {/* Missing Fields Alert */}
                    {(() => {
                        const missing = getMissingFieldsForCurrentStep();
                        if (missing.length > 0) {
                            return (
                                <div className="rounded-xl border-l-4 border-orange-500 bg-orange-50 p-4 dark:bg-orange-900/20">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                                        <div className="flex-1">
                                            <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-200">
                                                Missing Required Information
                                            </h3>
                                            <p className="mt-1 text-sm text-orange-800 dark:text-orange-300">
                                                Please fill in the following fields: {missing.join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })()}

                    {/* Step 1: Personal Information */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            {/* Quick Start Options */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* LinkedIn Import */}
                                <LinkedInImport onDataExtracted={handleLinkedInData} />

                                {/* PDF Import */}
                                <PDFImport onDataExtracted={handlePDFData} />

                                {/* Sample Data */}
                                <button
                                    onClick={fillWithSampleData}
                                    className="group relative overflow-hidden rounded-xl border-2 border-dashed border-purple-300 bg-purple-50 p-6 transition-all hover:border-purple-400 hover:bg-purple-100 hover:shadow-lg dark:border-purple-700 dark:bg-purple-900/20 dark:hover:border-purple-600 dark:hover:bg-purple-900/30"
                                >
                                    <div className="flex flex-col items-center text-center gap-3">
                                        <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/40">
                                            <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                                                Try Sample Data
                                            </h3>
                                            <p className="mt-1 text-xs text-purple-700 dark:text-purple-300">
                                                See how it works with pre-filled example
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-zinc-200 dark:border-zinc-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 px-4 text-zinc-500 dark:text-zinc-400">
                                        or fill manually
                                    </span>
                                </div>
                            </div>

                            <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                                        <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                        Personal Information <span className="text-red-500">*</span>
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                            placeholder="john@example.com"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            Phone <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                            placeholder="+1 234 567 8900"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                            placeholder="City, Country"
                                        />
                                    </div>
                                    {showLinkedIn() && (
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                LinkedIn {showLinkedIn() && <span className="text-xs text-zinc-500">(Optional)</span>}
                                            </label>
                                            <input
                                                type="url"
                                                value={linkedin}
                                                onChange={(e) => setLinkedin(e.target.value)}
                                                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                                placeholder="linkedin.com/in/username"
                                            />
                                        </div>
                                    )}
                                    {showGitHub() && (
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                GitHub
                                            </label>
                                            <input
                                                type="url"
                                                value={github}
                                                onChange={(e) => setGithub(e.target.value)}
                                                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                                placeholder="github.com/username"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            Portfolio/Website
                                        </label>
                                        <input
                                            type="url"
                                            value={website}
                                            onChange={(e) => setWebsite(e.target.value)}
                                            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                            placeholder="yourwebsite.com"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Professional Summary */}
                            <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                        Professional Summary
                                    </h2>
                                    <button
                                        onClick={handleGenerateSummary}
                                        disabled={generating !== null}
                                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                                    >
                                        {generating === "summary" ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Sparkles className="h-4 w-4" />
                                        )}
                                        Generate with AI
                                    </button>
                                </div>
                                <textarea
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    rows={4}
                                    className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                    placeholder="AI will generate a professional summary based on your experience..."
                                />
                                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                                    💡 Complete work experience first for better AI-generated summary
                                </p>
                            </section>
                        </div>
                    )}

                    {/* Step 2: Work Experience */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            {/* Work Experience Header */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        {workExperiences.length} {workExperiences.length === 1 ? 'Experience' : 'Experiences'} Added
                                    </h3>
                                    {workExperiences.length > 1 && (
                                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                            (Click trash icon to remove)
                                        </span>
                                    )}
                                </div>
                            </div>

                            {workExperiences.map((exp, index) => (
                                <section
                                    key={exp.id}
                                    className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                                >
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                                                <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                                    Work Experience #{index + 1}
                                                </h2>
                                                {index === 0 && <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Required</span>}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeWorkExperience(exp.id)}
                                            className="rounded-lg p-3 sm:p-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                            title={workExperiences.length === 1 ? 'Cannot delete the only work experience' : 'Delete this work experience'}
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                Job Title {index === 0 && <span className="text-red-500">*</span>}
                                            </label>
                                            <input
                                                type="text"
                                                value={exp.role}
                                                onChange={(e) => updateWorkExperience(exp.id, "role", e.target.value)}
                                                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                                placeholder="Senior Software Engineer"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                Company {index === 0 && <span className="text-red-500">*</span>}
                                            </label>
                                            <input
                                                type="text"
                                                value={exp.company}
                                                onChange={(e) => updateWorkExperience(exp.id, "company", e.target.value)}
                                                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                                placeholder="Tech Corp"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                Start Date
                                            </label>
                                            <input
                                                type="text"
                                                value={exp.startDate}
                                                onChange={(e) => updateWorkExperience(exp.id, "startDate", e.target.value)}
                                                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                                placeholder="Jan 2020"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                End Date
                                            </label>
                                            <input
                                                type="text"
                                                value={exp.endDate || ""}
                                                onChange={(e) => updateWorkExperience(exp.id, "endDate", e.target.value)}
                                                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                                placeholder="Present"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <div className="mb-2 flex items-center justify-between">
                                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                Key Achievements
                                            </label>
                                            <button
                                                onClick={() => handleGenerateAchievements(exp.id)}
                                                disabled={generating !== null || !exp.role || !exp.company}
                                                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                                            >
                                                {generating === `achievements-${exp.id}` ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Sparkles className="h-4 w-4" />
                                                )}
                                                Generate with AI
                                            </button>
                                        </div>
                                        {exp.achievements && exp.achievements.length > 0 ? (
                                            <div className="space-y-2">
                                                {exp.achievements.map((achievement, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="group relative rounded-lg border border-zinc-200 bg-zinc-50 p-3 pr-10 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                                                    >
                                                        • {achievement}
                                                        <button
                                                            onClick={() => {
                                                                const newAchievements = exp.achievements.filter((_, i) => i !== idx);
                                                                updateWorkExperience(exp.id, "achievements", newAchievements);
                                                            }}
                                                            className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => {
                                                        setCurrentExpId(exp.id);
                                                        setInputDialogOpen(true);
                                                    }}
                                                    className="w-full rounded-lg border-2 border-dashed border-zinc-300 px-4 py-2 text-sm text-zinc-600 transition-colors hover:border-blue-500 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-400"
                                                >
                                                    + Add achievement manually
                                                </button>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                                Click "Generate with AI" to create achievement bullets or add manually
                                            </p>
                                        )}
                                    </div>
                                </section>
                            ))}

                            <button
                                onClick={addWorkExperience}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 px-6 py-4 font-semibold text-zinc-600 transition-colors hover:border-blue-500 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-blue-500 dark:hover:text-blue-400"
                            >
                                <Plus className="h-5 w-5" />
                                Add Another Work Experience
                            </button>
                        </div>
                    )}

                    {/* Step 3: Education */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            {educationList.map((edu, index) => (
                                <section
                                    key={edu.id}
                                    className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                                >
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                                                <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                                Education #{index + 1} {index === 0 && <span className="text-red-500">*</span>}
                                            </h2>
                                        </div>
                                        {educationList.length > 1 && (
                                            <button
                                                onClick={() => removeEducation(edu.id)}
                                                className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                            >
                                                <Trash2 className="h-5 w-5 sm:h-5 sm:w-5" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                Degree {index === 0 && <span className="text-red-500">*</span>}
                                            </label>
                                            <input
                                                type="text"
                                                value={edu.degree}
                                                onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                                                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                                placeholder="Bachelor of Science in Computer Science"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                Institution {index === 0 && <span className="text-red-500">*</span>}
                                            </label>
                                            <input
                                                type="text"
                                                value={edu.institution}
                                                onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                                                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                                placeholder="University of Technology"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                Start Date
                                            </label>
                                            <input
                                                type="text"
                                                value={edu.startDate}
                                                onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                                                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                                placeholder="2018"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                End Date
                                            </label>
                                            <input
                                                type="text"
                                                value={edu.endDate}
                                                onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                                                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                                placeholder="2022"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                Location
                                            </label>
                                            <input
                                                type="text"
                                                value={edu.location || ""}
                                                onChange={(e) => updateEducation(edu.id, "location", e.target.value)}
                                                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                                placeholder="City, State"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                GPA (optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={edu.gpa || ""}
                                                onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                                                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                                placeholder="3.8/4.0"
                                            />
                                        </div>
                                    </div>
                                </section>
                            ))}

                            <button
                                onClick={addEducation}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 px-6 py-4 font-semibold text-zinc-600 transition-colors hover:border-green-500 hover:text-green-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-green-500 dark:hover:text-green-400"
                            >
                                <Plus className="h-5 w-5" />
                                Add Another Education
                            </button>
                        </div>
                    )}

                    {/* Step 4: Skills */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                                        <Code className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                        Skills <span className="text-red-500">*</span>
                                    </h2>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        Enter your skills (comma-separated)
                                    </label>
                                    <textarea
                                        value={skillsText}
                                        onChange={(e) => setSkillsText(e.target.value)}
                                        rows={6}
                                        className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                        placeholder="JavaScript, TypeScript, React, Node.js, Python, FastAPI, PostgreSQL, MongoDB, Docker, AWS, Git"
                                    />
                                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                                        💡 Separate skills with commas. Examples: React, Python, AWS, Docker
                                    </p>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* Step 5: Projects & Certifications (Optional) */}
                    {currentStep === 5 && (
                        <div className="space-y-6">
                            {/* Projects */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                                            <Code className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                            Projects (Optional)
                                        </h2>
                                    </div>
                                    <button
                                        onClick={addProject}
                                        className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Project
                                    </button>
                                </div>

                                {projects.length === 0 ? (
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        No projects added yet. Click "Add Project" to include your projects.
                                    </p>
                                ) : (
                                    projects.map((proj) => (
                                        <section
                                            key={proj.id}
                                            className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                                        >
                                            <div className="mb-4 flex items-center justify-between">
                                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                                    Project
                                                </h3>
                                                <button
                                                    onClick={() => removeProject(proj.id)}
                                                    className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                                >
                                                    <Trash2 className="h-5 w-5 sm:h-5 sm:w-5" />
                                                </button>
                                            </div>

                                            <div className="grid gap-4">
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                        Project Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={proj.name}
                                                        onChange={(e) => updateProject(proj.id, "name", e.target.value)}
                                                        className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                                        placeholder="E-commerce Platform"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                            Description
                                                        </label>
                                                        <button
                                                            onClick={() => handleGenerateProjectDescription(proj.id)}
                                                            disabled={generating !== null || !proj.name}
                                                            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                                                        >
                                                            {generating === `project-${proj.id}` ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <Sparkles className="h-3 w-3" />
                                                            )}
                                                            AI Generate
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        value={proj.description}
                                                        onChange={(e) => updateProject(proj.id, "description", e.target.value)}
                                                        rows={3}
                                                        className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                                        placeholder="Brief description of your project..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                        Technologies (comma-separated)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={proj.technologies?.join(", ") || ""}
                                                        onChange={(e) => updateProject(proj.id, "technologies", e.target.value.split(",").map(t => t.trim()))}
                                                        className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                                        placeholder="React, Node.js, PostgreSQL"
                                                    />
                                                </div>
                                            </div>
                                        </section>
                                    ))
                                )}
                            </div>

                            {/* Certifications */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-900/30">
                                            <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                        </div>
                                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                            Certifications (Optional)
                                        </h2>
                                    </div>
                                    <button
                                        onClick={addCertification}
                                        className="flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Certification
                                    </button>
                                </div>

                                {certifications.length === 0 ? (
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        No certifications added yet. Click "Add Certification" to include your certifications.
                                    </p>
                                ) : (
                                    certifications.map((cert) => (
                                        <section
                                            key={cert.id}
                                            className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                                        >
                                            <div className="mb-4 flex items-center justify-between">
                                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                                    Certification
                                                </h3>
                                                <button
                                                    onClick={() => removeCertification(cert.id)}
                                                    className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                                >
                                                    <Trash2 className="h-5 w-5 sm:h-5 sm:w-5" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div className="sm:col-span-2">
                                                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                        Certification Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={cert.name}
                                                        onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                                                        className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                                        placeholder="AWS Solutions Architect"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                        Issuer
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={cert.issuer}
                                                        onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)}
                                                        className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                                        placeholder="Amazon Web Services"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                        Date
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={cert.date}
                                                        onChange={(e) => updateCertification(cert.id, "date", e.target.value)}
                                                        className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                                        placeholder="2023"
                                                    />
                                                </div>
                                            </div>
                                        </section>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between gap-4 pt-6">
                        {currentStep > 1 && (
                            <button
                                onClick={() => setCurrentStep(currentStep - 1)}
                                className="rounded-lg border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            >
                                Previous
                            </button>
                        )}
                        {currentStep < 5 ? (
                            <button
                                onClick={() => {
                                    if (validateAndProceed()) {
                                        setCurrentStep(currentStep + 1);
                                    }
                                }}
                                className={`ml-auto rounded-lg bg-gradient-to-r ${template.gradient} px-8 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105`}
                            >
                                Next Step
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    if (validateAndProceed()) {
                                        handlePreview();
                                    }
                                }}
                                className={`ml-auto rounded-lg bg-gradient-to-r ${template.gradient} px-8 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105`}
                            >
                                Preview Resume
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Input Dialog for Adding Achievements */}
            <InputDialog
                open={inputDialogOpen}
                onOpenChange={setInputDialogOpen}
                title="Add Achievement"
                description="Enter a key achievement or responsibility for this position"
                placeholder="e.g., Increased team productivity by 40% through process optimization"
                onConfirm={(value) => {
                    if (currentExpId) {
                        const exp = workExperiences.find(e => e.id === currentExpId);
                        if (exp) {
                            updateWorkExperience(currentExpId, "achievements", [...exp.achievements, value]);
                            toast.success("Achievement added successfully!");
                        }
                    }
                }}
                confirmText="Add Achievement"
            />
        </div>
    );
}
