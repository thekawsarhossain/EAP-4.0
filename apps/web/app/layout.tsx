import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import { StoreProvider } from "@/store/provider"
import type { Metadata } from "next"
import { SessionProvider } from "next-auth/react"
import { Geist, Geist_Mono } from "next/font/google"
import NextTopLoader from "nextjs-toploader"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "EAP: Project Management",
  description: "Smart project and task collaboration platform",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", geist.variable, fontMono.variable)}
    >
      <body>
        <SessionProvider>
          <StoreProvider>
            <ThemeProvider>
              <NextTopLoader showSpinner={false} color="#c90027" />
              {children}
              <Toaster richColors closeButton />
            </ThemeProvider>
          </StoreProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
