import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";


interface HeaderProps {

}

const Header: React.FC<HeaderProps> = () => {
    const router = useRouter();

    return (
        <>
            <header className="z-[99] sticky top-0 w-full bg-black border-b border-transparent">
                <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="md:flex md:items-center md:gap-12">
                            <Link href="/" className="block text-white">
                               <span className="text-[24px] font-bold">PeopleTrust</span>
                            </Link>
                        </div>

                        {/* <div className="hidden md:block">
                            <nav aria-label="Global">
                                <ul className="flex items-center gap-6 text-sm">
                                    <li>
                                        <a
                                            className="text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75"
                                            href="#"
                                        >
                                            About
                                        </a>
                                    </li>

                                    <li>
                                        <a
                                            className="text-gray-500 transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75"
                                            href="#"
                                        >
                                            Careers
                                        </a>
                                    </li>

                                    <li>
                                        <a
                                            className="text-white transition hover:text-gray-500/75"
                                            href="#"
                                        >
                                            History
                                        </a>
                                    </li>

                                    <li>
                                        <a
                                            className="text-white transition hover:text-gray-500/75"
                                            href="#"
                                        >
                                            Services
                                        </a>
                                    </li>

                                    <li>
                                        <a
                                            className="text-white transition hover:text-gray-500/75"
                                            href="#"
                                        >
                                            Projects
                                        </a>
                                    </li>

                                    <li>
                                        <a
                                            className="text-white transition hover:text-gray-500/75 dark:text-white dark:hover:text-white/75"
                                            href="#"
                                        >
                                            Blog
                                        </a>
                                    </li>
                                </ul>
                            </nav>
                        </div> */}

                        <div className="flex items-center gap-4">
                            <div className="sm:flex sm:gap-4">
                            <HoverBorderGradient
                                containerClassName="rounded-full"
                                as="button"
                                onClick={() => router.push('/form')}
                                className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
                            >
                                
                                <span>Ajukan Nama</span>
                            </HoverBorderGradient>                            
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}

export default Header;