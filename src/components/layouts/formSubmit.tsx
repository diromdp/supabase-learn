"use client";
import React, { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import SweetAlert2 from 'react-sweetalert2';
import * as Yup from 'yup';
import { createClient } from '@/lib/supabase/client';
import { useRef } from 'react';
import ReCAPTCHA from "react-google-recaptcha";
import { ToastContainer, toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";

const validationSchema = Yup.object().shape({
    full_name: Yup.string()
        .required('Nama lengkap wajib diisi')
        .min(3, 'Nama minimal 3 karakter'),
    phone_number: Yup.string()
        .required('Nomor telepon wajib diisi')
        .matches(/^(\+62|62|0)8[1-9][0-9]{6,9}$/, 'Format nomor telepon tidak valid'),
    facebook_url: Yup.string()
        .matches(/^(https?:\/\/)?(www\.)?facebook.com\/[A-Za-z0-9._-]+$/, 'URL Facebook tidak valid')
        .nullable(),
    instagram_url: Yup.string()
        .matches(/^(https?:\/\/)?(www\.)?instagram.com\/[A-Za-z0-9._-]+$/, 'URL Instfvagram tidak valid')
        .nullable(),
    twitter_url: Yup.string()
        .matches(/^(https?:\/\/)?(www\.)?x.com\/[A-Za-z0-9._-]+$/, 'URL Twitter tidak valid')
        .nullable(),
    linkedin_url: Yup.string()
        .matches(/^(https?:\/\/)?(www\.)?linkedin.com\/in\/[A-Za-z0-9._-]+$/, 'URL LinkedIn tidak valid')
        .nullable(),
    captcha: Yup.string().nullable(),
});

interface FormValues {
    id: number;
    full_name: string;
    phone_number: string;
    facebook_url: string | null;
    instagram_url: string | null;
    twitter_url: string | null;
    linkedin_url: string | null;
    captcha: string;
}


const FormSubmit: React.FC = () => {
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const [swal, setSwal] = useState<any>({});

    const initialValues: FormValues = {
        id: 0,
        full_name: '',
        phone_number: '',
        facebook_url: '',
        instagram_url: '',
        twitter_url: '',
        linkedin_url: '',
        captcha: '',
    };

    const checkIfExists = async (values: FormValues): Promise<string | null> => {
        const { full_name, phone_number, facebook_url, linkedin_url, instagram_url, twitter_url } = values;
        const supabase = createClient();

        setSwal({});
    
        // Check full_name first
        let { data, error } = await supabase.from('person_identifications').select('id').eq('full_name', full_name);
        if (error) {
            console.error("Error checking full_name existence:", error);
            return 'Terjadi kesalahan saat memeriksa data';
        }
        if (data && data.length > 0) {
            return 'Data sudah ada di database';
        }
    
        // Check phone_number next
        ({ data, error } = await supabase.from('person_identifications').select('id').eq('phone_number', phone_number));
        if (error) {
            console.error("Error checking phone_number existence:", error);
            return 'Terjadi kesalahan saat memeriksa data';
        }
        if (data && data.length > 0) {
            return 'Data entitas sudah ada di database kami';
        }

        ({ data, error } = await supabase.from('person_identifications').select('id').eq('facebook_url', facebook_url));
        if (error) {
            console.error("Error checking Facebook existence:", error);
            return 'Terjadi kesalahan saat memeriksa data';
        }
        if (data && data.length > 0) {
            console.log('Data entitas sudah ada di database kami');
            return 'Data entitas sudah ada di database kami';
        }

        ({ data, error } = await supabase.from('person_identifications').select('id').eq('linkedin_url', linkedin_url));
        if (error) {
            console.error("Error checking LinkedIn existence:", error);
            return 'Terjadi kesalahan saat memeriksa data';
        }
        if (data && data.length > 0) {
            return 'Data entitas sudah ada di database kami';
        }
        ({ data, error } = await supabase.from('person_identifications').select('id').eq('instagram_url', instagram_url));
        if (error) {
            console.error("Error checking Instagram existence:", error);
            return 'Terjadi kesalahan saat memeriksa data';
        }
        if (data && data.length > 0) {
            return 'Data entitas sudah ada di database kami';
        }
        ({ data, error } = await supabase.from('person_identifications').select('id').eq('twitter_url', twitter_url));
        if (error) {
            console.error("Error checking Twitter existence:", error);
            return 'Terjadi kesalahan saat memeriksa data';
        }
        if (data && data.length > 0) {
            return 'Data entitas sudah ada di database kami';
        }

        return null;
    }

    const handleSubmit = async (values: FormValues, { resetForm, setSubmitting, setFieldValue, setErrors }: any) => {
        try {
            const { facebook_url, instagram_url, twitter_url, linkedin_url } = values;
            const duplicateMessage = await checkIfExists(values);

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

            if (duplicateMessage) {
                setSwal({
                    show: true,
                    title: 'Duplicate Entitas',
                    text: duplicateMessage,
                });
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

            const supabase = createClient();
            const { data, error } = await supabase
                .from('person_identifications')
                .insert([{
                    full_name: values.full_name,
                    phone_number: values.phone_number,
                    facebook_url: values.facebook_url || null,
                    instagram_url: values.instagram_url || null,
                    twitter_url: values.twitter_url || null,
                    linkedin_url: values.linkedin_url || null,
                    is_approved: false,
                }])
                .select();

            if (error) throw error;

            if (data && data.length > 0) {
                const id = data[0].id;
                toast.success('Data berhasil disimpan, menunggu approval dari kami', {
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
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-4xl text-left mb-[16px]">Form Identifikasi</CardTitle>
                    <CardDescription>Masukkan informasi berikut untuk membantu kami mengidentifikasi seseorang atau badan usaha atau brand. Pastikan data yang dimasukkan akurat agar hasilnya tepat.</CardDescription>
                </CardHeader>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, submitForm, values }) => (
                        <Form >
                            <CardContent>
                                <div className="space-y-8">
                                    <div className="form-group">
                                        <Label
                                            htmlFor="full-name"
                                            className="relative block overflow-hidden rounded-md border border-gray-200 px-3 pt-3 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 dark:border-gray-700 dark:bg-gray-800"
                                        >
                                            <Field
                                                type="text"
                                                id="full-name"
                                                name="full_name"
                                                value={values.full_name || ''}
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
                                            name="full_name"
                                            component="div"
                                            className="mt-1 text-sm text-red-600"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Label
                                            htmlFor="phone-number"
                                            className="relative block overflow-hidden rounded-md border border-gray-200 px-3 pt-3 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 dark:border-gray-700 dark:bg-gray-800"
                                        >
                                            <Field
                                                type="text"
                                                id="phone-number"
                                                name="phone_number"
                                                value={values.phone_number || ''}
                                                placeholder="Masukkan nomor telepon"
                                                className="peer h-8 w-full border-none bg-transparent p-0 placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0 sm:text-sm dark:text-white"
                                            />

                                            <span
                                                className="absolute start-3 top-3 -translate-y-1/2 text-xs text-gray-700 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:text-xs dark:text-gray-200"
                                            >
                                                Nomor Telepon / Nomor Whatsapp
                                            </span>
                                        </Label>
                                        <ErrorMessage
                                            name="phone_number"
                                            component="div"
                                            className="mt-1 text-sm text-red-600"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Label
                                            htmlFor="facebook-url"
                                            className="relative block overflow-hidden rounded-md border border-gray-200 px-3 pt-3 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 dark:border-gray-700 dark:bg-gray-800"
                                        >
                                            <Field
                                                type="text"
                                                id="facebook-url"
                                                name="facebook_url"
                                                value={values.facebook_url || ''}
                                                placeholder="Masukkan link profil Facebook"
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
                                            htmlFor="instagram-url"
                                            className="relative block overflow-hidden rounded-md border border-gray-200 px-3 pt-3 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 dark:border-gray-700 dark:bg-gray-800"
                                        >
                                            <Field
                                                type="text"
                                                id="instagram-url"
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
                                            htmlFor="twitter-url"
                                            className="relative block overflow-hidden rounded-md border border-gray-200 px-3 pt-3 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 dark:border-gray-700 dark:bg-gray-800"
                                        >
                                            <Field
                                                type="text"
                                                id="twitter-url"
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
                                            htmlFor="linkedin-url"
                                            className="relative block overflow-hidden rounded-md border border-gray-200 px-3 pt-3 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 dark:border-gray-700 dark:bg-gray-800"
                                        >
                                            <Field
                                                type="text"
                                                id="linkedin-url"
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
                                </div>
                                <div className="flex justify-end mt-[32px]">
                                    <ReCAPTCHA
                                        ref={recaptchaRef}
                                        size="invisible" // Use "normal" for checkbox
                                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="gap-[16px] justify-end">
                                <Button
                                    disabled={isSubmitting}
                                    onClick={submitForm}
                                    type="submit">
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </CardFooter>
                        </Form>
                    )}
                </Formik>
            </Card>
            <ToastContainer className={"!z-[100] !top-[62px]"} />
            <SweetAlert2 {...swal} />
        </>

    );
}

export default FormSubmit;