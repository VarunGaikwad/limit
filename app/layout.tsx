import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { SplashScreen } from "@/components";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yourdomain.com"),
  title: "Limit - Smart Budget & Expense Tracker",
  description:
    "A powerful yet simple budget tracking app to monitor expenses, control spending, and improve financial discipline.",
  applicationName: "Limit",
  authors: [
    {
      name: "Varun Gaikwad",
      url: "https://portfolio-drab-nine-70.vercel.app",
    },
  ],
  keywords: [
    "budget tracker app",
    "expense tracking",
    "money management",
    "personal finance",
    "financial planning",
  ],
  openGraph: {
    title: "Limit - Smart Budget & Expense Tracker",
    description:
      "Track expenses, manage money, and build better financial habits.",
    url: "https://yourdomain.com",
    siteName: "Limit",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Limit Budget Tracking App",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased text-xs`}>
        <SplashScreen>{children}</SplashScreen>
      </body>
    </html>
  );
}
