export interface PersonalInfo {
    name: string;
    email: string;
    phone: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
}

export interface WorkExperience {
    id: string;
    company: string;
    role: string;
    startDate: string;
    endDate?: string; // null if current
    location?: string;
    achievements: string[]; // Can be AI-generated
}

export interface Education {
    id: string;
    degree: string;
    institution: string;
    location?: string;
    startDate: string;
    endDate: string;
    gpa?: string;
    honors?: string;
}

export interface Project {
    id: string;
    name: string;
    description: string; // Can be AI-generated
    technologies?: string[];
    link?: string;
    highlights?: string[]; // Can be AI-generated
}

export interface Certification {
    id: string;
    name: string;
    issuer: string;
    date: string;
    link?: string;
}

export interface Skill {
    category: string;
    items: string[];
}

export interface ResumeData {
    personalInfo: PersonalInfo;
    summary?: string; // AI-generated based on experience
    workExperience: WorkExperience[];
    education: Education[];
    skills: Skill[];
    projects?: Project[];
    certifications?: Certification[];
    achievements?: string[]; // AI-generated key achievements
}

export interface ResumeFormData extends ResumeData {
    templateId: string;
    aiGenerated: {
        summary: boolean;
        achievements: boolean;
        workAchievements: string[]; // IDs of work experiences with AI achievements
        projectDescriptions: string[]; // IDs of projects with AI descriptions
    };
}
