import type { Metadata } from "next";
import "@/style/styles.scss";
import { Quicksand } from 'next/font/google'
import Provider from "@/components/layouts/provider";
import 'react-toastify/dist/ReactToastify.css';
import { Analytics } from '@vercel/analytics/next';
 


export const metadata: Metadata = {
  title: "PeopleTurst - Platform Penilaian Kepercayaan Online Indonesia",
  description: "PeopleTurst adalah platform terpercaya untuk mengecek & menilai kredibilitas seseorang di Indonesia. Cari tahu review, rating, dan riwayat kepercayaan secara online dengan mudah dan aman.",
  keywords: "cek kredibilitas, review kepercayaan, rating pengguna indonesia, sistem kepercayaan online, verifikasi identitas, review penilaian, platform kepercayaan indonesia",
  openGraph: {
    title: "PeopleTurst - Cek Kredibilitas & Rating Kepercayaan Online",
    description: "Platform terpercaya untuk mengecek & menilai kredibilitas seseorang di Indonesia. Cari tahu review dan rating kepercayaan secara online.",
    type: "website",
    locale: "id_ID",
    siteName: "PeopleTurst",
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://peoplestrust.co",
  },
  manifest: '/site.webmanifest',
};

const quicksand = Quicksand({ subsets: ['latin'] });

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps)  {
  return (
    <html lang="id">
      <body
        className={`${quicksand.className} antialiased`}
        suppressHydrationWarning
      >
        <div className="mx-auto relative min-h-screen flex flex-col justify-between">
          <Provider>{children}</Provider>
          <Analytics />
        </div>
      </body>
    </html>
  );
}
