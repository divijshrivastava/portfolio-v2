import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: {
    default: "Divij Shrivastava - Senior Full-Stack Engineer",
    template: "%s | Divij Shrivastava"
  },
  description: "Portfolio of Divij Shrivastava - Senior Full-Stack Engineer specializing in web development, cloud architecture, and modern tech solutions. Explore my projects, blog posts, and technical expertise.",
  keywords: ["Full-Stack Developer", "Web Developer", "Software Engineer", "React", "Next.js", "Node.js", "Cloud Architecture"],
  authors: [{ name: "Divij Shrivastava" }],
  creator: "Divij Shrivastava",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://divij.tech",
    title: "Divij Shrivastava - Senior Full-Stack Engineer",
    description: "Portfolio of Divij Shrivastava - Senior Full-Stack Engineer specializing in web development, cloud architecture, and modern tech solutions.",
    siteName: "Divij Shrivastava Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Divij Shrivastava - Senior Full-Stack Engineer",
    description: "Portfolio of Divij Shrivastava - Senior Full-Stack Engineer specializing in web development and cloud architecture.",
    creator: "@divijshrivastava",
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
