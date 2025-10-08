# TourismPulseNZ

A tourism management platform for New Zealand with integrated payment processing.

## Features

- 🏖️ **Destination Management** - Browse and manage NZ tourism destinations
- 📊 **Analytics Dashboard** - Track visitor trends and booking analytics
- 👥 **User Management** - Tourist, Manager, and Admin roles
- 💳 **Payment Processing** - Secure Stripe integration for bookings
- 🔐 **Authentication** - JWT-based authentication
- 🌐 **API Gateway** - Centralized routing and rate limiting
- 📱 **Responsive Frontend** - Modern React-based interface
- 📧 **Contact Form** - Public contact form with email notifications

## Setup

1. Clone the repo: `git clone <repo-url>`
2. Install dependencies: `npm install`
3. Configure environment variables (see below)
4. Run database migrations
5. Start services: `npm run dev`

## Payment Integration 💳

This project includes **Stripe payment integration** for booking payments.

### Quick Start

1. Create free Stripe account: https://stripe.com
2. Get test API keys from Dashboard
3. Configure payment service (see [Payment Setup Guide](docs/STRIPE_PAYMENT_GUIDE.md))
4. Test with dummy cards (no real charges)

**📚 Full Documentation:**

- [Payment Setup Guide](docs/STRIPE_PAYMENT_GUIDE.md) - Complete setup instructions
- [Payment Setup Checklist](docs/PAYMENT_SETUP_CHECKLIST.md) - Step-by-step checklist
- [Test Cards Reference](docs/TEST_CARDS_REFERENCE.md) - Test card numbers
- [Payment Architecture](docs/PAYMENT_ARCHITECTURE.md) - System architecture

## Contact Form 📧

Anyone can contact the admin via the contact form with email notifications.

### Quick Start

1. Configure email service (Gmail recommended)
2. Get App Password from Google Account
3. Set environment variables
4. Test the contact form

**📚 Documentation:**

- [Quick Setup Guide](CONTACT_SETUP.md) - Get started in 5 minutes
- [Email Configuration](backend/integration-service/EMAIL_SETUP.md) - Detailed email setup
- [Complete Documentation](docs/CONTACT_FORM.md) - Full API reference
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md) - What's included

**Test:** `node scripts/test-email.js` or visit `http://localhost:3000/contact`

## API Documentation

Interactive API documentation is available via Swagger UI:

- **URL:** `http://localhost:3000/api-docs`
- **Guide:** See [docs/SWAGGER_UI_GUIDE.md](docs/SWAGGER_UI_GUIDE.md) for detailed instructions
- **OpenAPI Spec:** [docs/openapi.yaml](docs/openapi.yaml)

## Structure

- `/frontend`: Tourist Interface, Manager Dashboard, Admin Panel
- `/api-gateway`: API Gateway with Swagger UI
- `/backend`: Microservices Architecture
  - `auth-service`: Authentication & Authorization (Port 3001)
  - `destination-service`: Destinations & Bookings (Port 3002)
  - `analytics-service`: Analytics & Reporting (Port 3003)
  - `integration-service`: External API Integration (Port 3004)
  - `payment-service`: Stripe Payment Processing (Port 3005) 💳
- `/data`: SQL, NoSQL, and Cache configurations
- `/docs`: API documentation and guides

## Services

### Payment Service (NEW) 💳

- **Port**: 3005 (standalone), 3006 (Docker)
- **Purpose**: Secure payment processing with Stripe
- **Features**:
  - Payment intent creation
  - Webhook handling
  - Refund processing
  - Test mode support
- **Docs**: See [backend/payment-service/README.md](backend/payment-service/README.md)
