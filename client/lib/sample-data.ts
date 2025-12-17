import { ResumeData, ResumeFormData } from "./types";

export const sampleResumeData: ResumeFormData = {
    templateId: "",
    personalInfo: {
        name: "Alex Jordan",
        email: "alex.jordan@email.com",
        phone: "+1 (555) 123-4567",
        location: "San Francisco, CA",
        linkedin: "linkedin.com/in/alexjordan",
        github: "github.com/alexjordan",
        website: "alexjordan.dev",
    },
    summary: "Results-driven professional with 5+ years of experience delivering innovative solutions and driving business growth. Proven track record of leading cross-functional teams, implementing strategic initiatives, and exceeding performance metrics. Passionate about leveraging technology to solve complex problems and create meaningful impact.",
    workExperience: [
        {
            id: "1",
            company: "TechCorp Solutions",
            role: "Senior Product Manager",
            startDate: "Jan 2022",
            endDate: "Present",
            location: "San Francisco, CA",
            achievements: [
                "Led development of flagship product serving 100K+ users, resulting in 45% revenue increase",
                "Managed cross-functional team of 12 engineers, designers, and data analysts",
                "Implemented agile methodologies that improved sprint velocity by 35%",
                "Launched 3 major features that increased user engagement by 60%"
            ]
        },
        {
            id: "2",
            company: "InnovateTech Inc",
            role: "Product Manager",
            startDate: "Mar 2020",
            endDate: "Dec 2021",
            location: "San Francisco, CA",
            achievements: [
                "Drove product strategy for B2B SaaS platform with $5M ARR",
                "Collaborated with stakeholders to define product roadmap and priorities",
                "Increased customer retention by 25% through feature optimization",
                "Conducted user research with 200+ customers to inform product decisions"
            ]
        },
        {
            id: "3",
            company: "StartupHub",
            role: "Associate Product Manager",
            startDate: "Jun 2019",
            endDate: "Feb 2020",
            location: "San Francisco, CA",
            achievements: [
                "Supported product development for early-stage startup (Seed funding)",
                "Analyzed user data and metrics to identify growth opportunities",
                "Created product specifications and user stories for engineering team"
            ]
        }
    ],
    education: [
        {
            id: "1",
            degree: "Master of Business Administration (MBA)",
            institution: "Stanford Graduate School of Business",
            location: "Stanford, CA",
            startDate: "2017",
            endDate: "2019",
            gpa: "3.8",
            honors: "Dean's List, Product Management Club President"
        },
        {
            id: "2",
            degree: "Bachelor of Science in Computer Science",
            institution: "University of California, Berkeley",
            location: "Berkeley, CA",
            startDate: "2013",
            endDate: "2017",
            gpa: "3.7",
            honors: "Magna Cum Laude, Upsilon Pi Epsilon"
        }
    ],
    skills: [
        {
            category: "Product Management",
            items: ["Product Strategy", "Roadmap Planning", "User Research", "Data Analysis", "A/B Testing", "Agile/Scrum"]
        },
        {
            category: "Technical Skills",
            items: ["SQL", "Python", "Google Analytics", "Mixpanel", "Figma", "Jira"]
        },
        {
            category: "Soft Skills",
            items: ["Leadership", "Communication", "Stakeholder Management", "Problem Solving", "Strategic Thinking"]
        }
    ],
    projects: [
        {
            id: "1",
            name: "AI-Powered Recommendation Engine",
            description: "Designed and launched ML-based recommendation system that increased user engagement by 40% and drove $2M in additional revenue",
            technologies: ["Python", "TensorFlow", "AWS"],
            link: ""
        },
        {
            id: "2",
            name: "Mobile App Redesign",
            description: "Led complete redesign of mobile application, improving App Store rating from 3.2 to 4.7 stars",
            technologies: ["React Native", "Figma"],
            link: ""
        }
    ],
    certifications: [
        {
            id: "1",
            name: "Certified Scrum Product Owner (CSPO)",
            issuer: "Scrum Alliance",
            date: "2022",
            link: ""
        },
        {
            id: "2",
            name: "Google Analytics Individual Qualification",
            issuer: "Google",
            date: "2021",
            link: ""
        }
    ],
    aiGenerated: {
        summary: false,
        achievements: false,
        workAchievements: [],
        projectDescriptions: []
    }
};
