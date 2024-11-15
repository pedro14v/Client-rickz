"use client";

import { SessionProvider } from "next-auth/react";

export default function NextAuthSessionProvider({ children } : any) {
  return <SessionProvider>{children}</SessionProvider>
}