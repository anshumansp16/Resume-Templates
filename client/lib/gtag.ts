// Google Analytics utility functions

// Extend the Window interface to include gtag
declare global {
    interface Window {
        gtag: (
            command: string,
            targetId: string,
            config?: Record<string, any>
        ) => void;
    }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || "";

// Track page views
export const pageview = (url: string) => {
    if (!GA_TRACKING_ID) return;

    window.gtag("config", GA_TRACKING_ID, {
        page_path: url,
    });
};

// Track custom events
export const trackEvent = (
    eventName: string,
    eventParams?: Record<string, any>
) => {
    if (!GA_TRACKING_ID) return;

    window.gtag("event", eventName, eventParams);
};

// Predefined event tracking functions for common actions

// Track resume creation start
export const trackResumeCreationStarted = (templateId: string) => {
    trackEvent("resume_creation_started", {
        template_id: templateId,
    });
};

// Track resume completion
export const trackResumeCompleted = (templateId: string, sectionsFilled: number) => {
    trackEvent("resume_completed", {
        template_id: templateId,
        sections_filled: sectionsFilled,
    });
};

// Track resume download
export const trackResumeDownload = (templateId: string, format: string = "pdf") => {
    trackEvent("resume_download", {
        template_id: templateId,
        format: format,
    });
};

// Track template selection
export const trackTemplateSelect = (templateName: string, category: string) => {
    trackEvent("template_select", {
        template_name: templateName,
        category: category,
    });
};

// Track pricing page view
export const trackViewPricing = () => {
    trackEvent("view_pricing", {});
};

// Track checkout initiation
export const trackBeginCheckout = (value: number, currency: string = "INR") => {
    trackEvent("begin_checkout", {
        value: value,
        currency: currency,
        items: [
            {
                item_id: "resume_download",
                item_name: "Resume Download",
                price: value,
            },
        ],
    });
};

// Track successful purchase
export const trackPurchase = (
    transactionId: string,
    value: number,
    currency: string = "INR"
) => {
    trackEvent("purchase", {
        transaction_id: transactionId,
        value: value,
        currency: currency,
        items: [
            {
                item_id: "resume_download",
                item_name: "Resume Download",
                price: value,
            },
        ],
    });
};

// Track button clicks
export const trackButtonClick = (buttonName: string, location: string) => {
    trackEvent("button_click", {
        button_name: buttonName,
        location: location,
    });
};

// Track form submission
export const trackFormSubmit = (formName: string) => {
    trackEvent("form_submit", {
        form_name: formName,
    });
};

// Track error events
export const trackError = (errorMessage: string, errorLocation: string) => {
    trackEvent("error_occurred", {
        error_message: errorMessage,
        error_location: errorLocation,
    });
};
