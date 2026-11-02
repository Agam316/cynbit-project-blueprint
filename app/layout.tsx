import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Blueprint | Cynbit Technologies — Assessment Prototype",
  description: "Turn your business goal into a practical project brief. Explore a service path, define your scope, and prepare for a focused discovery conversation.",
  robots: { index: false, follow: false },
  icons: {
    icon: "/brand/cynbit.svg",
    shortcut: "/brand/cynbit.svg",
  },
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
