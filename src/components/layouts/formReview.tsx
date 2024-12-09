'use client';
import * as React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createClient } from '@/lib/supabase/client';
import { useRef, useState, useEffect } from 'react';
import ReCAPTCHA from "react-google-recaptcha";
import { ToastContainer, toast } from 'react-toastify';
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import RatingStars from '@/components/ui/rating';

const validationSchema = Yup.object().shape({
    reviewer_name: Yup.string()
        .required('Nama lengkap wajib diisi')
        .min(3, 'Nama minimal 3 karakter'),
    title_job: Yup.string()
        .required('Judul pekerjaan wajib diisi')
        .min(3, 'Judul pekerjaan minimal 3 karakter'),
    facebook_url: Yup.string()
        .trim()
        .matches(/^(https?:\/\/)?(www\.)?facebook.com\/[A-Za-z0-9._-]+$/, 'URL Facebook tidak valid')
        .nullable(),
    instagram_url: Yup.string()
        .trim()
        .matches(/^(https?:\/\/)?(www\.)?instagram.com\/[A-Za-z0-9._-]+$/, 'URL Instagram tidak valid')
        .nullable(),
    twitter_url: Yup.string()
        .trim()
        .matches(/^(https?:\/\/)?(www\.)?x.com\/[A-Za-z0-9._-]+$/, 'URL Twitter tidak valid')
        .nullable(),
    linkedin_url: Yup.string()
        .trim()
        .matches(/^(https?:\/\/)?(www\.)?linkedin.com\/in\/[A-Za-z0-9._-]+$/, 'URL LinkedIn tidak valid')
        .nullable(),
    comment: Yup.string()
        .required('Komentar wajib diisi')
        .min(10, 'Komentar minimal 10 karakter'),
    link_url: Yup.string()
        .url('URL tidak valid')
        .nullable(),
    captcha: Yup.string().nullable(),
}).test(
    'at-least-one-social-url',
    'Setidaknya satu URL media sosial harus diisi',
    function (values) {
        const { facebook_url, instagram_url, twitter_url, linkedin_url } = values;
        const hasValidSocialUrl = [
            facebook_url,
            instagram_url,
            twitter_url,
            linkedin_url
        ].some(url => url && url.trim() !== '');

        return hasValidSocialUrl;
    }
);

interface FormReviewProps {
    id: string;
    onSubmitComponent?: () => void;
    onReviewsUpdate?: (newReview: any) => void;
    setSwal: (swal: any) => void;
}

interface FormValues {
    id: string;
    reviewer_name: string;
    title_job: string;
    facebook_url: string;
    instagram_url: string;
    twitter_url: string;
    linkedin_url: string;
    comment: string;
    rating: string;
    captcha: string;
    link_url: string;
}

const FormReview: React.FC<FormReviewProps> = ({ id, onSubmitComponent, onReviewsUpdate, setSwal }) => {
    const [rating, setRating] = useState(0);
    const [ipAddress, setIpAddress] = useState<string>('');
    const [isIpLoading, setIsIpLoading] = useState(true); // Add this line

    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const supabase = createClient();

    useEffect(() => {
        getIPAddress();
    }, []);

    const getIPAddress = async () => {
        setIsIpLoading(true);
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            if (!response.ok) {
                throw new Error('Failed to fetch IP');
            }
            const data = await response.json();
            if (data.ip) {
                setIpAddress(data.ip);
            } else {
                throw new Error('No IP returned');
            }
        } catch (error) {
            console.error('Error fetching IP:', error);
            toast.error('Gagal mendapatkan IP address. Silakan muat ulang halaman.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        } finally {
            setIsIpLoading(false);
        }
    };

    const handleRatingChange = (newRating: number) => {
        setRating(newRating);
    };

    const initialValues: FormValues = {
        id: id,
        reviewer_name: '',
        title_job: '',
        facebook_url: '',
        instagram_url: '',
        twitter_url: '',
        linkedin_url: '',
        comment: '',
        rating: '',
        captcha: '',
        link_url: '',
    };

    const submitForm = async (values: FormValues, { setErrors, setSubmitting, setFieldValue }: any, resetForm: () => void) => {
        try {
            if (!ipAddress || isIpLoading) {
                toast.error('Mohon tunggu sebentar, sedang memuat data IP...', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
                return;
            }

            const { facebook_url, instagram_url, twitter_url, linkedin_url } = values;
            const hasValidSocialUrl = [
                facebook_url,
                instagram_url,
                twitter_url,
                linkedin_url
            ].some(url => url && url.trim() !== '');

            if (!hasValidSocialUrl) {
                setErrors({
                    facebook_url: 'Setidaknya satu URL media sosial harus diisi',
                    instagram_url: 'Setidaknya satu URL media sosial harus diisi',
                    twitter_url: 'Setidaknya satu URL media sosial harus diisi',
                    linkedin_url: 'Setidaknya satu URL media sosial harus diisi',
                });
                setSubmitting(false);
                return;
            }

            const captchaToken = await recaptchaRef.current?.executeAsync();
            setFieldValue('captcha', captchaToken || ''); // Set the token to the captcha field

            recaptchaRef.current?.reset();
            const captchaResponse = await fetch('/api/verify-captcha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: captchaToken }),
            });

            const captchaResult = await captchaResponse.json();

            if (!captchaResult.success) {
                throw new Error('Verifikasi captcha gagal');
            }

            const { data, error } = await supabase
                .from('reviews')
                .insert([{
                    reviewer_name: values.reviewer_name,
                    title_job: values.title_job,
                    facebook_url: values.facebook_url || null,
                    instagram_url: values.instagram_url || null,
                    twitter_url: values.twitter_url || null,
                    linkedin_url: values.linkedin_url || null,
                    comment: values.comment,
                    link_url: values.link_url || null,
                    rating: rating.toString(),
                    mac_address: ipAddress,
                    person_id: id,
                }]);

            if (error) console.error('Error inserting review:', error);

            setRating(0);

            onSubmitComponent && onSubmitComponent();

            if (onReviewsUpdate && data) {
                onReviewsUpdate(data[0]); // Assuming data[0] is the new review
            }

            toast.success('Review berhasil disimpan', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });

            resetForm();
        } catch (error: any) {
            toast.error(error.message || 'Terjadi kesalahan saat menyimpan data', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        } finally {
            setSubmitting(false);
        }
    }

    const handleSubmit = async (values: FormValues, { resetForm, setSubmitting, setFieldValue, setErrors }: any) => {
        try {
            setSubmitting(true);

            if (isIpLoading || !ipAddress) {
                toast.error('Mohon tunggu sebentar, sedang memuat data...', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
                return;
            }

            const { data: existingReview, error: checkError } = await supabase
                .from('reviews')
                .select('id')
                .eq('mac_address', ipAddress)
                .eq('person_id', id);


            if (checkError) {
                console.error('Error checking existing review:', checkError);
                toast.error('Terjadi kesalahan, silakan coba lagi nanti', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
                resetForm();
                setRating(0);
                return;
            }

            if (existingReview && existingReview.length > 0) {
                toast.error('Anda sudah mengirimkan ulasan untuk orang ini sebelumnya.', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
                resetForm();
                setRating(0);
                return;
            }

            // If no existing review, proceed with form submission
            await submitForm(values, { setErrors, setSubmitting, setFieldValue }, resetForm);

        } catch (error: any) {
            if (error.code !== 'PGRST116') { // Ignore "no rows returned" error
                toast.error(error.message || 'Terjadi kesalahan saat menyimpan data', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, submitForm, values }) => (
                    <Form>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-4xl text-left mb-[16px]">Berikan Ulasan Anda</CardTitle>
                                <CardDescription>Bantu komunitas dengan membagikan pengalaman Anda. Berikan ulasan tentang kredibilitas orang ini berdasarkan interaksi Anda.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-8">
                                    <div className="form-group">
                                        <Label
                                            htmlFor="Name"
                                            className="relative block overflow-hidden rounded-md border border-gray-200 px-3 pt-3 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 dark:border-gray-700 dark:bg-gray-800"
                                        >
                                            <Field
                                                type="text"
                                                name="reviewer_name"
                                                id="Name"
                                                value={values.reviewer_name || ''}
                                                placeholder="Masukkan nama lengkap"
                                                className="peer h-8 w-full border-none bg-transparent p-0 placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0 sm:text-sm dark:text-white"
                                            />
                                            <span
                                                className="absolute start-3 top-3 -translate-y-1/2 text-xs text-gray-700 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:text-xs dark:text-gray-200"
                                            >
                                                Nama Lengkap
                                            </span>
                                        </Label>
                                        <ErrorMessage
                                            name="reviewer_name"
                                            component="div"
                                            className="mt-1 text-sm text-red-600"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Label
                                            htmlFor="title_job"
                                            className="relative block overflow-hidden rounded-md border border-gray-200 px-3 pt-3 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 dark:border-gray-700 dark:bg-gray-800"
                                        >
                                            <Field
                                                type="text"
                                                name="title_job"
                                                id="title_job"
                                                value={values.title_job || ''}
                                                placeholder="Masukkan judul pekerjaan"
                                                className="peer h-8 w-full border-none bg-transparent p-0 placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0 sm:text-sm dark:text-white"
                                            />
                                            <span
                                                className="absolute start-3 top-3 -translate-y-1/2 text-xs text-gray-700 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:text-xs dark:text-gray-200"
                                            >
                                                Judul Pekerjaan
                                            </span>
                                        </Label>
                                        <ErrorMessage
                                            name="title_job"
                                            component="div"
                                            className="mt-1 text-sm text-red-600"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Label
                                            htmlFor="Facebook"
                                            className="relative block overflow-hidden rounded-md border border-gray-200 px-3 pt-3 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 dark:border-gray-700 dark:bg-gray-800"
                                        >
                                            <Field
                                                type="text"
                                                id="Facebook"
                                                name="facebook_url"
                                                placeholder="Masukkan link profil Facebook"
                                                value={values.facebook_url || ''}
                                                className="peer h-8 w-full border-none bg-transparent p-0 placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0 sm:text-sm dark:text-white"
                                            />

                                            <span
                                                className="absolute start-3 top-3 -translate-y-1/2 text-xs text-gray-700 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:text-xs dark:text-gray-200"
                                            >
                                                URL Profil Facebook
                                            </span>
                                        </Label>
                                        <ErrorMessage
                                            name="facebook_url"
                                            component="div"
                                            className="mt-1 text-sm text-red-600"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Label
                                            htmlFor="Twitter"
                                            className="relative block overflow-hidden rounded-md border border-gray-200 px-3 pt-3 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 dark:border-gray-700 dark:bg-gray-800"
                                        >
                                            <Field
                                                type="text"
                                                id="Twitter"
                                                name="twitter_url"
                                                value={values.twitter_url || ''}
                                                placeholder="Masukkan link profil X (Twitter)"
                                                className="peer h-8 w-full border-none bg-transparent p-0 placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0 sm:text-sm dark:text-white"
                                            />

                                            <span
                                                className="absolute start-3 top-3 -translate-y-1/2 text-xs text-gray-700 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:text-xs dark:text-gray-200"
                                            >
                                                URL Profil X (Twitter)
                                            </span>
                                        </Label>
                                        <ErrorMessage
                                            name="twitter_url"
                                            component="div"
                                            className="mt-1 text-sm text-red-600"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Label
                                            htmlFor="Instagram"
                                            className="relative block overflow-hidden rounded-md border border-gray-200 px-3 pt-3 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 dark:border-gray-700 dark:bg-gray-800"
                                        >
                                            <Field
                                                type="text"
                                                id="Instagram"
                                                name="instagram_url"
                                                value={values.instagram_url || ''}
                                                placeholder="Masukkan link profil Instagram"
                                                className="peer h-8 w-full border-none bg-transparent p-0 placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0 sm:text-sm dark:text-white"
                                            />

                                            <span
                                                className="absolute start-3 top-3 -translate-y-1/2 text-xs text-gray-700 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:text-xs dark:text-gray-200"
                                            >
                                                URL Profil Instagram
                                            </span>
                                        </Label>
                                        <ErrorMessage
                                            name="instagram_url"
                                            component="div"
                                            className="mt-1 text-sm text-red-600"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Label
                                            htmlFor="Linkedin"
                                            className="relative block overflow-hidden rounded-md border border-gray-200 px-3 pt-3 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 dark:border-gray-700 dark:bg-gray-800"
                                        >
                                            <Field
                                                type="text"
                                                id="Linkedin"
                                                name="linkedin_url"
                                                value={values.linkedin_url || ''}
                                                placeholder="Masukkan link profil LinkedIn"
                                                className="peer h-8 w-full border-none bg-transparent p-0 placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0 sm:text-sm dark:text-white"
                                            />

                                            <span
                                                className="absolute start-3 top-3 -translate-y-1/2 text-xs text-gray-700 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:text-xs dark:text-gray-200"
                                            >
                                                URL Profil LinkedIn
                                            </span>
                                        </Label>
                                        <ErrorMessage
                                            name="linkedin_url"
                                            component="div"
                                            className="mt-1 text-sm text-red-600"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Label htmlFor="OrderNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                            Komentar
                                        </Label>
                                        <Field
                                            as="textarea"
                                            id="OrderNotes"
                                            name="comment"
                                            className="mt-2 w-full rounded-lg border-gray-200 align-top shadow-sm px-[16px] py-[8px] sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                            rows={4}
                                            placeholder="Bagikan pengalaman Anda dengan orang ini"
                                        />
                                        <ErrorMessage
                                            name="comment"
                                            component="div"
                                            className="mt-1 text-sm text-red-600"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Label htmlFor="url_link" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                            Link Tautan
                                        </Label>

                                        <Field
                                            type="text"
                                            id="url_link"
                                            name="link_url"
                                            placeholder="Masukkan link bukti (foto, video, atau dokumen)"
                                            className="mt-1 w-full px-[16px] py-[8px] rounded-md border-gray-200 shadow-sm sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                        <ErrorMessage
                                            name="link_url"
                                            component="div"
                                            className="mt-1 text-sm text-red-600"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Label htmlFor="Rating" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Rating</Label>
                                        <RatingStars
                                            initialRating={rating}
                                            onRatingChange={handleRatingChange}
                                        />
                                    </div>
                                    <div className="flex justify-end mt-[32px]">
                                        <ReCAPTCHA
                                            ref={recaptchaRef}
                                            size="invisible" // Use "normal" for checkbox
                                            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="gap-[16px] justify-end">
                                <Button
                                    disabled={isSubmitting || isIpLoading}
                                    onClick={() => {
                                        setSwal({
                                            show: true,
                                            title: 'Informasi',
                                            text: 'Pastikan ulasan Anda bisa dipertanggungjawabkan dengan benar, Kami berharap ulasan Anda jujur agar bisa membantu orang lain untuk mengetahui kredibilitas orang ini.',
                                            showCancelButton: true,
                                            confirmButtonText: 'Ya, Kirim',
                                            cancelButtonText: 'Batal',
                                            onConfirm: () => {
                                                submitForm(); // This will trigger the form submission
                                            }
                                        });
                                    }}
                                    type="submit">
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </CardFooter>
                        </Card>
                    </Form>
                )}
            </Formik>
            <ToastContainer className={"!z-[100] !top-[62px]"} />
        </>
    );
}

export default FormReview;
