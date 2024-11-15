'use client'
import * as React from 'react';
import Assistente from "@/components/Assistente";
import { usePathname } from 'next/navigation'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const router = usePathname();
    console.log(router)

    const id = String(router.split('/')[3]);
    console.log(id)

    return (
        <Assistente select={id}>
            {children}
        </Assistente>
    );
}
