import type { Metadata } from "next";
import { JetBrains_Mono, Crimson_Pro } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/infrastructure/providers/ReactQueryProvider";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const crimsonPro = Crimson_Pro({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Neural Stream | Hacker News Reader",
  description: "A radically reimagined Hacker News reader with a focus stream interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jetbrainsMono.variable} ${crimsonPro.variable} antialiased`}
      >
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
