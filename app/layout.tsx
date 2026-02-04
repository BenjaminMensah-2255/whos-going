import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Who's Going? - Group Order Coordination",
  description: "Coordinate group orders and save on delivery fees",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
