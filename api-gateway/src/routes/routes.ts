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
    rateLimit: { windowMs: 15 * 60 * 1000, max: 5 }, // Limiting to 5 requests per 15 minutes
    proxy: {
      target:
        String(process.env.AUTH_SERVICE_URL) || "http://auth:3001/auth-service", // Fallback to default if env variable is not set
      changeOrigin: true,
      pathRewrite: { "^/auth(/api/.*|$)": "$1" }, // Rewrites /auth/api/... to /api/..., preserving sub-paths
    }, // Proxying to auth service
  },
  {
    url: "/analytics", // Route for analytics service
    auth: false, // No authentication required
    creditCheck: false, // No credit check required
    proxy: {
      target:
        String(process.env.ANALYTICS_SERVICE_URL) ||
        "http://analytics:3002/analytics-service", // Fallback to default if env variable is not set
      changeOrigin: true,
      pathRewrite: { "^/analytics(/api/.*|$)": "$1" }, // Rewrites /analytics/api/... to /api/..., preserving sub-paths
    }, // Proxying to analytics service
  },
];
