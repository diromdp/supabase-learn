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
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const validationSchema = Yup.object().shape({
    full_name: Yup.string()
        .required('Name is required')
        .min(3, 'Name must be at least 3 characters'),
    phone_number: Yup.string()
        .matches(/^(\+62|62|0)8[1-9][0-9]{6,9}$/, 'Format nomor telepon tidak valid')
        .nullable(),
    facebook_url: Yup.string()
        .matches(/^(https?:\/\/)?(www\.)?facebook.com\/[A-Za-z0-9._-]+\/?$/, 'Facebook Url not valid')
        .nullable(),
    instagram_url: Yup.string()
        .matches(/^(https?:\/\/)?(www\.)?instagram.com\/[A-Za-z0-9._-]+\/?$/, 'Instagram Url not valid')
        .nullable(),
    twitter_url: Yup.string()
        .matches(/^(https?:\/\/)?(www\.)?x.com\/[A-Za-z0-9._-]+\/?$/, 'Twitter Url not valid')
        .nullable(),
    linkedin_url: Yup.string()
        .matches(/^(https?:\/\/)?(www\.)?linkedin.com\/(in\/[A-Za-z0-9_-]+|company\/[A-Za-z0-9_-]+)\/?$/, 'LinkedIn URL is not valid')
        .nullable(),
    type: Yup.string().required('Type is required'),
    path_image: Yup.string().nullable(),
    captcha: Yup.string().nullable(),
});

interface FormValues {
    id: number;
    full_name: string;
    type?: string;
    path_image?: string;
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
        type: '',
        path_image: '',
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
            return 'An error occurred while checking the data';
        }
        if (data && data.length > 0) {
            return 'The data already exists in the database';
        }

        // Check phone_number next
        ({ data, error } = await supabase.from('person_identifications').select('id').eq('phone_number', phone_number));
        if (error) {
            console.error("Error checking phone_number existence:", error);
            return 'An error occurred while checking the data';
        }
        if (data && data.length > 0) {
            return 'This entity\'s data already exists in our database';
        }

        ({ data, error } = await supabase.from('person_identifications').select('id').eq('facebook_url', facebook_url));
        if (error) {
            console.error("Error checking Facebook existence:", error);
            return 'An error occurred while checking the data';
        }
        if (data && data.length > 0) {
            console.log('This entity\'s data already exists in our database');
            return 'This entity\'s data already exists in our database';
        }

        ({ data, error } = await supabase.from('person_identifications').select('id').eq('linkedin_url', linkedin_url));
        if (error) {
            console.error("Error checking LinkedIn existence:", error);
            return 'An error occurred while checking the data';
        }
        if (data && data.length > 0) {
            return 'This entity\'s data already exists in our database';
        }

        ({ data, error } = await supabase.from('person_identifications').select('id').eq('instagram_url', instagram_url));
        if (error) {
            console.error("Error checking Instagram existence:", error);
            return 'An error occurred while checking the data';
        }
        if (data && data.length > 0) {
            return 'This entity\'s data already exists in our database';
        }

        ({ data, error } = await supabase.from('person_identifications').select('id').eq('twitter_url', twitter_url));
        if (error) {
            console.error("Error checking Twitter existence:", error);
            return 'An error occurred while checking the data';
        }
        if (data && data.length > 0) {
            return 'This entity\'s data already exists in our database';
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
                    facebook_url: 'At least one social media URL must be provided',
                    instagram_url: 'At least one social media URL must be provided',
                    twitter_url: 'At least one social media URL must be provided',
                    linkedin_url: 'At least one social media URL must be provided',
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
                    type: values.type,
                    phone_number: values.phone_number,
                    path_image: values.path_image,
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
                toast.success('Data has been successfully saved, awaiting approval from us', {
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
            toast.error(error.message || 'An error occurred while saving the data', {
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
            <Card className="my-[88px]">
                <CardHeader>
                    <CardTitle className="text-4xl text-left mb-[16px]">Identification Form</CardTitle>
                    <CardDescription>Enter the following information to help us identify an individual, business, or brand. Please ensure the data entered is accurate for precise results.</CardDescription>
                </CardHeader>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, submitForm, values, setFieldValue }) => (
                        <Form >
                            <CardContent>
                                <div className="space-y-5">
                                    <div className="form-group">
                                        <Label
                                            htmlFor="full-name"
                                            className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200"
                                        >
                                            Name
                                        </Label>
                                        <Field
                                                type="text"
                                                id="full-name"
                                                name="full_name"
                                                value={values.full_name || ''}
                                                placeholder="Enter name"
                                                className="w-full px-[16px] py-[8px] rounded-md border-gray-200 shadow-sm sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                            />
                                        <ErrorMessage
                                            name="full_name"
                                            component="div"
                                            className="mt-1 text-sm text-red-600"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Label
                                            htmlFor="phone-number"
                                            className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200"
                                        >
                                            Phone Number / WhatsApp Number
                                        </Label>
                                        <Field
                                            type="text"
                                            id="phone-number"
                                            name="phone_number"
                                            value={values.phone_number || ''}
                                            placeholder="Example: 081834459444"
                                            className="w-full px-[16px] py-[8px] rounded-md border-gray-200 shadow-sm sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                        <ErrorMessage
                                            name="phone_number"
                                            component="div"
                                            className="mt-1 text-sm text-red-600"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Label
                                            htmlFor="facebook-url"
                                            className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200"
                                        >
                                            Facebook Profile URL
                                        </Label>
                                        <Field
                                            type="text"
                                            id="facebook-url"
                                            name="facebook_url"
                                            value={values.facebook_url || ''}
                                            placeholder="Example: https://www.facebook.com/username"
                                            className="w-full px-[16px] py-[8px] rounded-md border-gray-200 shadow-sm sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                        <ErrorMessage
                                            name="facebook_url"
                                            component="div"
                                            className="mt-1 text-sm text-red-600"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Label
                                            htmlFor="instagram-url"
                                            className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200"
                                        >
                                            Instagram Profile URL
                                        </Label>
                                        <Field
                                            type="text"
                                            id="instagram-url"
                                            name="instagram_url"
                                            value={values.instagram_url || ''}
                                            placeholder="Example: https://www.instagram.com/username"
                                            className="w-full px-[16px] py-[8px] rounded-md border-gray-200 shadow-sm sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                        <ErrorMessage
                                            name="instagram_url"
                                            component="div"
                                            className="mt-1 text-sm text-red-600"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Label
                                            htmlFor="twitter-url"
                                            className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200"
                                        >
                                            X (Twitter) Profile URL
                                        </Label>
                                        <Field
                                            type="text"
                                            id="twitter-url"
                                            name="twitter_url"
                                            value={values.twitter_url || ''}
                                            placeholder="Example: https://www.x.com/username"
                                            className="w-full px-[16px] py-[8px] rounded-md border-gray-200 shadow-sm sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                        <ErrorMessage
                                            name="twitter_url"
                                            component="div"
                                            className="mt-1 text-sm text-red-600"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Label
                                            htmlFor="linkedin-url"
                                            className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200"
                                        >
                                            LinkedIn Profile URL
                                        </Label>
                                        <Field
                                            type="text"
                                            id="linkedin-url"
                                            name="linkedin_url"
                                            value={values.linkedin_url || ''}
                                            placeholder="Example: https://www.linkedin.com/id/username"
                                            className="w-full px-[16px] py-[8px] rounded-md border-gray-200 shadow-sm sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                        <ErrorMessage
                                            name="linkedin_url"
                                            component="div"
                                            className="mt-1 text-sm text-red-600"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">
                                            Url Path thumbnail
                                        </Label>
                                        <Field
                                            type="text"
                                            id="thumbnail"
                                            name="path_image"
                                            value={values.path_image || ''}
                                            placeholder="Enter link path thumbnail minimum size 120x120. Example: https://i.pravatar.cc/150?img=3"
                                            className="w-full px-[16px] py-[8px] rounded-md border-gray-200 shadow-sm sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">
                                            Type
                                        </Label>
                                        <Select
                                            value={values.type}
                                            onValueChange={(value) => setFieldValue("type", value)}

                                        >
                                            <SelectTrigger className="w-[240px] rounded-md border border-gray-200 px-3 py-3 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 dark:border-gray-700 dark:bg-gray-800">
                                                <SelectValue placeholder="Select a type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="Individual">Individual</SelectItem>
                                                    <SelectItem value="Government Official">Government Official</SelectItem>
                                                    <SelectItem value="Public Figure">Public Figure</SelectItem>
                                                    <SelectItem value="Religion Figure">Religion Figure</SelectItem>
                                                    <SelectItem value="Regional Official">Regional Official</SelectItem>
                                                    <SelectItem value="Brand">Brand</SelectItem>
                                                    <SelectItem value="Company">Company</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
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
                                    {isSubmitting ? 'Saving...' : 'Save'}
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