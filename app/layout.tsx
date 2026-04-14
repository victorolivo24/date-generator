import type { Metadata } from "next";
import { Bebas_Neue, Graduate } from "next/font/google";
import "./globals.css";

const graduate = Graduate({
  variable: "--font-graduate",
  subsets: ["latin"],
  weight: "400",
});

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "The Scare Report",
  description: "MU-themed date grading and recommendation app for Victor and Gianna.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${graduate.variable} ${bebas.variable}`}>
      <body className="bg-mu-blue bg-campus-grid bg-[size:32px_32px] font-sans">
        {children}
      </body>
    </html>
  );
}
