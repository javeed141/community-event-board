import type { Metadata } from 'next';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toast"
const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Community Events Board',
  description: 'Discover and personalize local community events',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full antialiased dark", "font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
