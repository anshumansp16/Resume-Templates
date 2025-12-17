# Google Analytics Setup Guide

## Overview
Google Analytics (GA4) is **FREE** and requires no purchase. This guide will walk you through setting it up for your ResumePro application.

---

## Step 1: Create a Google Analytics Account

### 1.1 Go to Google Analytics
- Visit: [https://analytics.google.com](https://analytics.google.com)
- Sign in with your Google account (or create one if needed)

### 1.2 Create an Account
1. Click **"Start measuring"** or **"Admin"** (gear icon)
2. Click **"Create Account"**
3. Enter account details:
   - **Account Name**: `ResumePro` (or your preferred name)
   - Check data sharing settings (recommended: leave defaults)
   - Click **"Next"**

### 1.3 Create a Property
1. **Property Name**: `ResumePro Website`
2. **Reporting Time Zone**: Select your timezone
3. **Currency**: Select your currency
4. Click **"Next"**

### 1.4 Business Details
1. Select your industry category: `Technology` or `Business`
2. Select business size: Choose appropriate option
3. Select how you intend to use Google Analytics
4. Click **"Create"**

### 1.5 Accept Terms of Service
- Read and accept the Google Analytics Terms of Service
- Accept Data Processing Terms

---

## Step 2: Set Up Data Stream

### 2.1 Create Web Stream
1. You'll be prompted to set up a data stream
2. Select **"Web"**
3. Enter your website details:
   - **Website URL**:
     - For production: `https://yourresumepro.com`
     - For testing: `http://localhost:3000`
   - **Stream name**: `ResumePro Production` or `ResumePro Dev`
4. **Enhanced measurement**: Keep toggle ON (recommended)
   - This automatically tracks:
     - Page views
     - Scrolls
     - Outbound clicks
     - Site search
     - Video engagement
     - File downloads

### 2.2 Get Your Measurement ID
1. After creating the stream, you'll see your **Measurement ID**
2. It looks like: `G-XXXXXXXXXX` (starts with G-)
3. **COPY THIS ID** - you'll need it for your code

**Screenshot location**: Admin → Data Streams → [Your Stream] → **Measurement ID**

---

## Step 3: Configure Your Application

### 3.1 Add Measurement ID to Environment Variables
1. Open `/resumepro-client/.env.local`
2. Replace the empty value with your Measurement ID:
   ```env
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```
3. Save the file

### 3.2 Restart Your Development Server
```bash
# Stop the current server (Ctrl+C)
# Start it again
npm run dev
```

---

## Step 4: Implementation (Already Done!)

The following components have been automatically created for you:

### Files Created:
1. **`lib/analytics.tsx`** - Google Analytics component
2. **`lib/gtag.ts`** - Event tracking utilities
3. **`app/layout.tsx`** - Updated with GA tracking

### What's Tracked Automatically:
- ✅ Page views
- ✅ Page navigation
- ✅ Scroll depth
- ✅ Outbound link clicks

### Custom Events You Can Track:
```typescript
// Example: Track resume downloads
trackEvent('resume_download', {
  template_id: 'modern-professional',
  user_type: 'free'
});

// Example: Track template selection
trackEvent('template_select', {
  template_name: 'Creative Resume',
  category: 'premium'
});
```

---

## Step 5: Verify Installation

### 5.1 Test in Development
1. Start your dev server: `npm run dev`
2. Open your app in browser: `http://localhost:3000`
3. Navigate between pages

### 5.2 Check Real-Time Reports
1. Go to Google Analytics: [https://analytics.google.com](https://analytics.google.com)
2. Navigate to: **Reports** → **Realtime**
3. You should see:
   - Active users (yourself)
   - Page views
   - Events

### 5.3 Use Google Tag Assistant (Optional)
1. Install Chrome Extension: [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
2. Visit your website
3. Click the extension icon
4. Verify that GA4 tag is present and firing

---

## Step 6: Production Deployment

### Before Deploying:
1. ✅ Verify `NEXT_PUBLIC_GA_ID` is set in `.env.local`
2. ✅ Add the same variable to your hosting platform's environment variables

### On Netlify:
1. Go to: **Site Settings** → **Environment Variables**
2. Add variable:
   - **Key**: `NEXT_PUBLIC_GA_ID`
   - **Value**: `G-XXXXXXXXXX`
3. Redeploy your site

### On Vercel:
1. Go to: **Project Settings** → **Environment Variables**
2. Add variable:
   - **Key**: `NEXT_PUBLIC_GA_ID`
   - **Value**: `G-XXXXXXXXXX`
3. Redeploy your site

---

## Common Events to Track

Here are useful events for your ResumePro application:

### User Actions
```typescript
// When user starts creating resume
trackEvent('resume_creation_started', {
  template_id: 'modern-professional'
});

// When user completes resume
trackEvent('resume_completed', {
  template_id: 'modern-professional',
  sections_filled: 5
});

// When user downloads resume
trackEvent('resume_download', {
  template_id: 'modern-professional',
  format: 'pdf'
});
```

### E-commerce Tracking
```typescript
// When user views pricing
trackEvent('view_pricing', {});

// When user initiates checkout
trackEvent('begin_checkout', {
  value: 49,
  currency: 'INR',
  items: [{
    item_id: 'resume_download',
    item_name: 'Resume Download',
    price: 49
  }]
});

// When payment succeeds
trackEvent('purchase', {
  transaction_id: paymentId,
  value: 49,
  currency: 'INR',
  items: [{
    item_id: 'resume_download',
    item_name: 'Resume Download',
    price: 49
  }]
});
```

---

## Understanding Your Reports

### Key Reports to Monitor:

1. **Realtime Report**
   - See current active users
   - View pages being visited right now
   - Monitor events as they happen

2. **Acquisition Report**
   - How users find your site
   - Traffic sources (Google, Direct, Social, etc.)

3. **Engagement Report**
   - Most popular pages
   - Average engagement time
   - Events by type

4. **Conversions Report**
   - Track your custom events
   - Monitor resume downloads
   - Track purchases

---

## Privacy & GDPR Compliance

### Required Actions:
1. **Add Privacy Policy**
   - Disclose that you use Google Analytics
   - Explain what data is collected
   - Provide opt-out instructions

2. **Cookie Consent Banner**
   - Consider adding a cookie consent banner
   - Allow users to opt out of tracking
   - Common libraries: `react-cookie-consent`, `cookiebot`

3. **Anonymize IPs (Already Configured)**
   - GA4 automatically anonymizes IPs by default

---

## Troubleshooting

### Not Seeing Data?
1. ✅ Check that `NEXT_PUBLIC_GA_ID` is set correctly
2. ✅ Verify ID starts with `G-` (not `UA-` which is old Universal Analytics)
3. ✅ Restart dev server after changing `.env.local`
4. ✅ Check browser console for errors
5. ✅ Disable ad blockers (they block GA)
6. ✅ Wait 24-48 hours for data to fully populate

### Data Delayed?
- Real-time reports show immediate data
- Standard reports can take 24-48 hours to process

### Development Mode Data?
- GA4 tracks localhost by default
- Use separate properties for dev/prod if desired

---

## Cost Breakdown

### Google Analytics 4 (GA4)
- **Cost**: FREE ✅
- **Limits**:
  - Up to 10 million events per month (more than enough)
  - Unlimited properties and data streams
- **No credit card required**

### What You Don't Need to Buy:
- ❌ No premium version needed for most businesses
- ❌ No monthly subscription
- ❌ No setup fees

### Optional Paid Tools (NOT Required):
- Google Analytics 360: $150,000+/year (enterprise only)
- Third-party analytics tools: Vary in price

**For ResumePro**: The free GA4 is perfect and more than sufficient!

---

## Next Steps

1. ✅ Create Google Analytics account (FREE)
2. ✅ Get your Measurement ID (G-XXXXXXXXXX)
3. ✅ Add to `.env.local`
4. ✅ Restart dev server
5. ✅ Test with real-time reports
6. ✅ Deploy to production with environment variable
7. ✅ Add privacy policy
8. ✅ Monitor your data!

---

## Support Resources

- **Google Analytics Help**: [support.google.com/analytics](https://support.google.com/analytics)
- **GA4 Documentation**: [developers.google.com/analytics/devguides/collection/ga4](https://developers.google.com/analytics/devguides/collection/ga4)
- **Analytics Academy**: [analytics.google.com/analytics/academy](https://analytics.google.com/analytics/academy) (FREE courses)

---

## Summary

🎉 **Total Cost**: $0.00 (FREE)
⏱️ **Setup Time**: 10-15 minutes
📊 **Data Available**: Real-time + Historical
🔒 **Privacy**: GDPR-compliant with proper setup

Google Analytics is completely free and provides powerful insights into how users interact with your ResumePro application!
