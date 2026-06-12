import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Murgdur Commerce",
  description: "Luxury commerce platform with customer, order, invoice, delivery, and admin flows."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
