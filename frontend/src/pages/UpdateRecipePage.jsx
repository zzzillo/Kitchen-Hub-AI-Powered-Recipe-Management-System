import { useState } from "react";
import InputRecipe from "@/components/InputRecipe";
import { useLocation, useNavigate } from "react-router-dom";
import Message from "@/components/Message";

function UpdateRecipePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const recipeData = location.state?.recipeData || null;

    const [popupMessage, setPopupMessage] = useState(null);

const updateRecipe = async (data) => {
    try {
        const formData = new FormData();

        // Append all recipe fields (except image first)
        for (const key in data) {
            if (key !== "image") {
                formData.append(key, data[key]);
            }
        }

        // If user selected an image, append it
        if (data.image instanceof File) {
            formData.append("image", data.image);
        }

        const res = await fetch(`http://localhost:3001/recipes/edit/${recipeData._id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: formData
        });

        const result = await res.json();

        if (result.success) {
            setPopupMessage("Recipe updated successfully!");
            setTimeout(() => {
                navigate(`/recipe/${recipeData._id}`);
            }, 1500);
        } else {
            setPopupMessage("Update failed: " + result.error);
        }
    } catch (err) {
        console.error("Error updating recipe:", err);
        setPopupMessage("Something went wrong while updating.");
    }
};


    return (
        <div className="relative">
            <InputRecipe initialData={recipeData} onSave={updateRecipe} />
            
            {popupMessage && (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black/30">
                    <Message 
                        message={popupMessage} 
                        onClose={() => setPopupMessage(null)} 
                    />
                </div>
            )}
        </div>
    );
}

export default UpdateRecipePage;
