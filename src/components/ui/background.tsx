import { FC } from "react";
import { BackgroundBeams } from "./background-beams";
interface BackgroundProps {

}

const Background: FC<BackgroundProps> = () => {
    return (
        <div className="h-full absolute top-0 left-0 w-full flex flex-col items-center justify-center">
            <BackgroundBeams />
        </div>
    );
}

export default Background;