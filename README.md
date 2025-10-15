# Tourism Pulse NZ

Tourism Pulse NZ is a comprehensive tourism management platform designed specifically for New Zealand's tourism industry. Built with a modern microservices architecture, it provides an end-to-end solution for managing destinations, processing bookings, tracking analytics, and handling payments securely.

## Overview

This platform serves three distinct user roles—tourists, destination managers, and administrators—each with tailored interfaces and capabilities. At its core, the system leverages a microservices approach to ensure scalability, maintainability, and separation of concerns. Whether you're a developer looking to contribute or a stakeholder evaluating the platform, this documentation will guide you through everything you need to know.

## Key Features

### For Tourists

- **Destination Discovery**: Browse and explore New Zealand's top tourism destinations with detailed information, images, and real-time weather data
- **Secure Booking**: Book experiences with confidence using Stripe's payment infrastructure
- **Contact Support**: Reach out to administrators directly through an integrated contact form with email notifications

### For Managers

- **Dashboard Analytics**: Monitor booking trends, visitor statistics, and revenue metrics in real-time
- **Content Management**: Update destination information, manage availability, and control pricing
- **Booking Oversight**: View and manage bookings for destinations under your supervision

### For Administrators

- **Platform Control**: Full access to user management, destination approvals, and system configuration
- **Analytics Insights**: Deep dive into visitor trends, seasonal patterns, and booking behavior across all destinations
- **Payment Management**: Handle refunds, monitor transaction health, and track financial metrics

### Technical Capabilities

- **JWT Authentication**: Secure, token-based authentication with role-based access control
- **API Gateway**: Centralized routing with rate limiting and request logging
- **Real-time Weather Integration**: Live weather data from OpenWeather API
- **Responsive Design**: Mobile-first interface built with React
- **RESTful APIs**: Well-documented endpoints with Swagger UI integration
- **Containerized Deployment**: Docker-based setup for consistent environments

## Tech Stack

### Frontend

- **React 18** - Component-based UI library
- **Webpack 5** - Module bundler and build tool
- **CSS3** - Modern styling with responsive design

### Backend Services

- **Node.js** - Runtime environment
- **Express** - Web framework for building APIs
- **TypeScript** - Type-safe JavaScript development
- **JWT** - JSON Web Tokens for authentication

### Data Storage

- **PostgreSQL** - Relational database for users, destinations, and bookings
- **MongoDB** - NoSQL database for analytics and time-series data
- **Redis** - In-memory cache for rate limiting and session management

### Payment & Integrations

- **Stripe** - Payment processing and webhook handling
- **OpenWeather API** - Real-time weather data
- **Nodemailer** - Email notifications via Gmail

### DevOps

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Turbo** - Monorepo build system

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Docker and Docker Compose
- PostgreSQL 14+
- MongoDB 6+
- Redis 7+
- Stripe account (for payment features)
- Gmail account with App Password (for email features)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/hasiabewardana/tourism-pulse-nz.git
   cd tourism-pulse-nz
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create `.env` files in the root and each service directory with the required variables:

   ```bash
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=tourism_pulse
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password

   # Stripe
   STRIPE_SECRET_KEY=sk_test_your_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_key
   STRIPE_WEBHOOK_SECRET=whsec_your_secret

   # Email
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ADMIN_EMAIL=tourism.pulse.nz@gmail.com

   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379

   # External APIs
   OPENWEATHER_API_KEY=your_api_key
   STATSNZ_API_KEY=your_api_key
   ```

4. **Set up databases**

   Run the SQL migrations and seed data:

   ```bash
   # For authentication database
   psql -U postgres -d tourism_pulse < data/sql/auth/migrations/001_create_users.sql

   # For destination database
   psql -U postgres -d tourism_pulse < data/sql/dest/migrations/001_create_destinations.sql
   ```

5. **Start the services**

   **Option A: Using Docker Compose (Recommended)**

   ```bash
   docker-compose up --build
   ```

   **Option B: Running locally**

   ```bash
   # Terminal 1 - API Gateway
   cd api-gateway && npm run dev

   # Terminal 2 - Auth Service
   cd backend/auth-service && npm run dev

   # Terminal 3 - Destination Service
   cd backend/destination-service && npm run dev

   # Terminal 4 - Analytics Service
   cd backend/analytics-service && npm run dev

   # Terminal 5 - Integration Service
   cd backend/integration-service && npm run dev

   # Terminal 6 - Payment Service
   cd backend/payment-service && npm run dev

   # Terminal 7 - Frontend
   cd frontend && npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:8080 (or 3006 in Docker)
   - API Gateway: http://localhost:3000
   - Swagger Documentation: http://localhost:3000/api-docs

### Quick Setup Guides

For specific features, refer to these targeted guides:

- **Payment Integration**: [docs/STRIPE_PAYMENT_GUIDE.md](docs/STRIPE_PAYMENT_GUIDE.md) - Set up Stripe in test mode and process your first payment
- **Email Configuration**: [backend/integration-service/EMAIL_SETUP.md](backend/integration-service/EMAIL_SETUP.md) - Configure Gmail for contact form notifications
- **API Documentation**: [docs/SWAGGER_UI_GUIDE.md](docs/SWAGGER_UI_GUIDE.md) - Explore and test API endpoints interactively

## Architecture

Tourism Pulse NZ follows a microservices architecture pattern where each service is independently deployable and focused on a specific business capability.

```
┌─────────────┐
│   Frontend  │ (React SPA on port 8080)
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│   API Gateway   │ (Port 3000 - Routing, Rate Limiting, Swagger)
└────────┬────────┘
         │
    ┌────┴────┬─────────┬──────────┬───────────┐
    ▼         ▼         ▼          ▼           ▼
┌────────┐ ┌─────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐
│  Auth  │ │Dest │ │Analytics│ │Integration│ │Payment  │
│Service │ │Svc  │ │ Service │ │  Service  │ │Service  │
│ :3001  │ │:3002│ │  :3003  │ │   :3004   │ │ :3005   │
└────────┘ └─────┘ └─────────┘ └──────────┘ └─────────┘
    │         │         │            │            │
    └─────────┴─────────┴────────────┴────────────┘
                        │
          ┌─────────────┼─────────────┬──────────┐
          ▼             ▼             ▼          ▼
    ┌──────────┐  ┌─────────┐  ┌─────────┐  ┌──────────┐
    │PostgreSQL│  │ MongoDB │  │  Redis  │  │  Stripe  │
    └──────────┘  └─────────┘  └─────────┘  └──────────┘
```

### Service Responsibilities

| Service                 | Port | Purpose                                                         |
| ----------------------- | ---- | --------------------------------------------------------------- |
| **API Gateway**         | 3000 | Routes requests, enforces rate limits, serves API documentation |
| **Auth Service**        | 3001 | User authentication, JWT token management, role-based access    |
| **Destination Service** | 3002 | Destination CRUD, booking management, availability tracking     |
| **Analytics Service**   | 3003 | Visitor tracking, trend analysis, reporting dashboards          |
| **Integration Service** | 3004 | Weather API, Stats NZ data, email notifications                 |
| **Payment Service**     | 3005 | Stripe payment processing, refunds, webhook handling            |

## Project Structure

```
tourism-pulse-nz/
│
├── api-gateway/              # API Gateway (routing, rate limiting, Swagger)
│   ├── src/
│   │   ├── index.ts         # Gateway entry point
│   │   ├── proxy.ts         # Service proxy configuration
│   │   ├── ratelimit.ts     # Rate limiting middleware
│   │   └── routes/          # Route definitions
│   └── Dockerfile
│
├── backend/                  # Microservices
│   ├── auth-service/        # Authentication & authorization
│   │   ├── src/
│   │   │   ├── controllers/ # Request handlers
│   │   │   ├── models/      # User models
│   │   │   ├── services/    # Business logic
│   │   │   └── middleware/  # JWT verification
│   │   └── tests/           # Unit and integration tests
│   │
│   ├── destination-service/ # Destinations & bookings
│   ├── analytics-service/   # Analytics & reporting
│   ├── integration-service/ # External APIs & email
│   └── payment-service/     # Stripe integration
│
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── tourist/         # Tourist-facing pages
│   │   ├── manager/         # Manager dashboard
│   │   ├── admin/           # Admin panel
│   │   └── shared/          # Shared components
│   └── public/
│       └── images/          # Static assets
│
├── data/                     # Database schemas & migrations
│   ├── sql/                 # PostgreSQL
│   │   ├── auth/            # Auth database
│   │   └── dest/            # Destination database
│   └── nosql/               # MongoDB
│       ├── schemas/         # Collection schemas
│       └── indexes/         # Index definitions
│
├── docs/                     # Documentation
│   ├── openapi.yaml         # API specification
│   └── *.md                 # Setup guides
│
├── scripts/                  # Utility scripts
├── docker-compose.yml        # Multi-container orchestration
└── turbo.json               # Monorepo build configuration
```

## API Documentation

Interactive API documentation is available through Swagger UI once the application is running. This provides a hands-on way to explore endpoints, understand request/response formats, and test API calls directly from your browser.

**Access Swagger UI**: http://localhost:3000/api-docs

The OpenAPI specification can also be found at [docs/openapi.yaml](docs/openapi.yaml) for integration with other tools or for offline reference.

## Testing

Each service includes its own test suite covering both unit and integration tests.

```bash
# Run all tests
npm test

# Test specific service
cd backend/auth-service && npm test
cd backend/destination-service && npm test

# Test with coverage
npm run test:coverage
```

For payment testing, use Stripe's test card numbers:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Authentication Required**: 4000 0025 0000 3155

Refer to [docs/TEST_CARDS_REFERENCE.md](docs/TEST_CARDS_REFERENCE.md) for the complete list.

## Development Workflow

1. **Create a feature branch** from `main`

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit with clear messages

   ```bash
   git commit -m "Add: Brief description of changes"
   ```

3. **Test locally** before pushing

   ```bash
   npm test
   ```

4. **Push and create a pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

## Deployment

The application is containerized and ready for deployment to any container orchestration platform like Kubernetes, AWS ECS, or Google Cloud Run.

**Production Considerations**:

- Replace test Stripe keys with live keys
- Use managed database services (AWS RDS, MongoDB Atlas)
- Set up proper logging and monitoring
- Configure HTTPS with valid SSL certificates
- Implement backup strategies for databases
- Set appropriate rate limits in the API Gateway

## Contributors

This project was developed as part of the COMPX576 Programming Project at the University of Waikato.

**Developer**: Hasitha Abewardana

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**Questions or Issues?**  
Feel free to open an issue in the repository or reach out via the contact form in the application.
