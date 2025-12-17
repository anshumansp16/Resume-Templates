export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  filename: string;
  themeColor: string;
  gradient: string;
}

export const templates: TemplateMetadata[] = [
  {
    id: "tech",
    name: "Technology & Engineering",
    description: "ATS-optimized for software engineers, developers, and tech professionals",
    category: "Technology",
    filename: "tech.html",
    themeColor: "#2563EB",
    gradient: "from-blue-600 to-blue-700",
  },
  {
    id: "executive",
    name: "Executive & Leadership",
    description: "Professional layout for C-level, directors, and senior management",
    category: "Executive",
    filename: "executive.html",
    themeColor: "#171717",
    gradient: "from-neutral-800 to-neutral-900",
  },
  {
    id: "business",
    name: "Business & Finance",
    description: "Clean design for MBA, finance, consulting, and business roles",
    category: "Business",
    filename: "business.html",
    themeColor: "#10B981",
    gradient: "from-emerald-600 to-emerald-700",
  },
  {
    id: "creative",
    name: "Creative & Design",
    description: "Elegant layout for designers, marketers, and creative professionals",
    category: "Creative",
    filename: "creative.html",
    themeColor: "#D4AF37",
    gradient: "from-yellow-600 to-yellow-700",
  },
  {
    id: "entry",
    name: "Entry Level & Internship",
    description: "Perfect for recent graduates, interns, and career starters",
    category: "Entry Level",
    filename: "entry.html",
    themeColor: "#525252",
    gradient: "from-neutral-600 to-neutral-700",
  },
];
