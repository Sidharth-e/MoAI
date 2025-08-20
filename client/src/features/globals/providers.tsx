"use client";
import { SessionProvider } from "next-auth/react";
import { ModelProvider } from "@/contexts/ModelContext";

export const AuthenticatedProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <SessionProvider>
      <ModelProvider>
        {children}
      </ModelProvider>
    </SessionProvider>
  );
};
