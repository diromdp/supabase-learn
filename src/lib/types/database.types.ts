export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            admins: {
                Row: {
                    id: string
                    email: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    email: string
                    password: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    password?: string
                    created_at?: string
                }
            }
            person_identifications: {
                Row: {
                    id: number
                    full_name: string
                    phone_number: string
                    facebook_url: string | null
                    instagram_url: string | null
                    twitter_url: string | null
                    linkedin_url: string | null
                    is_approved: boolean
                    approved_by: string | null
                    approved_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: number
                    full_name: string
                    phone_number: string
                    facebook_url?: string | null
                    instagram_url?: string | null
                    twitter_url?: string | null
                    linkedin_url?: string | null
                    is_approved?: boolean
                    approved_by?: string | null
                    approved_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    full_name?: string
                    phone_number?: string
                    facebook_url?: string | null
                    instagram_url?: string | null
                    twitter_url?: string | null
                    linkedin_url?: string | null
                    is_approved?: boolean
                    approved_by?: string | null
                    approved_at?: string | null
                    updated_at?: string
                }
            }
            reviews: {
                Row: {
                    id: number
                    person_id: number
                    reviewer_name: string
                    facebook_url: string | null
                    instagram_url: string | null
                    twitter_url: string | null
                    linkedin_url: string | null
                    comment: string
                    rating: string
                    created_at: string
                }
                Insert: {
                    id?: number
                    person_id: number
                    reviewer_name: string
                    facebook_url?: string | null
                    instagram_url?: string | null
                    twitter_url?: string | null
                    linkedin_url?: string | null
                    comment?: string
                    rating?: string
                    created_at?: string
                }
                Update: {
                    person_id?: number
                    reviewer_name?: string
                    facebook_url?: string | null
                    instagram_url?: string | null
                    twitter_url?: string | null
                    linkedin_url?: string | null
                    comment?: string
                    rating?: string
                    created_at?: string
                }
            }
        }
    }
}