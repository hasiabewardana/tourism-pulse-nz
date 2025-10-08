# TourismPulseNZ

A tourism management platform for New Zealand.

## Setup

1. Clone the repo: `git clone <repo-url>`
2. Install dependencies: `npm install`
3. Run: `npm run dev`

## API Documentation

Interactive API documentation is available via Swagger UI:

- **URL:** `http://localhost:3000/api-docs`
- **Guide:** See [docs/SWAGGER_UI_GUIDE.md](docs/SWAGGER_UI_GUIDE.md) for detailed instructions
- **OpenAPI Spec:** [docs/openapi.yaml](docs/openapi.yaml)

## Structure

- `/frontend`: Tourist Interface, Manager Dashboard, Admin Panel
- `/api-gateway`: API Gateway with Swagger UI
- `/backend`: Auth, Analytics, Destination, Integration Services
- `/data`: SQL, NoSQL, and Cache configurations
- `/docs`: API documentation and guides
