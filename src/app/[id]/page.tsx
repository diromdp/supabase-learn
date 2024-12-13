"use client";
import React from "react";
import dynamic from 'next/dynamic';
import CardPeople from "@/components/layouts/cardPeople";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import SweetAlert2 from 'react-sweetalert2';
import { useRouter } from 'next/navigation';
import { useDebounce } from "@uidotdev/usehooks";
import { SweetAlertProps } from "@/lib/types/alert.types";
import { Comment } from "@/lib/types/listReview.types";

const FormReview = dynamic(() => import('@/components/layouts/formReview'));
const ListReview = dynamic(() => import('@/components/layouts/listReview'));
const Modal = dynamic(() => import('@/components/ui/modal'));


const Result: React.FC= () => {

    const [dataDetail, setDataDetail] = useState<any>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [swal, setSwal] = useState<SweetAlertProps>({});
    const [loadingScroll, setLoadingScroll] = useState<boolean>(false);
    const [scrollPosition, setScrollPosition] = useState<number>(0);
    const debouncedScrollPosition = useDebounce(scrollPosition, 200);
    const [reviews, setReviews] = useState<Comment[]>([]);

    const currentPageRef = useRef<number>(1);
    const router = useRouter();

    const params = useParams();
    const idUser = params.id as string;

    const calculateAverageScore = async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('reviews')
            .select('rating')
            .eq('person_id', idUser);

        if (error || !data) {
            console.error('Error fetching ratings:', error);
            return 0;
        }

        if (data.length === 0) return 0;

        // Calculate average rating (1-5 scale)
        const sum = data.reduce((acc, review) => acc + Number(review.rating), 0);
        const average = sum / data.length;
        
        // Convert to 0-100 scale and round to nearest integer
        const score = Math.round((average / 5) * 100);
        return score;
    };

    const fetchData = async () => {
        const supabase = createClient();
        const { data, error } = await supabase.from('person_identifications').select('*').eq('id', params.id);
        
        if (error || data.length === 0) {
            setLoading(false);
            setSwal({
                show: true,
                title: 'Informasi',
                text: 'Data tidak ditemukan, Silahkan coba lagi!',
                willClose: () => {
                    router.push('/');
                }
            });
            return;
        }

        if (data) {
            const averageScore = await calculateAverageScore();
            setDataDetail({ ...data[0], score: averageScore });
            setLoading(false);
        }
    };

    const fetchReviews = async (page: number = 1, limit: number = 4) => {
        if (!hasMore) return; // Stop fetching if no more data

        setLoadingScroll(true);
        const supabase = createClient();
        const { data, error, count } = await supabase
            .from('reviews')
            .select('*', { count: 'exact' })
            .eq('person_id', idUser)
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (error) {
            console.log('Error fetching reviews:', error);
        }
        if (data) {
            const newReviews = data.filter(review =>
                !reviews.some(existingReview => existingReview.id === review.id)
            );
            setReviews([...reviews, ...newReviews]);
            if (count !== null && reviews.length >= count) {
                setHasMore(false); // No more data to fetch
            }
        }
        setLoadingScroll(false);
    }

    const handleReviewsUpdate = (newReview: Comment) => {
        setReviews([...reviews, newReview]);
    };

    useEffect(() => {
        const initializeData = async () => {
            setLoading(true);
            await Promise.all([fetchData(), fetchReviews()]);
            setLoading(false);
        };
        
        initializeData();
    }, []);

    useEffect(() => {
        let ticking = false;
        
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setScrollPosition(window.scrollY);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!loading && 
            hasMore && 
            !loadingScroll && 
            window.innerHeight + debouncedScrollPosition >= document.documentElement.scrollHeight - 100) {
            // Load more reviews when scrolled near the bottom
            const nextPage = currentPageRef.current + 1;
            fetchReviews(nextPage);
            currentPageRef.current = nextPage;
        }
    }, [debouncedScrollPosition, loading, hasMore, loadingScroll]);

    const handleFormSubmit = async () => {
        // Logic to handle form submission
        await fetchReviews();
    }


    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    return (
        <>
            <div className="mx-auto max-w-screen-xl px-4 my-[48px] md:my-[88px] lg:flex lg:items-center relative z-[10]">
                <div className="mx-auto max-w-2xl">
                    {
                        dataDetail && (
                            <CardPeople
                                name={dataDetail.full_name}
                                phone={dataDetail.phone_number}
                                facebook={dataDetail.facebook_url}
                                twitter={dataDetail.twitter_url}
                                instagram={dataDetail.instagram_url}
                                linkedin={dataDetail.linkedin_url}
                                score={dataDetail.score}
                                path_image={dataDetail.path_image}
                                public_office={dataDetail.type}
                                isDetail={true}
                            />
                        )
                    }
                    <div className="mt-[32px]">
                        <FormReview id={idUser} onReviewsUpdate={handleReviewsUpdate} onSubmitComponent={handleFormSubmit} setSwal={setSwal} />
                    </div>
                    <div className="mt-[32px]">
                        <h2 className="mb-[16px] font-semibold text-3xl">What do people say?</h2>
                        {
                            reviews && <ListReview reviews={reviews} />
                        }
                    </div>
                    {loadingScroll && <div className="text-center text-[#fafafa] font-semibold text-[16px] my-4">Loading more reviews...</div>}
                </div>
            </div>
            <Modal showModal={showModal} setShowModal={setShowModal}>
                <div className="flex justify-start items-center">
                    <div className="flex-col flex justify-center items-start gap-[16px]">
                        <div className="flex flex-row gap-[8px] items-center">
                            <div className="w-[32px] h-[32px] rounded-full bg-green-500 block"></div>
                            <span className="text-[18px] font-normal w-full">Index Score 80 - 100 point: <span className="font-semibold">Sangat Kredibel</span></span>
                        </div>
                        <div className="flex flex-row gap-[8px] items-center">
                            <div className="w-[32px] h-[32px] rounded-full bg-orange-500 block"></div>
                            <span className="text-[18px] font-normal w-full">Index Score 50 - 80 point: <span className="font-semibold">Cukup Kredibel</span></span>
                        </div>
                        <div className="flex flex-row gap-[8px] items-center">
                            <div className="w-[32px] h-[32px] rounded-full bg-red-500 block"></div>
                            <span className="text-[18px] font-normal w-full">Index Score 0 - 50 point: <span className="font-semibold">Tidak Kredibel</span></span>
                        </div>
                    </div>
                </div>
            </Modal>
            <SweetAlert2 {...swal} />
        </>
    );
}

export default Result;

