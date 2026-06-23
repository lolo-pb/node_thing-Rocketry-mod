import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "node thing",
  description: "An experimental node-based image editor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ colorScheme: "dark" }}>
      <body className="font-sans antialiased [color-scheme:dark]">
        {children}
      </body>
    </html>
  );
}
