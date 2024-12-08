import React from "react";

interface NoReviewProps {
    
}
 
const NoReview: React.FC<NoReviewProps> = () => {
    return ( 
        <div className="w-full">
            <div className="flex flex-col justify-center items-start mt-20 w-full">
                <img src="https://avatar.iran.liara.run/public/18" className="w-[68px] h-[68px] mx-auto object-cover"/>
                <div className="mt-[8px] text-center w-full">
                    <h3 className="font-semibold text-[24px]"> Tidak ada ulasan </h3>
                </div>
            </div>
        </div>
    );
}
 
export default NoReview;