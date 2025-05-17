declare namespace NodeJS {
  interface ProcessEnv {
    // Obligatoires
    PORT: string;
    DATABASE_URL: string;
    JWT_SECRET: string;
    SALT_ROUNDS: string;

    // CI-dessous si vous utilisez ces services
    STRIPE_SECRET_KEY: string;
    SMTP_USER: string;
    SMTP_PASS: string;
    FRONTEND_URL: string;
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;

    // Optionnels / locaux
    POSTGRES_USER?: string;
    POSTGRES_PASSWORD?: string;
    POSTGRES_DB?: string;
    CLIENT_ID?: string;
    CLIENT_SECRET?: string;
  }
}
export {};

