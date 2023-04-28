export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      HUDDLE01_API_KEY: string;
      NEXT_PUBLIC_HUDDLE01_PROJECT_ID: string;
      NEXT_PUBLIC_LIGHTHOUSE_API_KEY: string;
      NEXT_PUBLIC_WEB3STORAGE_KEY: string;
      NEXT_PUBLIC_NFTSTORAGE_KEY: string;
      ENV: 'test' | 'dev' | 'prod';
    }
  }
}