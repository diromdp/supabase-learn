import type { Metadata } from "next";
import "./globals.css";
import { Quicksand } from 'next/font/google'


export const metadata: Metadata = {
  title: "NoteMonee",
  description: "NoteMonee",
};

const quicksand = Quicksand({ subsets: ['latin'] })


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${quicksand.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
