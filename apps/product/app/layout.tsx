import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guestly",
  description: "Customer feedback intelligence for hospitality operators.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
