export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      HUDDLE01_API_KEY: string;
      NEXT_PUBLIC_HUDDLE01_PROJECT_ID: string;
      ENV: 'test' | 'dev' | 'prod';
    }
  }
}