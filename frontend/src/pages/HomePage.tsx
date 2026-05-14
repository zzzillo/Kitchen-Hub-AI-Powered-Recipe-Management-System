import AddRecipeButton from "@/components/AddRecipeButton";
import Message from "@/components/Message";
import LogoTitle from "@/components/LogoTitle";
import RecipeCard from "@/components/RecipeCard";
import SearchBar from "@/components/SearchBar";
import { useRecipeList } from "@/hooks/use-recipe-list";
import { getRecipeImageSrc } from "@/utils/recipe-utils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const apiUrl = import.meta.env.VITE_API_URL;

const HomePage = () => {
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);
  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    selectedCategory,
    setSelectedCategory,
    isUserMenuOpen,
    setIsUserMenuOpen,
    categoryOptions,
    visibleRecipes,
    createRecipe,
    searchRecipe,
    handleLogout,
    handleRecipeDeleted,
    handlePinToggled,
  } = useRecipeList({ backendUrl });

  useEffect(() => {
    const controller = new AbortController();

    void fetch(`${backendUrl}/health`, {
      signal: controller.signal,
    }).catch(() => {});

    void fetch(`${apiUrl}/health`, {
      signal: controller.signal,
    }).catch(() => {});

    return () => {
      controller.abort();
    };
  }, []);

  const handleLogoutClick = () => {
    setIsUserMenuOpen(false);
    setConfirmLogout(true);
  };

  const confirmLogoutAction = () => {
    setConfirmLogout(false);
    handleLogout();
    setLogoutMessage("Logged out successfully!");
  };

  const handleLogoutMessageClose = () => {
    setLogoutMessage(null);
    navigate("/login", { replace: true });
  };

  return (
    <div className='min-h-screen p-2.5'>
      <div className='mx-auto w-full max-w-7xl space-y-3 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500'>
        <div className='relative z-40 flex flex-row items-center gap-2 rounded-[20px] border border-[#d7e1d8] bg-white px-2 py-1.5 shadow-[0_8px_24px_rgba(32,55,41,0.05)] motion-safe:animate-in motion-safe:slide-in-from-top-2 motion-safe:duration-500'>
          <div className='shrink-0'>
            <LogoTitle hideTextOnSmall backHomepage compact />
          </div>
          <div className='min-w-0 flex-1 basis-0'>
            <SearchBar value={searchQuery} onChange={setSearchQuery} onSubmit={searchRecipe} />
          </div>
          <div className='ml-auto flex shrink-0 items-center gap-0.5 lg:gap-1.5'>
            <div className='w-auto'>
              <AddRecipeButton addRecipe={createRecipe} />
            </div>
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[9px] px-0 text-[0.7rem] text-[#284734] transition hover:bg-black/5 lg:h-7 lg:w-7 lg:text-xs"
              >
                ⋮
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-11 z-50 min-w-28 rounded-[22px] border border-[#d7e1d8] bg-white p-1.5 shadow-[0_8px_24px_rgba(32,55,41,0.05)]">
                  <button
                    onClick={handleLogoutClick}
                    className="w-full rounded-2xl px-3 py-2 text-left text-sm font-medium text-[#284734] transition hover:bg-[#f7faf7]"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='flex justify-end'>
          <div className='flex flex-wrap justify-end gap-2'>
            <label className='inline-flex max-w-full items-center gap-1.5 rounded-[12px] border border-[#d7e1d8] bg-white px-2.5 py-2 text-[0.78rem] text-[#284734] shadow-[0_8px_24px_rgba(32,55,41,0.05)] sm:gap-2 sm:rounded-[14px] sm:px-3 sm:text-sm'>
              <span className='shrink-0 font-medium'>Category:</span>
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className='max-w-[7.5rem] bg-transparent text-[0.78rem] font-medium text-[#284734] outline-none sm:max-w-[10rem] sm:text-sm'
              >
                <option value="all">All</option>
                {categoryOptions.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
            <label className='inline-flex max-w-full items-center gap-1.5 rounded-[12px] border border-[#d7e1d8] bg-white px-2.5 py-2 text-[0.78rem] text-[#284734] shadow-[0_8px_24px_rgba(32,55,41,0.05)] sm:gap-2 sm:rounded-[14px] sm:px-3 sm:text-sm'>
              <span className='shrink-0 font-medium'>Sort:</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
                className='max-w-[7rem] bg-transparent text-[0.78rem] font-medium text-[#284734] outline-none sm:max-w-[9rem] sm:text-sm'
              >
                <option value="time-added">Time added</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </label>
          </div>
        </div>

        <section className='grid grid-cols-1 gap-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 md:grid-cols-2 xl:grid-cols-3'>
          {visibleRecipes.map((recipe, index) => (
            <RecipeCard
              index={index}
              id={String(recipe._id)}
              key={recipe._id}
              src={getRecipeImageSrc(recipe.image, backendUrl)}
              title={recipe.recipeName || "Untitled Recipe"}
              desc={recipe.description || "No description available"}
              time={recipe.time || "N/A"}
              category={recipe.category || "Uncategorized"}
              tags={recipe.tags || []}
              isPinned={recipe.isPinned}
              onDeleted={handleRecipeDeleted}
              onPinToggled={handlePinToggled}
            />
          ))}
        </section>
      </div>

      {confirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(17,29,19,0.22)] px-4 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
          <div className="relative w-[min(22rem,92vw)] overflow-hidden rounded-[24px] border border-white/35 bg-[linear-gradient(160deg,rgba(255,255,255,0.3),rgba(236,243,233,0.18))] p-5 text-center shadow-[0_20px_52px_rgba(23,37,22,0.2),inset_0_1px_0_rgba(255,255,255,0.34)] backdrop-blur-[18px] motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-300">
            <p className="mb-4 text-sm leading-7 sm:text-base">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmLogoutAction}
                className="inline-flex min-w-24 items-center justify-center rounded-[0.95rem] border border-transparent bg-[#4f8e65] px-[1.15rem] py-[0.72rem] text-sm font-semibold text-white shadow-[0_10px_20px_rgba(79,142,101,0.18)] transition duration-200 hover:-translate-y-px hover:bg-[#457d5a] active:scale-[0.985]"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmLogout(false)}
                className="inline-flex min-w-24 items-center justify-center rounded-[0.95rem] border border-[#d7e1d8] bg-white px-[1.15rem] py-[0.72rem] text-sm font-semibold text-[#284734] transition duration-200 hover:-translate-y-px hover:bg-[#f7faf7] active:scale-[0.985]"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {logoutMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(17,29,19,0.22)] px-4 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
          <Message message={logoutMessage} onClose={handleLogoutMessageClose} />
        </div>
      )}
    </div>
  );
};

export default HomePage;
