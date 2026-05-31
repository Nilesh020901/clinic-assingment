export function getEnv() {
  return {
    JWT_SECRET: process.env.JWT_SECRET || "dev-secret-key-min-16-chars",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@clinic.com",
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "Admin@123456",
    ADMIN_NAME: process.env.ADMIN_NAME || "System Admin",
  };
}
