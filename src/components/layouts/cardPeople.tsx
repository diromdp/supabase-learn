import React from "react";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FaSquareFacebook, FaSquareInstagram, FaSquareXTwitter, FaLinkedin } from "react-icons/fa6";
import Link from "next/link";
import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { CardPeopleProps } from '@/lib/types/cardPeople.types';

const CardPeople: React.FC<CardPeopleProps> = ({
    name = "Unknown",
    phone = "N/A",
    facebook = null,
    twitter = null,
    instagram = null,
    linkedin = null,
    score = 0,
    className = "",
    setShowModal = () => { },
    isHome = false,
    isDetail = false,
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
                        isDetail ? (

                            <>
                                <div className="flex flex-col md:flex-row gap-10 items-center justify-between">
                                    <div className="flex flex-col justify-center items-center w-[180px] h-[240px] lg:w-[200px] lg:h-[150px]">
                                        {
                                            path_image ? (
                                                <img src={path_image} alt="Nama orang" className="w-full h-full object-cover rounded-[10px]" />
                                            ) : (
                                                <Avatar className="w-full h-full rounded-[10px] select-none">
                                                    <AvatarFallback className="rounded-[10px] text-[32px]">{getInitials(name)}</AvatarFallback>
                                                </Avatar>
                                            )
                                        }
                                    </div>
                                    <div className="flex flex-col relative w-full">
                                        {
                                            (public_office && public_office !== 'Individual') && public_office !== 'Individual' && (
                                                <Badge className="text-left w-fit" variant="destructive">{public_office}</Badge>
                                            )
                                        }
                                        <div className="flex flex-col w-[80%] md:w-full">
                                            <div className={`${public_office ? "mt-[20px]" : ""} mb-[8px] text-left`}>
                                                <span className="text-[20px] font-[500] leading-5">Full Name: {name && name}</span>
                                            </div>
                                            {
                                                (!public_office && public_office !== 'Individual')  && (
                                                    <div className="mb-[8px] text-left">
                                                        <span className="text-[20px] font-[500] leading-5">Phone Number: {phone ? phone.replace(/.(?=.{4})/g, '*') : "N/A"}</span>
                                                    </div>
                                                )
                                            }
                                            <div className="mb-[8px] text-left">
                                                <span className="block text-[20px] font-[500] leading-5">Social Media Profile:</span>
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
                                                            </Link>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        {
                                            score !== 0 && (
                                                <div onClick={() => setShowModal(true)} className={`absolute cursor-pointer top-[0px] right-[0px] p-[16px] rounded-xl flex flex-col justify-center items-center w-[68px] h-[68px] ${getScoreColor(score)}`}>
                                                    <span className="text-[14px] block font-semibold">Score</span>
                                                    <span className="text-[22px] block font-bold">{score ? score : 0}</span>
                                                </div>
                                            )
                                        }
                                    </div>
                                </div>

                            </>
                        ) : (
                            <>
                                {
                                    public_office && (
                                        <Badge className="mb-[8px] text-left absolute top-[16px] left-[24px]" variant="destructive">{public_office}</Badge>
                                    )
                                }
                                <div className="flex flex-col w-[70%] md:w-full">
                                    <div className={`${public_office ? "mt-[20px]" : ""} mb-[8px] text-left`}>
                                        <span className="text-[20px] font-[500] leading-5">Full Name: {name && name}</span>
                                    </div>
                                    {
                                        !public_office && (
                                            <div className="mb-[8px] text-left">
                                                <span className="text-[20px] font-[500] leading-5">Phone Number: {phone ? phone.replace(/.(?=.{4})/g, '*') : "N/A"}</span>
                                            </div>
                                        )
                                    }
                                    <div className="mb-[8px] text-left">
                                        <span className="block text-[20px] font-[500] leading-5">Social Media Profile:</span>
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
                                                    </Link>
                                                )
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
                                        <div className="absolute cursor-pointer top-[32px] right-[32px] flex flex-col justify-center items-center w-[64px] h-[64px]">
                                            {
                                                path_image ? (
                                                    <img src={path_image} alt="Nama orang" className="w-full h-full object-cover rounded-full" />
                                                ) : (
                                                    <Avatar>
                                                        <AvatarFallback>{getInitials(name)}</AvatarFallback>
                                                    </Avatar>
                                                )
                                            }
                                        </div>
                                    )
                                }
                            </>
                        )
                    }
                </CardContent>
            </Card>
        </>
    );
}

export default CardPeople;