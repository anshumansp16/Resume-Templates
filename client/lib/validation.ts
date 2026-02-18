// Form validation utilities

export interface ValidationError {
  field: string;
  message: string;
}

export const validateEmail = (email: string): string | null => {
  if (!email) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone) return null; // Phone is optional
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  if (!phoneRegex.test(phone)) return "Please enter a valid phone number";
  if (phone.replace(/\D/g, '').length < 10) return "Phone number must be at least 10 digits";
  return null;
};

export const validateUrl = (url: string): string | null => {
  if (!url) return null; // URL is optional
  try {
    new URL(url);
    return null;
  } catch {
    return "Please enter a valid URL (e.g., https://linkedin.com/in/yourname)";
  }
};

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || value.trim().length === 0) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateLength = (
  value: string,
  min: number,
  max: number,
  fieldName: string
): string | null => {
  if (!value) return null;
  const length = value.trim().length;
  if (length < min) return `${fieldName} must be at least ${min} characters`;
  if (length > max) return `${fieldName} must be less than ${max} characters`;
  return null;
};

export const validateDate = (dateStr: string, fieldName: string): string | null => {
  if (!dateStr) return `${fieldName} is required`;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return `Please enter a valid date`;
  if (date > new Date()) return `${fieldName} cannot be in the future`;
  return null;
};

export const validateDateRange = (
  startDate: string,
  endDate: string,
  isPresent: boolean
): string | null => {
  if (!startDate) return "Start date is required";

  const start = new Date(startDate);
  if (isNaN(start.getTime())) return "Invalid start date";

  if (!isPresent) {
    if (!endDate) return "End date is required (or check 'Present')";
    const end = new Date(endDate);
    if (isNaN(end.getTime())) return "Invalid end date";
    if (end <= start) return "End date must be after start date";
  }

  return null;
};
