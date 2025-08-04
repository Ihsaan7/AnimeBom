
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientHeaderWrapper from "../components/ClientHeaderWrapper";
import ClientFooterWrapper from "../components/ClientFooterWrapper";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ConditionalPadding from "../components/ConditionalPadding";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "AnimaBom | Anime Streaming Platform",
  description: "Discover, watch, and enjoy the best anime series and movies from around the world",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <ClientHeaderWrapper />
          <ConditionalPadding>{children}</ConditionalPadding>
          <ClientFooterWrapper />
        </ThemeProvider>
      </body>
    </html>
  );
}
