# Payment Service

Stripe payment integration for TourismPulseNZ booking system.

## Features

- ✅ Stripe Payment Intents API
- ✅ Secure payment processing
- ✅ Real-time webhook handling
- ✅ Payment status tracking
- ✅ Refund support
- ✅ Test mode for development
- ✅ PostgreSQL payment records
- ✅ Full TypeScript support

## Quick Start

### 1. Get Stripe API Keys (Free)

1. Sign up at https://stripe.com (completely free)
2. Go to Dashboard → Developers → API keys
3. Copy your **test mode** keys:
   - Publishable key (`pk_test_...`)
   - Secret key (`sk_test_...`)

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your Stripe keys
nano .env
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Database Migrations

```bash
# Run from project root
psql -U postgres -d tourism_pulse -f data/sql/dest/migrations/2025_10_08_001_add_payment_fields_to_bookings.sql
psql -U postgres -d tourism_pulse -f data/sql/dest/migrations/2025_10_08_002_create_payments_table.sql
```

### 5. Start Service

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
```

Service runs on: `http://localhost:3005`

## Testing

### Health Check

```bash
curl http://localhost:3005/health
```

Expected response:

```json
{
  "status": "healthy",
  "service": "payment-service",
  "stripeConfigured": true
}
```

### Test Payment

```bash
# Create payment intent
curl -X POST http://localhost:3005/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": 1,
    "amount": 100.00,
    "currency": "nzd"
  }'
```

### Test Cards (Free)

| Card Number         | Result                |
| ------------------- | --------------------- |
| 4242 4242 4242 4242 | ✅ Success            |
| 4000 0000 0000 0002 | ❌ Decline            |
| 4000 0000 0000 9995 | ❌ Insufficient funds |

**For all cards:**

- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)

## API Endpoints

### GET /api/payments/config

Get Stripe publishable key

### POST /api/payments/create-intent

Create payment intent for booking

Request body:

```json
{
  "bookingId": 123,
  "amount": 150.0,
  "currency": "nzd"
}
```

### GET /api/payments/:paymentIntentId/status

Get payment status

### GET /api/payments/booking/:bookingId

Get payment for specific booking

### GET /api/payments/user/:userId

Get all payments for user

### POST /api/payments/:paymentIntentId/cancel

Cancel a payment

### POST /api/payments/refund

Process a refund

Request body:

```json
{
  "paymentIntentId": "pi_xxx",
  "amount": 50.0,
  "reason": "Customer request"
}
```

### POST /api/payments/webhook

Stripe webhook endpoint (called by Stripe)

## Environment Variables

```env
PORT=3005
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tourism_pulse
DB_USER=postgres
DB_PASSWORD=postgres

# Stripe (REQUIRED)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# Other
DEFAULT_CURRENCY=nzd
FRONTEND_URL=http://localhost:8080
API_GATEWAY_URL=http://localhost:3000
```

## Database Schema

### payments table

```sql
payment_id          SERIAL PRIMARY KEY
booking_id          INTEGER (foreign key)
payment_intent_id   VARCHAR(255) UNIQUE
amount              DECIMAL(10,2)
currency            VARCHAR(3)
status              VARCHAR(50)
payment_method      VARCHAR(50)
stripe_customer_id  VARCHAR(255)
metadata            JSONB
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

### bookings table (new fields)

```sql
payment_status      VARCHAR(50)
payment_intent_id   VARCHAR(255)
amount_paid         DECIMAL(10,2)
currency            VARCHAR(3)
payment_method      VARCHAR(50)
paid_at             TIMESTAMP
```

## Webhooks (Optional)

For local testing:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3005/api/payments/webhook
```

Copy the webhook secret and add to `.env`

## Documentation

See [STRIPE_PAYMENT_GUIDE.md](../../docs/STRIPE_PAYMENT_GUIDE.md) for complete integration guide.

## Support

- [Stripe Docs](https://stripe.com/docs)
- [Test Cards](https://stripe.com/docs/testing)
- [Webhooks Guide](https://stripe.com/docs/webhooks)

## License

MIT
