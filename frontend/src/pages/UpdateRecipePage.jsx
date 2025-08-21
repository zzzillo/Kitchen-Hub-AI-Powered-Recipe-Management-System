import InputRecipe from "@/components/InputRecipe";
import { useLocation } from "react-router-dom";

function UpdateRecipePage () {
    const location = useLocation();
    const recipeData = location.state?.recipeData || null;

    const updateRecipe = (data) => {
        // call edit API here
        console.log("Updated Recipe Data:", data);
    };

    return (
        <div>
            <InputRecipe initialData={recipeData} onSave={updateRecipe}/>
        </div>
    )
    
}

export default UpdateRecipePage;