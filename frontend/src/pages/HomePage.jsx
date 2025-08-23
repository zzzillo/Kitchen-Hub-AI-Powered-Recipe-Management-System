import LogoTitle from '../components/LogoTitle';
import SearchBar from '../components/SearchBar';
import AddRecipeButton from '../components/AddRecipeButton';
import RecipeCard from '../components/RecipeCard';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [recipes, setRecipes] = useState([]);
    const [user, setUser] = useState(null);

    // Fetch current user from localStorage (set at login)
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!storedUser || !token) {
            navigate("/"); // redirect to login if not logged in
            return;
        }
        setUser(storedUser);
        fetchRecipes(storedUser, token);
    }, [navigate]);

const handleRecipeDeleted = async (deletedId) => {
    // Optimistically remove recipe from state
    setRecipes((prev) => prev.filter((recipe) => recipe._id !== deletedId));

    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3001/recipes/delete/${deletedId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!data.success) {
            console.error("Failed to delete recipe on server");
            // Optionally, re-add the recipe to state if delete failed
            // await fetchRecipes(user._id, token);
        }
    } catch (err) {
        console.error("Error deleting recipe:", err);
        // Optionally, re-add the recipe to state if error
        // await fetchRecipes(user._id, token);
    }
};


    // Fetch all recipes for the user
const fetchRecipes = async (userId, token) => {
  try {
    const response = await fetch(`http://localhost:3001/recipes/user/${userId}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error("Failed to fetch recipes");
    const data = await response.json();

    // normalize tags and ingredients
    const normalizedData = data.map(recipe => ({
      ...recipe,
      tags: Array.isArray(recipe.tags)
        ? recipe.tags
        : typeof recipe.tags === "string" && recipe.tags.trim() !== ""
          ? recipe.tags.split(",").map(t => t.trim())
          : [],
      ingredients: Array.isArray(recipe.ingredients)
        ? recipe.ingredients
        : [],
    }));

    setRecipes(normalizedData);
  } catch (err) {
    console.error(err);
  }
};


    // Navigate to create recipe page
    const createRecipe = () => {
        navigate('/createrecipe');
    };

    // Search handler
// Search handler
const searchRecipe = async (searchData) => {
  const searchValue = searchData.search;
  setSearch(searchValue);

  const token = localStorage.getItem("token");
  if (!user || !token) return;

  try {
    const response = await fetch(
      `http://localhost:3001/recipes/search?userId=${user}&query=${encodeURIComponent(searchValue)}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("Failed to search recipes");

    const data = await response.json();

    // Normalize tags and ingredients
    const normalizedData = data.map(recipe => ({
      ...recipe,
      tags: Array.isArray(recipe.tags)
        ? recipe.tags
        : typeof recipe.tags === "string" && recipe.tags.trim() !== ""
          ? recipe.tags.split(",").map(t => t.trim())
          : [],
      ingredients: Array.isArray(recipe.ingredients)
        ? recipe.ingredients
        : [],
    }));

    setRecipes(normalizedData);
  } catch (err) {
    console.error(err);
  }
};


    return (
        <div className='overflow-auto min-h-screen bg-semiwhite'>
            <div className='flex flex-row gap-2 sm:gap-3 lg:gap-4'>
                <div className='shrink-0'>
                    <LogoTitle hideTextOnSmall backHomepage />
                </div>
                <div className='flex-1 flex items-center justify-center shrink-1'>
                    <SearchBar onSubmit={searchRecipe} />
                </div>
                <div className='flex items-center justify-center mr-5 sm:mr-7 lg:mr-10 shrink-0'>
                    <AddRecipeButton addRecipe={createRecipe} />
                </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full p-5 sm:p-7 lg:p-10'>
                {recipes
                .filter(recipe =>
                    recipe.recipeName &&
                    recipe.recipeName.toLowerCase().includes(search.toLowerCase())
                )
                .map((recipe, index) => (
                    <RecipeCard
                    index={index}
                    id={String(recipe._id)}
                    key={recipe._id}
                    src={recipe.image ? `http://localhost:3001/uploads/${recipe.image}` : "/placeholder.png"}
                    title={recipe.recipeName || "Untitled Recipe"}
                    desc={recipe.description || "No description available"}
                    time={recipe.time || "N/A"}
                    category={recipe.category || "Uncategorized"}
                    tags={recipe.tags || []}
                    onDeleted={handleRecipeDeleted}
                    />

                ))}
            </div>
        </div>
    );
}

export default HomePage;
