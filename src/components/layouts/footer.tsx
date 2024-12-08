"use client";
import React from "react";

interface FooterProps {

}

const Footer: React.FC<FooterProps> = () => {

    const currentYear = new Date().getFullYear(); 
    return (
        <>
            <footer className="bg-black">
                <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:py-6">
                    <div className="sm:flex sm:items-center sm:justify-between">

                        <p className="mt-4 text-center text-sm text-white lg:mt-0 lg:text-right">
                            Copyright &copy; {currentYear}. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </>
    );
}

export default Footer;