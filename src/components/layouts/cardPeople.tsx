import React from "react";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FaSquareFacebook, FaSquareInstagram, FaSquareXTwitter, FaLinkedin } from "react-icons/fa6";
import Link from "next/link";


interface CardPeopleProps {
    name?: string;
    full_name?: string;
    phone?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    score?: number;
    className?: string;
    isHome?: boolean;
    path_image?: string;
    public_office?: boolean;
    setShowModal?: (show: boolean) => void;
}

const CardPeople: React.FC<CardPeopleProps> = ({
    name = "Unknown",
    full_name = "Unknown",
    phone = "N/A",
    facebook = null,
    twitter = null,
    instagram = null,
    linkedin = null,
    score = 0,
    className = "",
    setShowModal = () => { },
    isHome = false,
    path_image = null,
    public_office = false
}) => {

    const getScoreColor = (score: number) => {
        if (score <= 50) return 'bg-red-500';
        if (score <= 80) return 'bg-orange-500';
        return 'bg-green-500';
    };

    return (
        <>
            <Card className={className}>
                <CardContent className={`pt-6 relative`}>
                    {
                        public_office && (
                            <Badge className="mb-[8px] text-left absolute top-[16px] left-[24px]" variant="destructive">Pejabat atau Mantan Pejabat pemerintah</Badge>
                        )
                    }
                    <div className="flex flex-col w-[70%] md:w-full">
                        <div className={`${public_office ? "mt-[20px]" : ""} mb-[8px] text-left`}>
                            <span><b>Nama Lengkap:</b> {name && name}</span>
                        </div>
                        {
                            !public_office && (
                                <div className="mb-[8px] text-left">
                                    <span><b>Nomor Telepon:</b> {phone ? phone.replace(/.(?=.{4})/g, '*') : "N/A"}</span>
                                </div>
                            )
                        }
                        <div className="mb-[8px] text-left">
                            <span className="block"><b>Profil Media Social:</b></span>
                            <div className="mt-[16px] flex flex-row gap-[8px]">
                                {
                                    facebook && (
                                        <Link href={`${facebook}`} target="_blank">
                                            <FaSquareFacebook />
                                        </Link>
                                    )
                                }
                                {
                                    twitter && (
                                        <Link href={`${twitter}`} target="_blank">
                                            <FaSquareXTwitter />
                                        </Link>
                                    )
                                }
                                {
                                    instagram && (

                                        <Link href={`${instagram}`} target="_blank">
                                            <FaSquareInstagram />
                                        </Link>)
                                }
                                {
                                    linkedin && (
                                        <Link href={`${linkedin}`} target="_blank">
                                            <FaLinkedin />
                                        </Link>)
                                }
                            </div>
                        </div>
                    </div>

                    {
                        score !== 0 && (
                            <div onClick={() => setShowModal(true)} className={`absolute cursor-pointer top-[32px] right-[32px] p-[16px] rounded-xl flex flex-col justify-center items-center w-[68px] h-[68px] ${getScoreColor(score)}`}>
                                <span className="text-[14px] block font-semibold">Score</span>
                                <span className="text-[22px] block font-bold">{score ? score : 0}</span>
                            </div>
                        )
                    }
                    {
                        isHome && (
                            <div className="absolute cursor-pointer top-[32px] right-[32px] flex flex-col justify-center items-center w-[64px] h-[64px">
                                {
                                    path_image ? (
                                        <img src={path_image} alt="Nama orang" className="w-[120px] h-auto object-cover rounded-[10px]" />
                                    ) : (
                                        <img src={"https://avatar.iran.liara.run/public/boy"} alt="Nama orang" className="w-[120px] rounded-[50%] h-auto object-cover" />
                                    )
                                }
                            </div>
                        )
                    }

                </CardContent>
            </Card>
        </>
    );
}

export default CardPeople;