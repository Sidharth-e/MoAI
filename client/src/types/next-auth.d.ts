import { DefaultSession } from "next-auth";

// https://next-auth.js.org/getting-started/typescript#module-augmentation

declare module "next-auth" {
  interface Session {
    user: {
      isAdmin: boolean;
      nickName: string;
      provider: string;
      role: string;
      jwtToken: string;
    } & DefaultSession["user"];
  }

  interface jwtToken {
    isAdmin: boolean;
    nickName: string;
    provider: string;
    role: string;
    jwtToken: string;
  }

  interface User {
    isAdmin: boolean;
    nickName: string;
    provider: string;
    role: string;
    jwtToken: string;
  }
}
