"use client";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from '@/lib/supabase/client';
import SweetAlert2 from 'react-sweetalert2';
import { ScrollArea } from "@/components/ui/scroll-area";

import CardPeople from "@/components/layouts/cardPeople";

interface PersonIdentity {
	id: string;
	full_name: string;
	phone_number: string;
	facebook_url?: string;
	linkedin_url?: string;
	instagram_url?: string;
	twitter_url?: string;
	public_official_goverment?: boolean;
	path_image?: string;
}

export default function Home() {
	const [searchTerm, setSearchTerm] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [swal, setSwal] = useState<any>({});
	const [results, setResults] = useState<PersonIdentity[]>([]);
	const router = useRouter();
	const supabase = createClient();
	const placeholders = [
		"Cari orang lebih mudah",
		"Masukkan nama lengkap",
		"Masukkan nomor telepon atau nomor whatsapp",
		"Masukan tautan media sosial",
		"Contoh: https://www.facebook.com/username",
		"Contoh: https://www.instagram.com/username",
		"Contoh: https://www.x.com/username",
		"Contoh: https://www.linkedin.com/id/username",
	];


	const getInputType = (input: string): string => {
		const phonePattern = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
		const facebookPattern = /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9._-]+$/;
		const instagramPattern = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._-]+$/;
		const linkedinPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9._-]+$/;
		const fullNamePattern = /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/; // New pattern for full names

		if (phonePattern.test(input)) return 'phone';
		if (facebookPattern.test(input)) return 'facebook';
		if (instagramPattern.test(input)) return 'instagram';
		if (linkedinPattern.test(input)) return 'linkedin';
		if (fullNamePattern.test(input)) return 'full_name';
		return 'invalid';
	};

	const handleSearch = async () => {
		setResults([]);
		console.log()
		const inputType = getInputType(searchTerm);
		if (inputType === 'invalid') {
			setSwal({
				show: true,
				title: 'Invalid Input',
				text: 'Periksa kembali nomor telepon atau pola media sosial!',
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
			}

			const response = await query.eq('is_approved', true).limit(15);
			if (!response) return;

			const { data, error } = response;
			
			if (error) {
				console.error("Error fetching data:", error);
			} else {
				setResults(data);
			}
		} else {
			setResults([]);
		}
		setIsLoading(false);
	};
	return (
		<main className="relative overflow-hidden">
			<section className="bg-black text-white">
				<div className="mx-auto max-w-screen-xl px-4 lg:flex min-h-screen mt-[200px] relative z-20">
					<div className="mx-auto max-w-3xl text-center ">
						<h1
							className="bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text text-3xl font-extrabold text-transparent sm:text-5xl"
						>
							Cek Kredibilitas, Temukan Kebenaran
						</h1>

						<p className="mx-auto mt-4 max-w-2xl sm:text-xl/relaxed">
							Cari orang lebih mudah! Masukkan nomor telepon atau tautan media sosial untuk cek kredibilitas dan ulasan terpercaya
						</p>

						<div className="mt-8 flex flex-wrap justify-center gap-4">
							<div className="relative w-full lg:mx-[120px]">
								<PlaceholdersAndVanishInput
									placeholders={placeholders}
									onChange={(e) => setSearchTerm(e.target.value)}
									onSubmit={handleSearch}
								/>
							</div>
						</div>
						{isLoading && <div className="mt-4 text-center">Loading...</div>}
						{results.length > 0 && (
							<ScrollArea className={`${results.length > 1 ? "min-h-96" : ""} mt-20 mb-20`}>
								<div className="text-left">Terdapat {results.length} hasil</div>
								<div className="mt-4">
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
												public_office={result.public_official_goverment}
												path_image={result.path_image}
												isHome={true}
											/>
										</div>
									))}
								</div>
							</ScrollArea>
						)}
					</div>
				</div>
			</section>
			<SweetAlert2 {...swal} />
		</main>
	);
}
