import { useState, useEffect } from "react";
import InputRecipe from "@/components/InputRecipe";
import { useLocation, useNavigate } from "react-router-dom";
import Message from "@/components/Message";
import { clearRecipeListCache, setCachedRecipeDetail } from "@/utils/recipe-cache";
import type { Recipe, RecipeFormData } from "@/types/recipe";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface RecipeUpdateResponse {
    success?: boolean;
    error?: string;
}

const UpdateRecipePage = () => {
    const location = useLocation() as { state?: { recipeData?: Recipe } };
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("user"); 
    const token = localStorage.getItem("token"); 
    const recipeData = location.state?.recipeData || null;
    const [popupMessage, setPopupMessage] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect (() => {
            if (!storedUser || !token) {
            navigate("/login");
            return;
        }
    }, [navigate, storedUser, token])

const updateRecipe = async (data: RecipeFormData) => {
    if (isSaving) return;
    if (!recipeData?._id) {
        setPopupMessage("Unable to update this recipe.");
        return;
    }

    try {
        setIsSaving(true);
        const formData = new FormData();

        formData.append("recipeName", data.recipeName || "");
        formData.append("description", data.description || "");
        formData.append("time", data.time || "");
        formData.append("category", data.category || "");
        formData.append("instructions", data.instructions || "");
        formData.append("notes", data.notes || "");
        formData.append("imageUrl", data.imageUrl || "");
        formData.append("tags", (data.tags || []).join(", "));
        formData.append("ingredients", JSON.stringify(data.ingredients || []));

        if (data.image && !(data.image instanceof File)) {
            formData.append("image", data.image.preview || data.image.remoteUrl || "");
        }

        if (data.image instanceof File) {
            formData.append("image", data.image);
        }

        const res = await fetch(`${backendUrl}/recipes/${recipeData._id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        const result = await res.json() as RecipeUpdateResponse;

        if (result.success) {
            clearRecipeListCache(storedUser);
            setCachedRecipeDetail({
                ...recipeData,
                ...data,
                _id: recipeData._id,
            });
            setPopupMessage("Recipe updated successfully!");
            setTimeout(() => {
                navigate(`/recipes/${recipeData._id}`);
            }, 1500);
        } else {
            setPopupMessage("Update failed: " + result.error);
        }
    } catch (_err) {
        setPopupMessage("Something went wrong while updating.");
    } finally {
        setIsSaving(false);
    }
};


    return (
        <div className="relative">
            <InputRecipe initialData={recipeData} onSave={updateRecipe} allowAssistant={false} isSaving={isSaving}/>
            
            {popupMessage && (
                <Message 
                    message={popupMessage} 
                    onClose={() => setPopupMessage(null)} 
                />
            )}
        </div>
    );
};

export default UpdateRecipePage;
