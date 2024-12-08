"use client";
import { FC } from "react";
import Footer from "@/components/layouts/footer";
import dynamic from 'next/dynamic';

const NextThemesProvider = dynamic(
	() => import('next-themes').then((e) => e.ThemeProvider),
	{
		ssr: false,
	}
)
const Header = dynamic(
	() => import('@/components/layouts/header'),
	{
		ssr: false,
	}
)
const Background = dynamic(
	() => import('@/components/ui/background'),
	{
		ssr: false,
	}
)

interface ProvderProps {
    children: React.ReactNode;
}
 
const Provder: FC<ProvderProps> = ({ children }) => {
    return (
        <NextThemesProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <Header />
        {children}
        <Footer />
        <Background />
      </NextThemesProvider>
    );
}
 
export default Provder;