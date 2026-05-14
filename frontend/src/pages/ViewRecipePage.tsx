import LogoTitle from "@/components/LogoTitle";
import ViewRecipe from "@/components/ViewRecipe";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCachedRecipeDetail, setCachedRecipeDetail } from "@/utils/recipe-cache";
import { normalizeRecipes } from "@/utils/recipe-utils";
import type { NormalizedRecipe, Recipe } from "@/types/recipe";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const ViewRecipePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user"); 
  const token = localStorage.getItem("token"); 
  const [recipeData, setRecipeData] = useState<NormalizedRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (!storedUser || !token) {
      navigate("/login");
      return;
    }

    if (!id) {
      setErrMsg("Recipe id is missing");
      setLoading(false);
      return;
    }

    const cachedRecipe = getCachedRecipeDetail<Recipe>(id);
    if (cachedRecipe) {
      setRecipeData(normalizeRecipes([cachedRecipe])[0]);
      setLoading(false);
      return;
    }

    const fetchRecipe = async () => {
      try {
        const res = await fetch(`${backendUrl}/recipes/${id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`, // ✅ include JWT
          },
        });

        if (res.status === 401 || res.status === 403) {
          navigate("/login");
          return;
        }

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({})) as { error?: string };
          throw new Error(errorData.error || "Failed to fetch recipe");
        }

        const data = await res.json() as Recipe;
        const normalizedData = normalizeRecipes([data])[0];

      setCachedRecipeDetail({ ...normalizedData, _id: normalizedData._id || id });
      setRecipeData(normalizedData);
      } catch (e) {
        setErrMsg(e instanceof Error ? e.message : "Unable to load recipe");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, navigate, storedUser, token]);

  const editRecipe = () => {
    navigate(`/recipes/${id}/edit`, { state: { recipeData } });
  };

  if (loading) return <div className="min-h-screen p-2.5"><div className="mx-auto w-full max-w-7xl rounded-[22px] border border-[#d7e1d8] bg-white p-6 shadow-[0_8px_24px_rgba(32,55,41,0.05)]">Loading...</div></div>;
  if (errMsg) return <div className="min-h-screen p-2.5"><div className="mx-auto w-full max-w-7xl rounded-[22px] border border-[#d7e1d8] bg-white p-6 text-red-600 shadow-[0_8px_24px_rgba(32,55,41,0.05)]">Error: {errMsg}</div></div>;

  return (
    <div className="min-h-screen p-2.5">
      <div className="mx-auto w-full max-w-7xl space-y-5 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500">
      <div className="flex flex-row items-center justify-between gap-2 rounded-[20px] border border-[#d7e1d8] bg-white px-2 py-1.5 shadow-[0_8px_24px_rgba(32,55,41,0.05)] motion-safe:animate-in motion-safe:slide-in-from-top-2 motion-safe:duration-500">
        <div className="shrink-0">
          <LogoTitle hideTextOnSmall backHomepage compact />
        </div>
        <div className="flex shrink-0 items-center">
          <button
            onClick={editRecipe}
            className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-[12px] border border-transparent bg-[#4f8e65] px-3 text-[0.82rem] font-semibold text-white shadow-[0_10px_20px_rgba(79,142,101,0.18)] transition hover:bg-[#457d5a] active:scale-[0.985] lg:h-9 lg:rounded-[14px] lg:px-5 lg:text-sm"
          >
            <span>Edit recipe</span>
          </button>
        </div>
      </div>

      <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500">
        <ViewRecipe data={recipeData} />
      </div>
      </div>
    </div>
  );
};

export default ViewRecipePage;
