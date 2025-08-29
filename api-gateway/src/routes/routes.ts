import dotenv from "dotenv"; // Load environment variables

dotenv.config(); // Load .env file

export interface RouteConfig {
  // Defining interface for route configuration
  url: string; // URL path for the route
  auth?: boolean; // Optional flag for authentication requirement
  creditCheck?: boolean; // Optional flag for credit check requirement
  rateLimit?: { windowMs: number; max: number }; // Optional rate limiting configuration
  proxy: {
    target: string;
    changeOrigin: boolean;
    pathRewrite: { [key: string]: string };
  }; // Proxy configuration for routing
}

export const ROUTES: RouteConfig[] = [
  // Array of route configurations
  {
    url: "/auth", // Route for authentication service
    auth: false, // No authentication required
    creditCheck: false, // No credit check required
    rateLimit: { windowMs: 1 * 60 * 1000, max: 60 }, // Limiting to 60 requests per 1 minute
    proxy: {
      target:
        String(process.env.AUTH_SERVICE_URL) || "http://auth:3001/auth-service", // Fallback to default if env variable is not set
      changeOrigin: true,
      pathRewrite: { "^/auth(/api/.*|$)": "$1" }, // Rewrites /auth/api/... to /api/..., preserving sub-paths
    }, // Proxying to auth service
  },
  {
    url: "/dest", // Route for destination service
    auth: false, // No authentication required for public endpoints; service handles auth internally
    creditCheck: false, // No credit check required
    rateLimit: { windowMs: 1 * 60 * 1000, max: 60 }, // Limiting to 60 requests per 1 minute (higher due to public access)
    proxy: {
      target:
        String(process.env.DESTINATION_SERVICE_URL) ||
        "http://destination:3002/dest-service", // Fallback to default if env variable is not set
      changeOrigin: true,
      pathRewrite: { "^/dest(/api/.*|$)": "$1" }, // Rewrites /dest/api/... to /api/..., preserving sub-paths
    }, // Proxying to destination services
  },
  {
    url: "/analytics", // Route for analytics service
    auth: false, // No authentication required
    creditCheck: false, // No credit check required
    proxy: {
      target:
        String(process.env.ANALYTICS_SERVICE_URL) ||
        "http://analytics:3003/analytics-service", // Fallback to default if env variable is not set
      changeOrigin: true,
      pathRewrite: { "^/analytics(/api/.*|$)": "$1" }, // Rewrites /analytics/api/... to /api/..., preserving sub-paths
    }, // Proxying to analytics service
  },
];
