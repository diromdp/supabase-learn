import type { Metadata } from "next";
import "@/style/styles.scss";
import { Quicksand } from 'next/font/google'
import Provider from "@/components/layouts/provider";
import 'react-toastify/dist/ReactToastify.css';


export const metadata: Metadata = {
  title: "NoteMonee",
  description: "NoteMonee",
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
        <div className="mx-auto relative">
          <Provider>{children}</Provider>
        </div>
      </body>
    </html>
  );
}
