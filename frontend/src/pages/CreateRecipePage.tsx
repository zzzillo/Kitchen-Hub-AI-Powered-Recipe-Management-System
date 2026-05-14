import InputRecipe from "@/components/InputRecipe";
import Message from "@/components/Message";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearRecipeListCache } from "@/utils/recipe-cache";
import type { RecipeFormData } from "@/types/recipe";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface RecipeSaveResponse {
    success?: boolean;
    error?: string;
    message?: string;
}

const CreateRecipePage = () => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("user"); 
    const token = localStorage.getItem("token"); 
    const [message, setMessage] = useState<string | null>(null);
    const [redirectAfterClose, setRedirectAfterClose] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect (() => {
            if (!storedUser || !token) {
            navigate("/login");
            return;
        }
    }, [navigate, storedUser, token])

    const createRecipe = async (data: RecipeFormData) => {
        if (isSaving) return;
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
            if (data.image instanceof File) {
                formData.append("image", data.image);
            }

            formData.append("tags", (data.tags || []).join(", "));
            formData.append("ingredients", JSON.stringify(data.ingredients || []));

            const response = await fetch(`${backendUrl}/recipes`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            const result = await response.json().catch(() => ({})) as RecipeSaveResponse;

            if (!response.ok || !result.success) {
                throw new Error(result.error || result.message || "Failed to add recipe.");
            }

            clearRecipeListCache(storedUser);
            setMessage("Recipe has been added successfully!");
            setRedirectAfterClose(true);
            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to add recipe. Please try again.";
            setMessage(errorMessage);
            setRedirectAfterClose(false);
            return { success: false, error: errorMessage };
        } finally {
            setIsSaving(false);
        }
    };


    const handleCloseMessage = () => {
        setMessage(null);
        if (redirectAfterClose) {
            navigate("/recipes");
        }
    };

    return (
        <div>
            <InputRecipe
                onSave={createRecipe}
                isSaving={isSaving}
                onAIGenerated={() => {
                    setMessage("Recipe generated. Review it, then click Save to add it.");
                    setRedirectAfterClose(false);
                }}
            />

            {message && (
                <div className="fixed inset-0 z-30 flex items-center justify-center bg-[rgba(17,29,19,0.22)] px-4 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
                    <Message 
                        message={message} 
                        onClose={handleCloseMessage} 
                    />
                </div>
            )}
        </div>
    );
};

export default CreateRecipePage;
