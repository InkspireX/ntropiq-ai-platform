import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "ntropiq - Enterprise AI Research Platform", // Updated page title for landing page
  description: "Advanced analytics, predictive modeling, and intelligent data insights for enterprise teams", // Updated description for landing page
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${montserrat.style.fontFamily};
  --font-sans: ${montserrat.variable};
}
        `}</style>
      </head>
      <body className={montserrat.className}>{children}</body>
    </html>
  )
}
