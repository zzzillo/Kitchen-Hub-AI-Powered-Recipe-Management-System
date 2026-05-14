const LIST_CACHE_KEY = "recipe-list-cache-v1";
const DETAIL_CACHE_KEY = "recipe-detail-cache-v1";

type RecipeCacheValue = unknown;
type RecipeCacheStore = Record<string, RecipeCacheValue>;

const readCache = (key: string): RecipeCacheStore => {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeCache = (key: string, value: RecipeCacheStore) => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(key, JSON.stringify(value));
};

const getListKey = (username: string | null | undefined, query: string) => {
  return `${username || "guest"}::${String(query || "").trim().toLowerCase()}`;
};

export const getCachedRecipeList = <TRecipe = unknown>(
  username: string | null | undefined,
  query = "",
): TRecipe[] | null => {
  const cache = readCache(LIST_CACHE_KEY);
  return (cache[getListKey(username, query)] as TRecipe[] | undefined) || null;
};

export const setCachedRecipeList = <TRecipe,>(
  username: string | null | undefined,
  query = "",
  recipes: TRecipe[],
) => {
  const cache = readCache(LIST_CACHE_KEY);
  cache[getListKey(username, query)] = recipes;
  writeCache(LIST_CACHE_KEY, cache);
};

export const clearRecipeListCache = (username: string | null | undefined) => {
  const cache = readCache(LIST_CACHE_KEY);
  const nextCache: RecipeCacheStore = {};
  const prefix = `${username || "guest"}::`;

  Object.entries(cache).forEach(([key, value]) => {
    if (!key.startsWith(prefix)) {
      nextCache[key] = value;
    }
  });

  writeCache(LIST_CACHE_KEY, nextCache);
};

export const getCachedRecipeDetail = <TRecipe = unknown>(recipeId: string): TRecipe | null => {
  const cache = readCache(DETAIL_CACHE_KEY);
  return (cache[String(recipeId)] as TRecipe | undefined) || null;
};

export const setCachedRecipeDetail = <TRecipe extends { _id?: string }>(recipe: TRecipe) => {
  if (!recipe?._id) return;

  const cache = readCache(DETAIL_CACHE_KEY);
  cache[String(recipe._id)] = recipe;
  writeCache(DETAIL_CACHE_KEY, cache);
};

export const removeCachedRecipeDetail = (recipeId: string) => {
  const cache = readCache(DETAIL_CACHE_KEY);
  delete cache[String(recipeId)];
  writeCache(DETAIL_CACHE_KEY, cache);
};
