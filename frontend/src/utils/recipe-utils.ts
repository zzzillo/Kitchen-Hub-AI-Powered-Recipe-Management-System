import type { NormalizedRecipe, Recipe } from "@/types/recipe";

export type RecipeSortOption = "time-added" | "alphabetical";

export const getRecipeImageSrc = (image: string | undefined, backendUrl: string): string => {
  if (!image) return "/placeholder.png";
  return /^https?:\/\//i.test(image) ? image : `${backendUrl}/uploads/${image}`;
};

const compareRecipeDates = (left: NormalizedRecipe, right: NormalizedRecipe): number =>
  new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();

export const normalizeRecipes = (recipes: Recipe[]): NormalizedRecipe[] =>
  recipes.map((recipe) => ({
    ...recipe,
    tags: Array.isArray(recipe.tags)
      ? recipe.tags
      : typeof recipe.tags === "string" && recipe.tags.trim() !== ""
        ? recipe.tags.split(",").map((tag) => tag.trim())
        : [],
    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
    isPinned: Boolean(recipe.isPinned),
  }));

export const sortRecipes = (
  recipes: NormalizedRecipe[],
  sortBy: RecipeSortOption,
): NormalizedRecipe[] =>
  [...recipes].sort((left, right) => {
    if (left.isPinned !== right.isPinned) {
      return left.isPinned ? -1 : 1;
    }

    if (sortBy === "alphabetical") {
      return (left.recipeName || "").localeCompare(right.recipeName || "");
    }

    return compareRecipeDates(left, right);
  });

export const matchesCategory = (
  recipe: NormalizedRecipe,
  selectedCategory: string,
): boolean => {
  if (selectedCategory === "all") {
    return true;
  }

  return (recipe.category || "").trim().toLowerCase() === selectedCategory;
};

export const getCategoryOptions = (recipes: NormalizedRecipe[]) =>
  Array.from(
    new Set(
      recipes
        .map((recipe) => (recipe.category || "").trim())
        .filter(Boolean)
        .map((category) => category.toLowerCase()),
    ),
  )
    .sort((left, right) => left.localeCompare(right))
    .map((category) => ({
      value: category,
      label: category.charAt(0).toUpperCase() + category.slice(1),
    }));
