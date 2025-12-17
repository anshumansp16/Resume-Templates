# Environment Setup Guide

Follow these steps to configure your `.env` file:

## 1. Razorpay Setup (2 minutes)

### Get Razorpay API Keys:

1. **Sign up for Razorpay:**
   - Go to: https://dashboard.razorpay.com/signup
   - Use your email to create a free account

2. **Activate Test Mode:**
   - After login, make sure you're in **Test Mode** (toggle at top of dashboard)
   - Test mode lets you test payments without real money

3. **Get API Keys:**
   - Go to: Settings → API Keys
   - Click **Generate Test Keys**
   - You'll see two keys:
     - **Key ID** (starts with `rzp_test_`) - This is PUBLIC
     - **Key Secret** - This is PRIVATE, keep it secure

4. **Copy to .env:**
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx
   ```

### Example:
```env
RAZORPAY_KEY_ID=rzp_test_Ab12Cd34Ef56Gh78
RAZORPAY_KEY_SECRET=aBcDeFgHiJkLmNoPqRsTuVwXyZ123456
```

---

## 2. Gmail App Password Setup (3 minutes)

**IMPORTANT:** You need a Gmail App Password (16 digits), NOT your regular Gmail password!

### Steps:

1. **Enable 2-Step Verification:**
   - Go to: https://myaccount.google.com/security
   - Under "Signing in to Google", click **2-Step Verification**
   - Follow the steps to enable it (requires phone number)

2. **Generate App Password:**
   - After 2-Step is enabled, go to: https://myaccount.google.com/apppasswords
   - You might need to sign in again
   - Select app: **Mail**
   - Select device: **Other** (type "ResumePro")
   - Click **Generate**

3. **Copy the 16-digit password:**
   - Google will show a 16-character password like: `abcd efgh ijkl mnop`
   - Copy this (remove spaces if any)

4. **Update .env:**
   ```env
   EMAIL_USER=youremail@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop
   ```

### Example:
```env
EMAIL_USER=john.doe@gmail.com
EMAIL_PASSWORD=xyzw1234abcd5678
EMAIL_FROM=ResumePro <noreply@resumepro.com>
```

---

## 3. Verify Your Configuration

After updating `.env`, it should look like this:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Razorpay Credentials (FILLED)
RAZORPAY_KEY_ID=rzp_test_Ab12Cd34Ef56Gh78
RAZORPAY_KEY_SECRET=aBcDeFgHiJkLmNoPqRsTuVwXyZ123456

# Database
DATABASE_PATH=./database.sqlite

# Email Configuration (FILLED)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=john.doe@gmail.com
EMAIL_PASSWORD=xyzw1234abcd5678
EMAIL_FROM=ResumePro <noreply@resumepro.com>

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Payment Configuration
PAYMENT_AMOUNT=4900
PAYMENT_CURRENCY=INR

# Download Token Settings
DOWNLOAD_LINK_VALIDITY_DAYS=365
```

---

## 4. Test the Server

Start the server:
```bash
npm run dev
```

You should see:
```
🚀 ResumePro Server running on port 5000
📝 Environment: development
🌐 Frontend URL: http://localhost:3000
```

If you see this, congratulations! Your server is configured correctly.

---

## Common Errors

### Error: "Razorpay credentials not found"
- ✅ Make sure you copied both `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- ✅ Check there are no extra spaces
- ✅ Make sure the file is named exactly `.env` (not `.env.txt`)

### Error: "Invalid login" (Email)
- ✅ Use Gmail App Password (16 digits), NOT your regular password
- ✅ Enable 2-Step Verification first
- ✅ Make sure `EMAIL_USER` is your full Gmail address

### Error: "Authentication failed" (Email)
- ✅ Check if you removed spaces from the app password
- ✅ Try generating a new app password
- ✅ Make sure Less Secure Apps is NOT blocking (shouldn't be needed with app passwords)

---

## Quick Test

Once server is running, test the health endpoint:

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-12-11T..."
}
```

---

## Next Steps

1. ✅ Configure `.env` file
2. ✅ Start server: `npm run dev`
3. ✅ Configure frontend `.env.local`
4. ✅ Start frontend: `npm run dev` (in client directory)
5. ✅ Test payment flow!

---

## Security Note

⚠️ **NEVER commit `.env` file to Git!**

The `.gitignore` is already configured to exclude it, but double-check:
- `.env` should be listed in `.gitignore`
- Never share your Razorpay Secret Key or Gmail App Password
- For production, use Razorpay LIVE keys (not test keys)

---

Need help? Check the main [SETUP.md](../SETUP.md) guide.
