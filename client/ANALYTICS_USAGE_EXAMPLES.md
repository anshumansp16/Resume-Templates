# Google Analytics Usage Examples

This document shows how to implement tracking in various parts of your ResumePro application.

---

## Import the Functions

```typescript
import {
  trackEvent,
  trackResumeDownload,
  trackTemplateSelect,
  trackPurchase,
  trackButtonClick,
  // ... other tracking functions
} from "@/lib/gtag";
```

---

## Example 1: Track Template Selection

**File**: `app/templates/page.tsx` or template selection component

```typescript
"use client";

import { trackTemplateSelect } from "@/lib/gtag";

function TemplateCard({ template }) {
  const handleSelectTemplate = () => {
    // Track the template selection
    trackTemplateSelect(template.name, template.category);

    // Continue with your logic
    router.push(`/builder?template=${template.id}`);
  };

  return (
    <button onClick={handleSelectTemplate}>
      Select Template
    </button>
  );
}
```

---

## Example 2: Track Resume Download

**File**: `app/payment-success/page.tsx`

```typescript
"use client";

import { trackResumeDownload } from "@/lib/gtag";

const handleDownloadResume = async () => {
  setDownloading(true);

  try {
    // Your existing download logic...
    const response = await axios.get(`${serverUrl}/api/download/${downloadToken}`);

    // ... PDF generation code ...

    // Track the download
    trackResumeDownload(templateId || 'unknown', 'pdf');

    toast.success("Resume downloaded successfully!");
  } catch (error) {
    console.error("Error downloading resume:", error);
    toast.error("Failed to download resume. Please try again.");
  } finally {
    setDownloading(false);
  }
};
```

---

## Example 3: Track Purchase Completion

**File**: `app/payment-success/page.tsx`

```typescript
"use client";

import { trackPurchase } from "@/lib/gtag";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");

  // Track purchase when page loads
  useEffect(() => {
    if (paymentId) {
      trackPurchase(paymentId, 49, "INR");
    }
  }, [paymentId]);

  // ... rest of component
}
```

---

## Example 4: Track Checkout Initiation

**File**: `app/checkout/page.tsx` or payment component

```typescript
"use client";

import { trackBeginCheckout } from "@/lib/gtag";

const handleStartCheckout = async () => {
  // Track checkout initiation
  trackBeginCheckout(49, "INR");

  // Initialize Razorpay
  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: 4900,
    // ... other options
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};
```

---

## Example 5: Track Button Clicks

**File**: Any component with important buttons

```typescript
"use client";

import { trackButtonClick } from "@/lib/gtag";

function CTAButton() {
  const handleClick = () => {
    trackButtonClick("Get Started", "Homepage Hero");
    router.push("/builder");
  };

  return (
    <button onClick={handleClick}>
      Get Started Free
    </button>
  );
}
```

---

## Example 6: Track Resume Creation Start

**File**: `app/builder/page.tsx`

```typescript
"use client";

import { trackResumeCreationStarted } from "@/lib/gtag";
import { useEffect } from "react";

function ResumeBuilder() {
  const templateId = searchParams.get("template") || "default";

  useEffect(() => {
    // Track when user starts creating a resume
    trackResumeCreationStarted(templateId);
  }, [templateId]);

  // ... rest of component
}
```

---

## Example 7: Track Form Submissions

**File**: Contact form or any form component

```typescript
"use client";

import { trackFormSubmit } from "@/lib/gtag";

function ContactForm() {
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Track form submission
      trackFormSubmit("Contact Form");

      // Submit form
      await submitForm(formData);

      toast.success("Form submitted successfully!");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

---

## Example 8: Track Errors

**File**: Any error handling component

```typescript
"use client";

import { trackError } from "@/lib/gtag";

const handleDownload = async () => {
  try {
    // ... download logic
  } catch (error) {
    // Track the error
    trackError(
      error.message || "Download failed",
      "PaymentSuccess/handleDownloadResume"
    );

    toast.error("Failed to download. Please try again.");
  }
};
```

---

## Example 9: Track Custom Events

**File**: Any component where you need custom tracking

```typescript
"use client";

import { trackEvent } from "@/lib/gtag";

function FeatureComponent() {
  const handleFeatureUse = () => {
    // Track any custom event
    trackEvent("feature_used", {
      feature_name: "AI Resume Review",
      user_type: "free",
      timestamp: new Date().toISOString(),
    });

    // Your feature logic...
  };
}
```

---

## Example 10: Track Page Views in App Router

**File**: `app/layout.tsx` or individual page components

```typescript
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { pageview } from "@/lib/gtag";

export function AnalyticsPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
      pageview(url);
    }
  }, [pathname, searchParams]);

  return null;
}
```

Then add to layout:
```typescript
import { AnalyticsPageView } from "@/components/analytics-pageview";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AnalyticsPageView />
        {children}
      </body>
    </html>
  );
}
```

---

## Complete Payment Success Page Example

Here's how to update your payment success page with full tracking:

```typescript
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trackPurchase, trackResumeDownload, trackButtonClick } from "@/lib/gtag";

function PaymentSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [downloading, setDownloading] = useState(false);

    const downloadToken = searchParams.get("token");
    const templateId = searchParams.get("templateId");
    const paymentId = searchParams.get("paymentId");

    // Track purchase on page load
    useEffect(() => {
        if (paymentId) {
            trackPurchase(paymentId, 49, "INR");
        }
    }, [paymentId]);

    const handleDownloadResume = async () => {
        if (!downloadToken || !templateId) {
            toast.error("Missing download information");
            return;
        }

        setDownloading(true);
        try {
            const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5001";
            const response = await axios.get(`${serverUrl}/api/download/${downloadToken}`);
            const { resumeData } = response.data;

            // ... PDF generation code ...

            // Track successful download
            trackResumeDownload(templateId, 'pdf');

            toast.success("Resume downloaded successfully!");
        } catch (error) {
            console.error("Error downloading resume:", error);
            toast.error("Failed to download resume. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    const handleGoHome = () => {
        trackButtonClick("Return Home", "Payment Success");
        router.push("/");
    };

    return (
        // ... your JSX
    );
}
```

---

## Best Practices

### 1. Track Meaningful Events
- Focus on user actions that provide business insights
- Track conversion points (downloads, purchases, signups)
- Track feature usage to understand what users value

### 2. Keep Event Names Consistent
```typescript
// Good: Use consistent naming conventions
trackEvent("resume_download", { ... });
trackEvent("resume_completed", { ... });

// Bad: Inconsistent naming
trackEvent("downloadResume", { ... });
trackEvent("Resume_Complete", { ... });
```

### 3. Add Useful Context
```typescript
// Good: Include context
trackEvent("button_click", {
  button_name: "Get Started",
  location: "Homepage Hero",
  user_type: "guest"
});

// Bad: Missing context
trackEvent("click");
```

### 4. Handle Errors Gracefully
All tracking functions already handle missing GA_ID gracefully, but you should still wrap critical tracking in try-catch:

```typescript
try {
  trackPurchase(paymentId, amount, currency);
} catch (error) {
  // Tracking failed, but don't disrupt user experience
  console.error("Analytics tracking failed:", error);
}
```

### 5. Don't Track Sensitive Information
```typescript
// Bad: Don't track PII
trackEvent("user_signup", {
  email: "user@example.com",  // ❌ Don't do this
  phone: "1234567890"          // ❌ Don't do this
});

// Good: Track without PII
trackEvent("user_signup", {
  signup_method: "google",
  user_type: "individual"
});
```

---

## Testing Your Implementation

### 1. Enable Google Analytics in `.env.local`
```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Check Browser Console
Open Chrome DevTools → Network tab → Filter by "collect"
- You should see requests to `https://www.google-analytics.com/g/collect`

### 4. Check Real-Time Reports
1. Go to Google Analytics
2. Navigate to: Reports → Realtime
3. Perform actions in your app
4. See events appear in real-time

---

## Common Issues

### Events Not Showing Up?
- Check that `NEXT_PUBLIC_GA_ID` is set correctly
- Restart your dev server after changing `.env.local`
- Disable ad blockers (they block GA)
- Wait a few seconds for real-time data

### Duplicate Events?
- Ensure you're not calling tracking functions multiple times
- Check that components aren't re-rendering unnecessarily
- Use `useEffect` with proper dependencies

### Events in Development?
- GA tracks localhost by default
- Consider creating separate GA properties for dev/prod
- Or filter out localhost traffic in GA settings

---

## Summary

Key integration points:
1. ✅ Import tracking functions from `@/lib/gtag`
2. ✅ Call tracking functions at appropriate moments
3. ✅ Add context parameters for better insights
4. ✅ Test with Real-Time reports
5. ✅ Monitor and iterate based on data

Happy tracking! 📊
