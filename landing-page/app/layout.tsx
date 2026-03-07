import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GardenRL - Teaching AI to Grow Food",
  description: "An OpenEnv-compatible RL environment grounded in real plant data and hydroponic experiments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
