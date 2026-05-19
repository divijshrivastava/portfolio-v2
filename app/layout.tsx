import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { ThemeProvider } from "@/components/theme-provider";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://divij.tech";

export const metadata: Metadata = {
  title: {
    default: "Divij Shrivastava - Senior Backend Engineer",
    template: "%s | Divij Shrivastava"
  },
  description: "Senior Backend Engineer specializing in distributed systems, system design, and scalable architecture. Built real-time trading platforms, event-driven systems on Kafka, and complex integrations at Morgan Stanley, TIAA, and TCS.",
  keywords: ["Backend Engineer", "Distributed Systems", "System Design", "Kafka", "Java", "Spring Boot", "Fintech", "Trading Systems"],
  authors: [{ name: "Divij Shrivastava" }],
  creator: "Divij Shrivastava",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    title: "Divij Shrivastava - Senior Backend Engineer",
    description: "Senior Backend Engineer specializing in distributed systems, system design, and scalable architecture. Built real-time trading platforms and event-driven systems at Morgan Stanley, TIAA, and TCS.",
    siteName: "Divij Shrivastava",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Divij Shrivastava - Senior Backend Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Divij Shrivastava - Senior Backend Engineer",
    description: "Senior Backend Engineer specializing in distributed systems, system design, and scalable architecture at Morgan Stanley, TIAA, and TCS.",
    creator: "@divijshrivastava",
    images: [`${baseUrl}/og-image.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navigation />
          <main className="flex-1 pt-16">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
