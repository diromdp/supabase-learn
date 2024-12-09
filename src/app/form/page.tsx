import { FC } from "react";
import FormSubmit from "@/components/layouts/formSubmit";


const FormPage: FC= () => {
    return (
        <>
            <div className="mx-auto max-w-screen-xl relative z-10 px-4 lg:h-screen lg:flex lg:items-center my-10 lg:my-0">
                <div className="mx-auto max-w-2xl">
                    <FormSubmit />
                </div>
            </div>
        </>
    );
}

export default FormPage;