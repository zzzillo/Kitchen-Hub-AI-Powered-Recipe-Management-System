import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCachedRecipeList, setCachedRecipeList } from "@/utils/recipe-cache";
import {
  getCategoryOptions,
  matchesCategory,
  normalizeRecipes,
  sortRecipes,
  type RecipeSortOption,
} from "@/utils/recipe-utils";
import type { NormalizedRecipe, Recipe } from "@/types/recipe";

interface UseRecipeListOptions {
  backendUrl: string;
}

export const useRecipeList = ({ backendUrl }: UseRecipeListOptions) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState<NormalizedRecipe[]>([]);
  const [sortBy, setSortBy] = useState<RecipeSortOption>("time-added");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [username, setUsername] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const lastQueriedSearchRef = useRef<string | null>(null);
  const sortByRef = useRef<RecipeSortOption>(sortBy);

  useEffect(() => {
    sortByRef.current = sortBy;
  }, [sortBy]);

  const fetchRecipes = useCallback(async (token: string, currentUsername: string, query = "") => {
    const normalizedSearchQuery = query.trim();
    const cachedRecipes = getCachedRecipeList<Recipe>(currentUsername, normalizedSearchQuery);

    if (cachedRecipes) {
      setRecipes(sortRecipes(normalizeRecipes(cachedRecipes), sortByRef.current));
      lastQueriedSearchRef.current = normalizedSearchQuery;
      return;
    }

    const route = normalizedSearchQuery
      ? `${backendUrl}/recipes?query=${encodeURIComponent(normalizedSearchQuery)}`
      : `${backendUrl}/recipes`;
    const response = await fetch(route, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch recipes");

    const recipeData = (await response.json()) as Recipe[];
    setCachedRecipeList(currentUsername, normalizedSearchQuery, recipeData);
    setRecipes(sortRecipes(normalizeRecipes(recipeData), sortByRef.current));
    lastQueriedSearchRef.current = normalizedSearchQuery;
  }, [backendUrl]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/login");
      return;
    }

    setUsername(storedUser);
    lastQueriedSearchRef.current = "";
    fetchRecipes(token, storedUser, "").catch(() => undefined);
  }, [fetchRecipes, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!username || !token) return;

    const normalizedSearchQuery = searchQuery.trim();
    if (lastQueriedSearchRef.current === normalizedSearchQuery) return;

    const timeoutId = window.setTimeout(() => {
      fetchRecipes(token, username, normalizedSearchQuery).catch(() => undefined);
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [fetchRecipes, searchQuery, username]);

  useEffect(() => {
    setRecipes((previousRecipes) => sortRecipes(previousRecipes, sortBy));
  }, [sortBy]);

  const handleRecipeDeleted = (deletedId: string) => {
    setRecipes((previousRecipes) =>
      previousRecipes.filter((recipe) => recipe._id !== deletedId),
    );
  };

  const handlePinToggled = (updatedRecipe: Recipe) => {
    setRecipes((previousRecipes) => {
      const nextRecipes = previousRecipes.map((recipe) =>
        recipe._id === updatedRecipe._id ? normalizeRecipes([updatedRecipe])[0] : recipe,
      );

      return sortRecipes(nextRecipes, sortBy);
    });
  };

  const createRecipe = () => {
    navigate("/recipes/new");
  };

  const searchRecipe = ({ search }: { search: string }) => {
    setSearchQuery(search);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return {
    searchQuery,
    setSearchQuery,
    recipes,
    sortBy,
    setSortBy,
    selectedCategory,
    setSelectedCategory,
    isUserMenuOpen,
    setIsUserMenuOpen,
    categoryOptions: getCategoryOptions(recipes),
    visibleRecipes: recipes.filter((recipe) => matchesCategory(recipe, selectedCategory)),
    createRecipe,
    searchRecipe,
    handleLogout,
    handleRecipeDeleted,
    handlePinToggled,
  };
};
