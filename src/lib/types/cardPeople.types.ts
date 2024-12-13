export interface CardPeopleProps {
    name?: string;
    phone?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    score?: number;
    className?: string;
    isHome?: boolean;
    isDetail?: boolean;
    path_image?: string;
    public_office?: string;
    setShowModal?: (show: boolean) => void;
}
