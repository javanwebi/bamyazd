// Host-neutral typings. Next webpack selects the Vercel adapter; Vite selects Workers.
declare module "estate-platform" {
  export const env: {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    ADMIN_SETUP_CODE?: string;
  };
}
