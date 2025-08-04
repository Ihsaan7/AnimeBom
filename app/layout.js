
import "./globals.css";
import ClientHeaderWrapper from "../components/ClientHeaderWrapper";
import ClientFooterWrapper from "../components/ClientFooterWrapper";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ConditionalPadding from "../components/ConditionalPadding";

export const metadata = {
  title: "AnimaBom | Anime Streaming Platform",
  description: "Discover, watch, and enjoy the best anime series and movies from around the world",
  other: {
    'google-fonts': 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Winky+Sans:ital,wght@0,300..900;1,300..900&display=swap'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Winky+Sans:ital,wght@0,300..900;1,300..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <ThemeProvider>
          <ClientHeaderWrapper />
          <ConditionalPadding>{children}</ConditionalPadding>
          <ClientFooterWrapper />
        </ThemeProvider>
      </body>
    </html>
  );
}
