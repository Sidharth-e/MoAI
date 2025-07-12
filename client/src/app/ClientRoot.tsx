// app/ClientRoot.tsx
'use client'
import { SessionProvider } from 'next-auth/react';
import { ChatThreadsProvider } from '@/contexts/ChatThreadsContext';

export default function ClientRoot({ children }:any) {
  return (
    <SessionProvider>
      <ChatThreadsProvider>
        {children}
      </ChatThreadsProvider>
    </SessionProvider>
  )
}