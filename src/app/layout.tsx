import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "@/components/providers";
import "./globals.css";
import AgentationDev from "@/components/AgentationDev";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Unigent | AI Agents at the Speed of Thought",
  description:
    "One keyboard-first workspace powered by AI agents. Automate tasks, manage communications, and let intelligent agents handle the rest.",
  generator: "v0.app",
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#5B6CF0" },
    { media: "(prefers-color-scheme: dark)", color: "#6E7CF5" },
  ],
  width: "device-width",
  initialScale: 1,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} bg-background`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':true;document.documentElement.classList.add(d?'dark':'light')}catch(e){document.documentElement.classList.add('dark')}})()`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ClerkProvider>
          <Providers>
            {children}
            <AgentationDev />
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
