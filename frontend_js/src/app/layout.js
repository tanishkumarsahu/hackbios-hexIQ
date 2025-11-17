import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/providers/Providers";
import ErrorBoundary from "../components/ErrorBoundary";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "AlumNode - AI-Powered Alumni Network",
  description: "Connect, collaborate, and strengthen ties with your alumni network through intelligent recommendations and automated engagement.",
  keywords: "alumni, networking, AI, education, connections, AlumNode",
  authors: [{ name: "AlumNode Team" }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', sizes: 'any' },
    ],
    shortcut: '/favicon.svg',
    apple: { url: '/favicon.png', sizes: '180x180' },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.png" type="image/png" />
      </head>
      <body className="bg-background font-sans antialiased">
        <ErrorBoundary>
          <Providers>
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
