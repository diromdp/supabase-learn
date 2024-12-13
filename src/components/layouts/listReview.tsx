"use client";
import * as React from 'react';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FaSquareFacebook, FaSquareInstagram, FaSquareXTwitter, FaLinkedin } from "react-icons/fa6";
import Link from 'next/link';
import NoReview from "@/components/layouts/noReview";
import { FaExternalLinkAlt } from "react-icons/fa";
import { Comment } from "@/lib/types/listReview.types";

interface ListReviewProps {
    reviews: Comment[];
}

const ListReview: React.FC<ListReviewProps> = ({ reviews }) => {

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const RatingStars = ({ rating }: { rating: number }) => {
        return (
            <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={20}
                        className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`}
                    />
                ))}
            </div>
        );
    };

    return (
        <>
            <div className="w-full">
                <div className="space-y-6">
                    {reviews && reviews.map((comment, index) => (
                        <div key={index} className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                                        <Avatar className="w-10 h-10">
                                            <AvatarImage src={`https://avatar.iran.liara.run/username?username=${comment.reviewer_name}`} />
                                            <AvatarFallback>{comment.reviewer_name}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="font-semibold text-gray-200">{comment.reviewer_name}</h3>
                                        <p className="text-sm text-gray-400">
                                            {comment.title_job ? `${comment.title_job} | ` : ''}{formatDate(comment.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-300 mb-3">{comment.comment}</p>
                            {
                                comment.link_url && (
                                    <Link href={`${comment.link_url}`} className="text-[12px] flex flex-row items-center gap-[4px] text-red-500 w-fit" target="_blank">
                                        <span className="text-[14px]">Link</span>
                                        <FaExternalLinkAlt />
                                    </Link>
                                )
                            }
                            {(comment.facebook_url || comment.twitter_url || comment.instagram_url || comment.linkedin_url) && (
                                <div className="my-[16px] flex flex-row gap-[8px]">
                                    {
                                        comment.facebook_url && (
                                            <Link href={`${comment.facebook_url}`} target="_blank">
                                                <FaSquareFacebook />
                                            </Link>
                                        )
                                    }
                                    {
                                        comment.twitter_url && (
                                            <Link href={`${comment.twitter_url}`} target="_blank">
                                                <FaSquareXTwitter />
                                            </Link>
                                        )
                                    }
                                    {
                                        comment.instagram_url && (
                                            <Link href={`${comment.instagram_url}`} target="_blank">
                                                <FaSquareInstagram />
                                            </Link>)
                                    }
                                    {
                                        comment.linkedin_url && (
                                            <Link href={`${comment.linkedin_url}`} target="_blank">
                                                <FaLinkedin />
                                            </Link>)
                                    }
                                </div>
                            )}
                            <div className='flex items-center justify-between'>
                                <RatingStars rating={comment.rating} />
                            </div>
                        </div>

                    ))}

                    {
                       reviews.length == 0 && <NoReview />
                    }
                </div>
            </div>
        </>
    );
}

export default ListReview;