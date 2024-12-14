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
        .required('Full name is required')
        .min(3, 'Name must be at least 3 characters'),
    title_job: Yup.string()
        .required('Title Work is required')
        .min(3, 'Title Work must be at least 3 characters'),
    facebook_url: Yup.string()
        .trim()
        .matches(/^(https?:\/\/)?(www\.)?facebook.com\/[A-Za-z0-9._-]+\/?$/, 'Facebook url not valid')
        .nullable(),
    instagram_url: Yup.string()
        .trim()
        .matches(/^(https?:\/\/)?(www\.)?instagram.com\/[A-Za-z0-9._-]+\/?$/, 'Instagram url not valid')
        .nullable(),
    twitter_url: Yup.string()
        .trim()
        .matches(/^(https?:\/\/)?(www\.)?x.com\/[A-Za-z0-9._-]+\/?$/, 'Twitter url not valid')
        .nullable(),
    linkedin_url: Yup.string()
        .trim()
        .matches(/^(https?:\/\/)?(www\.)?linkedin.com\/(in\/[A-Za-z0-9_-]+|company\/[A-Za-z0-9_-]+)\/?$/, 'Linkedin url not valid')
        .nullable(),
    comment: Yup.string()
        .required('Comment is required')
        .min(10, 'Comment must be at least 10 characters'),
    link_url: Yup.string()
        .url('Link must be a valid URL')
        .nullable(),
    captcha: Yup.string().nullable(),
}).test(
    'at-least-one-social-url',
    'At least one social media url is required',
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
            toast.error('Failed to retrieve IP address. Please reload the page.', {
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
                toast.error('Please wait a moment, loading IP data...', {
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
                    facebook_url: 'At least one social media URL must be provided',
                    instagram_url: 'At least one social media URL must be provided',
                    twitter_url: 'At least one social media URL must be provided',
                    linkedin_url: 'At least one social media URL must be provided',
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
                throw new Error('Captcha verification failed');
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

            toast.success('Review has been successfully saved', {
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
    }

    const handleSubmit = async (values: FormValues, { resetForm, setSubmitting, setFieldValue, setErrors }: any) => {
        try {
            setSubmitting(true);

            if (isIpLoading || !ipAddress) {
                toast.error('Please wait a moment, loading data...', {
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
                toast.error('An error occurred, please try again later', {
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
                toast.error('You have already submitted a review for this entity.', {
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
                toast.error(error.message || 'An error occurred, please try again later', {
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
                                <CardTitle className="text-4xl text-left mb-[16px]">Leave Your Review</CardTitle>
                                <CardDescription>Help the community by sharing your experience. Leave a review about the credibility of this person, company, artist, politician, or official based on your interactions.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-5">
                                    <div className="form-group">
                                        <Label
                                            htmlFor="Name"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                                        >
                                           Full Name
                                        </Label>
                                        <Field
                                            type="text"
                                            name="reviewer_name"
                                            id="Name"
                                            value={values.reviewer_name || ''}
                                            placeholder="Enter full name"
                                            className="w-full px-[16px] py-[8px] rounded-md border-gray-200 shadow-sm sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                        <ErrorMessage
                                            name="reviewer_name"
                                            component="div"
                                            className="mt-1 text-sm text-red-600"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Label
                                            htmlFor="title_job"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                                        >
                                            Job Title
                                        </Label>
                                        <Field
                                            type="text"
                                            name="title_job"
                                            id="title_job"
                                            value={values.title_job || ''}
                                            placeholder="Enter job title"
                                            className="w-full px-[16px] py-[8px] rounded-md border-gray-200 shadow-sm sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                        <ErrorMessage
                                            name="title_job"
                                            component="div"
                                            className="mt-1 text-sm text-red-600"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Label
                                            htmlFor="Facebook"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                                        >
                                            Facebook Profile URL
                                        </Label>
                                        <Field
                                            type="text"
                                            id="Facebook"
                                            name="facebook_url"
                                            placeholder="Example: https://www.facebook.com/username"
                                            value={values.facebook_url || ''}
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
                                            htmlFor="Twitter"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                                        >
                                            X (Twitter) Profile URL
                                        </Label>
                                        <Field
                                            type="text"
                                            id="Twitter"
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
                                            htmlFor="Instagram"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                                        >
                                            Instagram Profile URL
                                        </Label>
                                        <Field
                                            type="text"
                                            id="Instagram"
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
                                            htmlFor="Linkedin"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                                        >
                                            LinkedIn Profile URL
                                        </Label>
                                        <Field
                                            type="text"
                                            id="Linkedin"
                                            name="linkedin_url"
                                            value={values.linkedin_url || ''}
                                            placeholder="Example: https://www.linkedin.com/in/username"
                                            className="w-full px-[16px] py-[8px] rounded-md border-gray-200 shadow-sm sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                        <ErrorMessage
                                            name="linkedin_url"
                                            component="div"
                                            className="mt-1 text-sm text-red-600"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Label htmlFor="OrderNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                            Comment
                                        </Label>
                                        <Field
                                            as="textarea"
                                            id="OrderNotes"
                                            name="comment"
                                            className="mt-2 w-full rounded-lg border-gray-200 align-top shadow-sm px-[16px] py-[8px] sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                            rows={4}
                                            placeholder="Share your experience with this person, company, artist, politician, or official."
                                        />
                                        <ErrorMessage
                                            name="comment"
                                            component="div"
                                            className="mt-1 text-sm text-red-600"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Label htmlFor="url_link" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                            Link
                                        </Label>

                                        <Field
                                            type="text"
                                            id="url_link"
                                            name="link_url"
                                            placeholder="Enter proof link (photo, video, or document)"
                                            className="w-full px-[16px] py-[8px] rounded-md border-gray-200 shadow-sm sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setSwal({
                                            show: true,
                                            title: 'Information',
                                            text: 'Make sure your review is accountable and accurate. We hope your review is honest to help others assess the credibility of this person, company, artist, politician, or official.',
                                            showCancelButton: true,
                                            confirmButtonText: 'Submit',
                                            cancelButtonText: 'Cancel',
                                            onConfirm: () => {
                                                submitForm(); // This will trigger the form submission
                                            }
                                        });
                                    }}
                                    type="button">
                                    {isSubmitting ? 'Saving...' : 'Save'}
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
