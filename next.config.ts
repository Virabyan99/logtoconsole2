import type { NextConfig } from "next";

// next.config.js
const nextConfig: NextConfig = {
  async headers() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            // Use template literals for dynamic policy
            value: `
              default-src 'self';
              script-src 'self'${isDevelopment ? " 'unsafe-inline' 'unsafe-eval'" : ""};
              style-src 'self' 'unsafe-inline';
              img-src 'self';
              connect-src 'self'${isDevelopment ? " ws://localhost:*" : ""};
              font-src 'self';
              frame-ancestors 'none';
              object-src 'none';
              base-uri 'self';
              form-action 'self';
            `.replace(/\n\s+/g, ' ').trim() // Clean up whitespace
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
