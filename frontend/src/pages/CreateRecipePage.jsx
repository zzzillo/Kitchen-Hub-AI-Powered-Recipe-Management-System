import InputRecipe from "@/components/InputRecipe";
import Message from "@/components/Message";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateRecipepage() {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("user"); 
    const token = localStorage.getItem("token"); 
    const [message, setMessage] = useState(null); 
    const [redirectAfterClose, setRedirectAfterClose] = useState(false);

    useEffect (() => {
            if (!storedUser || !token) {
            navigate("/");
            return;
        }
    },[])

    const createRecipe = async (data) => {
        const formData = new FormData();

        // attach fields
        formData.append("recipeName", data.recipeName);
        formData.append("description", data.description);
        formData.append("time", data.time);
        formData.append("category", data.category);
        formData.append("instructions", data.instructions);
        formData.append("notes", data.notes);
        formData.append("userId", storedUser);

        // file upload
        if (data.image) {
            formData.append("image", data.image);
        }

        // stringify arrays/objects
        formData.append("tags", data.tags.join(", "));
        formData.append("ingredients", JSON.stringify(data.ingredients));
        const response = await fetch("http://localhost:3001/recipes/add", {
            method: "POST",
            headers: {
            "Authorization": `Bearer ${token}`,
            },
            body: formData,
        });

        const result = await response.json();

        if (result.success) {
            setMessage("Recipe has been added successfully!");
            setRedirectAfterClose(true);
        } else {
            setMessage("Failed to add recipe. Please try again.");
            setRedirectAfterClose(false);
        }

        return result;
        };


    const handleCloseMessage = () => {
        setMessage(null);
        if (redirectAfterClose) {
            navigate("/home");
        }
    };

    return (
        <div>
            <InputRecipe onSave={createRecipe} />

            {message && (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black/30">
                    <Message 
                        message={message} 
                        onClose={handleCloseMessage} 
                    />
                </div>
            )}
        </div>
    );
}

export default CreateRecipepage;
