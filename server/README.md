# ResumePro Server

Backend server for ResumePro with Razorpay payment integration.

## Features

- 💳 Razorpay payment integration
- 📧 Email notification with download links
- 🔐 Secure payment verification
- 💾 SQLite database for order management
- 🔄 One-time payment, lifetime access (1 year validity)
- 🚫 No signup required

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Update the following in `.env`:

```env
# Razorpay Credentials (Get from https://dashboard.razorpay.com/)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 3. Gmail App Password Setup

To send emails, you need to create an App Password in Gmail:

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Generate a new app password for "Mail"
5. Copy the password to `EMAIL_PASSWORD` in `.env`

### 4. Razorpay Setup

1. Sign up at [Razorpay](https://razorpay.com/)
2. Go to Settings → API Keys
3. Generate Test/Live API keys
4. Copy `Key Id` and `Key Secret` to `.env`

## Development

Start the development server:

```bash
npm run dev
```

Server will run on `http://localhost:5000`

## Production

Build and start:

```bash
npm run build
npm start
```

## API Endpoints

### Payment

**Create Order**
```
POST /api/payment/create-order
Body: {
  "email": "user@example.com",
  "resumeData": { ... },
  "templateId": "tech",
  "templateName": "Technology & Engineering"
}
```

**Verify Payment**
```
POST /api/payment/verify
Body: {
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "xxx",
  "templateName": "Technology & Engineering"
}
```

### Download

**Get Resume**
```
GET /api/download/:token
```

**Resend Download Link**
```
POST /api/download/resend
Body: {
  "email": "user@example.com",
  "templateName": "Technology & Engineering"
}
```

## Database Schema

SQLite database (`database.sqlite`) with the following schema:

```sql
orders (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  razorpay_order_id TEXT UNIQUE NOT NULL,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  resume_data TEXT NOT NULL,
  template_id TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  download_token TEXT UNIQUE NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  download_count INTEGER DEFAULT 0
)
```

## Architecture

### Payment Flow

1. User fills resume details on frontend
2. User clicks "Download PDF" → triggers payment
3. Backend creates Razorpay order
4. User completes payment via Razorpay checkout
5. Frontend sends payment details to backend for verification
6. Backend verifies signature and marks order as completed
7. Email sent to user with download link (valid for 1 year)
8. User can download immediately or use email link anytime

### Download Flow

1. User opens download link with unique token
2. Backend validates:
   - Token exists
   - Payment completed
   - Link not expired
3. Returns resume data to frontend
4. Frontend generates and downloads PDF

## Security

- Helmet.js for security headers
- Rate limiting (100 requests per 15 minutes)
- CORS configured for specific frontend URL
- Payment signature verification
- Unique download tokens (32-character nanoid)
- Database indexed for performance

## License

MIT
