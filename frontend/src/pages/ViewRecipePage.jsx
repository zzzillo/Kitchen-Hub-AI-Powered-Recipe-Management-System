import LogoTitle from "@/components/LogoTitle";
import ViewRecipe from "@/components/ViewRecipe";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function ViewRecipePage() {
  const { id } = useParams(); // /recipe/:id
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user"); 
  const token = localStorage.getItem("token"); 
  const [recipeData, setRecipeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (!storedUser || !token) {
      navigate("/");
      return;
    }

    const fetchRecipe = async () => {
      try {
        const res = await fetch(`http://localhost:3001/recipes/${id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`, // ✅ include JWT
          },
        });

        if (res.status === 401 || res.status === 403) {
          navigate("/");
          return;
        }

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to fetch recipe");
        }

        const data = await res.json();
        const normalizedData = {
          ...data,
          tags: Array.isArray(data.tags)
            ? data.tags
            : typeof data.tags === "string" && data.tags.trim() !== ""
              ? data.tags.split(",").map(t => t.trim())
              : [],
          ingredients: Array.isArray(data.ingredients)
            ? data.ingredients
            : [],
        };

      setRecipeData(normalizedData);
      } catch (e) {
        setErrMsg(e.message || "Unable to load recipe");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, navigate]);

  const editRecipe = () => {
    navigate(`/updaterecipe/${id}`, { state: { recipeData } });
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (errMsg) return <div className="p-6 text-red-600">Error: {errMsg}</div>;

  return (
    <div className="bg-semiwhite min-h-screen">
      <div className="w-full flex flex-row items-center justify-between gap-2 sm:gap-3 lg:gap-4">
        <div className="shrink-0">
          <LogoTitle hideTextOnSmall backHomepage />
        </div>
        <div className="h-full flex items-center mr-5 sm:mr-7 lg:mr-10">
          <button
            onClick={editRecipe}
            className="h-12 px-5 text-md lg:text-lg bg-green text-white font-light rounded-sm 
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

      <div className="p-4">
        <ViewRecipe data={recipeData} />
      </div>
    </div>
  );
}

export default ViewRecipePage;
