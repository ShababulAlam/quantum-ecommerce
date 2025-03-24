import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "@/components/SessionProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "Quantum E-Commerce",
    template: "%s | Quantum E-Commerce",
  },
  description:
    "Sleek e-commerce platform with animation transitions and seamless checkout experience",
  keywords: ["e-commerce", "online shop", "retail", "shopping"],
  authors: [{ name: "Quantum Team" }],
  creator: "Quantum E-Commerce",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://quantum-ecommerce.com",
    title: "Quantum E-Commerce",
    description:
      "Sleek e-commerce platform with animation transitions and seamless checkout experience",
    siteName: "Quantum E-Commerce",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quantum E-Commerce",
    description:
      "Sleek e-commerce platform with animation transitions and seamless checkout experience",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.variable}>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
