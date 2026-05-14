import { Link } from "react-router-dom";
import { useState } from "react";
import TimeIcon from "../assets/timed_icon.svg";
import Message from "@/components/Message";
import { clearRecipeListCache, removeCachedRecipeDetail, setCachedRecipeDetail } from "@/utils/recipe-cache";
import type { Recipe } from "@/types/recipe";

interface RecipeCardProps {
  index?: number;
  id: string;
  src: string;
  title: string;
  desc: string;
  time: string;
  category: string;
  tags?: string[];
  isPinned?: boolean;
  onDeleted?: (deletedId: string) => void;
  onPinToggled?: (updatedRecipe: Recipe) => void;
}

interface RecipeMutationResponse {
  success?: boolean;
  error?: string;
  recipe?: Recipe;
}

const RecipeCard = ({
  id,
  src,
  title,
  desc,
  time,
  category,
  tags = [],
  isPinned = false,
  onDeleted,
  onPinToggled,
}: RecipeCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPinning, setIsPinning] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleDelete = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      setConfirmDelete(false);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");

      const response = await fetch(`${backendUrl}/recipes/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as RecipeMutationResponse;
        throw new Error(errorData.error || "Failed to delete recipe");
      }

      const data = await response.json() as RecipeMutationResponse;

      if (data.success) {
        const storedUser = localStorage.getItem("user");
        clearRecipeListCache(storedUser);
        removeCachedRecipeDetail(id);
        setMessage("Recipe deleted successfully!");
        if (onDeleted) onDeleted(id);
      } else {
        setMessage(data.error || "Failed to delete recipe");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error deleting recipe");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePin = async () => {
    if (isPinning) return;
    try {
      setIsPinning(true);
      setMenuOpen(false);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");

      const response = await fetch(`${backendUrl}/recipes/${id}/pin`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ isPinned: !isPinned }),
      });

      const data = await response.json().catch(() => ({})) as RecipeMutationResponse;
      if (!response.ok || !data.success || !data.recipe) {
        throw new Error(data.error || "Failed to update recipe pin");
      }

      const storedUser = localStorage.getItem("user");
      clearRecipeListCache(storedUser);
      setCachedRecipeDetail(data.recipe);
      onPinToggled?.(data.recipe);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error updating recipe pin");
    } finally {
      setIsPinning(false);
    }
  };

  return (
    <div className="group relative h-full w-full overflow-hidden rounded-[22px] border border-[#d7e1d8] bg-white shadow-[0_8px_24px_rgba(32,55,41,0.05)] transition duration-[220ms] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500 hover:-translate-y-[2px] hover:shadow-[0_16px_40px_rgba(41,72,54,0.1)]">
      {isPinned && (
        <div className="absolute left-3 top-3 z-20 inline-flex items-center rounded-full bg-[#254634] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white">
          Pinned
        </div>
      )}
      <div className="absolute right-3 top-3 z-20">
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-[16px] border border-[#d7e1d8] bg-white px-0 text-[#284734] transition duration-200 hover:-translate-y-px hover:bg-[#f7faf7] active:scale-[0.985]"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ⋮
        </button>
        {menuOpen && (
          <div className="absolute right-0 z-10 mt-2 w-36 rounded-[22px] border border-[#d7e1d8] bg-white p-2 shadow-[0_8px_24px_rgba(32,55,41,0.05)] motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-200">
            <button
              onClick={handleTogglePin}
              disabled={isPinning}
              className="w-full rounded-2xl px-3 py-2 text-left text-sm font-medium text-[#284734] transition hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPinning ? "Saving..." : isPinned ? "Unpin recipe" : "Pin recipe"}
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full rounded-2xl px-3 py-2 text-left text-sm font-medium text-[#b84f5b] transition hover:bg-black/[0.03]"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <Link to={`/recipes/${id}`} className="block h-full">
        <div className="h-56 overflow-hidden rounded-t-[30px] bg-white/28 sm:h-60">
          <img
            src={src}
            alt={title}
            className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]"
          />
        </div>

        <div className="flex flex-col gap-3 px-4 py-4 sm:px-5">
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <h1 className="flex-1 font-['Fraunces'] text-3xl font-semibold leading-none tracking-[-0.04em] text-[#284734]">
              {title}
            </h1>
            <div className="flex max-w-full items-start gap-1 self-start rounded-full border border-[#d7e1d8] bg-[#eff4ef] px-[0.72rem] py-[0.28rem] text-[#284734] sm:max-w-[12rem]">
              <img src={TimeIcon} alt="Time Icon" className="h-5 w-5 rounded-full" />
              <p className="text-sm leading-5 whitespace-normal break-words">{time}</p>
            </div>
          </div>

          <p className="line-clamp-3 text-sm leading-6 text-[#617466]">
            {desc}
          </p>

          <div className="mt-auto flex flex-wrap gap-2 pb-1">
            <div className="inline-flex items-center rounded-full bg-[#254634] px-[0.72rem] py-[0.28rem] text-xs font-semibold text-white">
              <p className="truncate">{category}</p>
            </div>
            {tags.map((tag, index) => (
              <div key={index} className="inline-flex items-center rounded-full border border-[#d7e1d8] bg-[#eff4ef] px-[0.72rem] py-[0.28rem] text-xs font-medium text-[#284734]">
                <p className="truncate">{tag}</p>
              </div>
            ))}
          </div>
        </div>
      </Link>

      {confirmDelete && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-[rgba(17,29,19,0.22)] px-4 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
          <div className="relative w-[min(22rem,92vw)] overflow-hidden rounded-[24px] border border-white/35 bg-[linear-gradient(160deg,rgba(255,255,255,0.3),rgba(236,243,233,0.18))] p-5 text-center shadow-[0_20px_52px_rgba(23,37,22,0.2),inset_0_1px_0_rgba(255,255,255,0.34)] backdrop-blur-[18px] motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-300">
            <p className="mb-4 text-sm leading-7 sm:text-base">
              Are you sure you want to delete this recipe?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex min-w-24 items-center justify-center rounded-[0.95rem] border border-transparent bg-[linear-gradient(135deg,#c75a66_0%,#a33a47_100%)] px-[1.15rem] py-[0.72rem] text-sm font-semibold text-white shadow-[0_10px_20px_rgba(79,142,101,0.18)] transition duration-200 hover:-translate-y-px active:scale-[0.985]"
              >
                {isDeleting ? "Deleting..." : "Yes"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="inline-flex min-w-24 items-center justify-center rounded-[0.95rem] border border-[#d7e1d8] bg-white px-[1.15rem] py-[0.72rem] text-sm font-semibold text-[#284734] transition duration-200 hover:-translate-y-px hover:bg-[#f7faf7] active:scale-[0.985]"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[rgba(17,29,19,0.22)] px-4 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
          <Message message={message} onClose={() => setMessage(null)} />
        </div>
      )}
    </div>
  );
};

export default RecipeCard;
