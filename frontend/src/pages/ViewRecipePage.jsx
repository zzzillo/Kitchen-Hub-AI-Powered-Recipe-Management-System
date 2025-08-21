import LogoTitle from "@/components/LogoTitle";
import ViewRecipe from "@/components/ViewRecipe";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

function ViewRecipePage() {
    // Example recipe data (you can fetch this from API, database, or route params)
    const { id } = useParams();
    const navigate = useNavigate();
        const recipeData = {
        image: "/sample-recipe.jpg",
        recipeName: "Pork Adobo",
        description: "A delicious Filipino dish made with soy sauce, vinegar, and pork.",
        time: "45 mins",
        category: "Main Dish",
        tags: ["Filipino", "Savory"],
        instructions: "1. Marinate pork...\n2. Simmer until tender...",
        notes: "Best served with rice!",
        ingredients: [
            { name: "Pork belly", quantity: "500", measurement: "g", notes: "" },
            { name: "Soy sauce", quantity: "1/2", measurement: "cup", notes: "" },
            { name: "Vinegar", quantity: "1/3", measurement: "cup", notes: "" },
            { name: "Garlic", quantity: "4", measurement: "cloves", notes: "crushed" },
            { name: "Bay leaves", quantity: "2", measurement: "", notes: "" }
        ]
        };

    const editRecipe = () => {
    navigate(`/updaterecipe/${id}`, { state: { recipeData } });
    };


    return (
        <div className="bg-semiwhite">
            {/* Header */}
            <div className="w-full flex flex-row items-center justify-between gap-2 sm:gap-3 lg:gap-4">
                <div className="shrink-0">
                    <LogoTitle hideTextOnSmall backHomepage />
                </div>
                <div className="h-full flex items-center mr-5 sm:mr-7 lg:mr-10">
                    <button onClick={editRecipe}
                        className="h-12 w-15 sm:w-30 lg:w-50 text-md lg:text-lg bg-green text-white font-light rounded-sm 
                                hover:bg-green-800 hover:scale-105 
                                active:bg-green-900 active:scale-95 
                                focus:outline-none focus:ring-2 focus:outline-0 
                                shadow-none transition-all duration-200"
                    >
                        <span className="sm:hidden">Edit</span>
                        <span className="hidden sm:inline">Edit Recipe</span>
                    </button>
                </div>
            </div>

            {/* ViewRecipe with data passed */}
            <div className="p-4">
                <ViewRecipe data={recipeData} />
            </div>
        </div>
    );
}

export default ViewRecipePage;
