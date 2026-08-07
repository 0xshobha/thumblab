import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "ThumbLab — Three testable thumbnails",
  description:
    "Turn one video brief into three distinct YouTube thumbnail directions built for real-world A/B testing.",
  applicationName: "ThumbLab",
  keywords: ["YouTube thumbnails", "A/B testing", "creator tools", "thumbnail studio"],
  openGraph: {
    title: "ThumbLab — One brief. Three testable thumbnails.",
    description: "Generate clarity, curiosity, and emotion variants from one creator brief.",
    type: "website",
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
