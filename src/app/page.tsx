"use client";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from '@/lib/supabase/client';
import SweetAlert2 from 'react-sweetalert2';
import { SweetAlertProps } from "@/lib/types/alert.types";
import CardPeople from "@/components/layouts/cardPeople";

interface PersonIdentity {
	id: string;
	full_name: string;
	phone_number: string;
	facebook_url?: string;
	linkedin_url?: string;
	instagram_url?: string;
	twitter_url?: string;
	type?: string;
	path_image?: string;
}


export default function Home() {
	const [searchTerm, setSearchTerm] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [swal, setSwal] = useState<SweetAlertProps>({});
	const [results, setResults] = useState<PersonIdentity[]>([]);
	const router = useRouter();
	const supabase = createClient();
	const placeholders = [
		"Find entities more easily",
		"Enter Name",
		"Enter phone number or WhatsApp number",
		"Enter social media link",
		"Example: https://www.facebook.com/username",
		"Example: https://www.instagram.com/username",
		"Example: https://www.x.com/username",
		"Example: https://www.linkedin.com/id/username",
	];

	const getInputType = (input: string): string => {
		const phonePattern = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
		const facebookPattern = /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9._-]+\/?$/;
		const instagramPattern = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._-]+\/?$/;
		const linkedinPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9._-]+\/?$/;
		const twitterPattern = /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9._-]+\/?$/;
		const fullNamePattern = /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/;

		if (phonePattern.test(input)) return 'phone';
		if (facebookPattern.test(input)) return 'facebook';
		if (instagramPattern.test(input)) return 'instagram';
		if (linkedinPattern.test(input)) return 'linkedin';
		if (fullNamePattern.test(input)) return 'full_name';
		if (twitterPattern.test(input)) return 'twitter'
		return 'invalid';
	};

	const handleSearch = async () => {
		setResults([]);
		setSwal({});
		const inputType = getInputType(searchTerm);
		if (inputType === 'invalid') {
			setSwal({
				show: true,
				title: 'Invalid Input',
				text: 'Please double-check the phone number or social media pattern!',
				willClose: () => {
					setSearchTerm('');
				}
			})
			return;
		}
		setIsLoading(true);
		if (searchTerm) {
			let query = supabase.from('person_identifications').select('*').order('created_at', { ascending: false });

			switch (inputType) {
				case 'phone':
					query = query.ilike('phone_number', `%${searchTerm}%`);
					break;
				case 'facebook':
					query = query.ilike('facebook_url', `%${searchTerm}%`);
					break;
				case 'instagram':
					query = query.ilike('instagram_url', `%${searchTerm}%`);
					break;
				case 'linkedin':
					query = query.ilike('linkedin_url', `%${searchTerm}%`);
					break;
				case 'full_name':
					query = query.ilike('full_name', `%${searchTerm}%`);
					break;
				case 'twitter':
					query = query.ilike('twitter_url', `%${searchTerm}%`);
					break;
			}

			const response = await query.eq('is_approved', true).limit(15);
			if (!response) return;

			const { data, error } = response;

			if (error) {
				console.error("Error fetching data:", error);
			} else {
				setResults(data);
				if(data.length === 0) {
					setSwal({
						show: true,
						title: 'Information',
						text: 'No results found',
						icon: 'error',
						confirmButtonText: 'Close',
					})
				}
			}
		} else {
			setResults([]);
		}
		setIsLoading(false);
	};
	return (
		<main className="relative flex flex-col justify-center items-center">
			<section className="bg-black text-white w-full flex items-center justify-center">
				<div className="mx-auto max-w-screen-xl px-4 py-12">
					<div className="mx-auto max-w-2xl text-center">
						<div className="flex flex-col">
							<h1
								className="bg-gradient-to-r max-w-xl mx-auto leading-[34px] lg:leading-[54px] from-green-300 via-blue-500 to-purple-600 bg-clip-text text-3xl font-extrabold text-transparent sm:text-5xl"
							>
								Check Credibility Discover the Truth
							</h1>

							<p className="mx-auto mt-4 w-full sm:text-xl/relaxed">
								Easily find people, companies, brands, artists, or politicians! Enter a phone number or social media link to check credibility and reviews.
							</p>

							<div className="mt-8 flex flex-wrap justify-center gap-4">
								<div className="relative w-full">
									<PlaceholdersAndVanishInput
										placeholders={placeholders}
										onChange={(e) => setSearchTerm(e.target.value)}
										onSubmit={handleSearch}
									/>
								</div>
							</div>
						</div>

						{isLoading && <div className="mt-4 text-center">Loading...</div>}
						
						{results.length > 0 && (
							<div className="mt-20 mb-20 w-full relative z-10">
								<div className="text-left">Terdapat {results.length} hasil</div>
								<div className="mt-4 grid gap-4">
									{results.map((result) => (
										<div key={result.id} onClick={() => router.push(`/${result.id}`)} className="cursor-pointer">
											<CardPeople
												className="mt-4"
												name={result.full_name}
												phone={result.phone_number}
												facebook={result.facebook_url}
												twitter={result.twitter_url}
												instagram={result.instagram_url}
												linkedin={result.linkedin_url}
												public_office={result.type}
												path_image={result.path_image}
												isHome={true}
											/>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</section>
			<SweetAlert2 {...swal} />
		</main>
	);
}
