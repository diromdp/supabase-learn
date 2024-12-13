"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { useMediaQuery } from "@uidotdev/usehooks";
import { FcKindle } from "react-icons/fc";


const Header: React.FC = () => {
    const router = useRouter();
    const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");

    return (
        <>
            <header className="z-[99] sticky top-0 w-full bg-black border-b border-transparent">
                <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="md:flex md:items-center md:gap-12">
                            <Link href="/" className="flex flex-row items-center gap-2 text-white">
                                <img src="/icon.png" alt="ThePeopleTrust" className="h-10 w-10" />
                                <span className="text-[24px] font-bold block">ThePeopleTrust</span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="sm:flex sm:gap-4">
                            <HoverBorderGradient
                                containerClassName="rounded-full"
                                as="button"
                                onClick={() => router.push('/form')}
                                className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
                            >
                                {
                                    isSmallDevice ? (
                                        <>
                                            <FcKindle className="text-[22px]"/>
                                        </>
                                    ): (
                                        <>
                                            <span>Apply Now</span>
                                        </>
                                    )
                                }
                               
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