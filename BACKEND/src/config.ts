export const FRONTEND_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://urban-heritage-project.vercel.app'
    : 'http://localhost:4200';