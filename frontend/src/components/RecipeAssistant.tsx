import { useState } from "react";
import Message from "@/components/Message";
import type { GeneratedRecipeData, Ingredient } from "@/types/recipe";

const apiUrl = import.meta.env.VITE_API_URL;

interface RecipeAssistantProps {
  onClose: () => void;
  onSubmit?: (generatedRecipe: GeneratedRecipeData) => void;
}

interface AssistantRecipeResponse {
  json: {
    recipeName?: string;
    description?: string;
    imageUrl?: string;
    time?: string;
    category?: string;
    tags?: string[];
    instructions?: string[];
    notes?: string;
    ingredients?: Ingredient[];
  };
}

const RecipeAssistant = ({ onClose, onSubmit }: RecipeAssistantProps) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${apiUrl}/extract_recipe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: prompt }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = (await response.json()) as AssistantRecipeResponse;
      const data = result.json;

      const aiRecipeData = {
        recipeName: data.recipeName || "Untitled Recipe",
        description: data.description || "",
        imageUrl: data.imageUrl || "",
        time: data.time || "",
        category: data.category || "Uncategorized",
        tags: data.tags || [],
        instructions: (data.instructions || [])
          .map((step, index) => `${index + 1}. ${step}`)
          .join("\n"),
        notes: data.notes || "",
        ingredients: (data.ingredients || []).map((ingredient) => ({
          name: ingredient.name || "",
          quantity: ingredient.quantity || "",
          preperation: ingredient.preperation || ""
        })),
      };

      onSubmit?.(aiRecipeData);
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong while generating the recipe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
      <div className="relative w-full max-w-2xl rounded-[22px] border border-[#d7e1d8] bg-white p-5 shadow-[0_18px_48px_rgba(32,55,41,0.08)] motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 sm:p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d7e1d8] bg-white px-0 text-slate-600 transition duration-200 hover:-translate-y-px hover:bg-[#f7faf7] active:scale-[0.985]"
        >
          ✕
        </button>

        <h2 className="mb-2 text-center font-['Fraunces'] text-4xl font-semibold tracking-[-0.05em] text-[#284734] sm:text-5xl">
          AI Recipe Assistant
        </h2>
        <p className="mx-auto mb-4 max-w-[42rem] text-center text-sm leading-7 text-[#617466] sm:text-base">
          Describe what kind of recipe you want and it will help you generate one!
        </p>

        <textarea
          placeholder="E.g., I want a vegan pasta with mushrooms..."
          className="h-36 w-full rounded-[0.95rem] border border-[#d7e1d8] bg-white px-4 py-3 text-sm text-slate-800 outline-none transition duration-150 placeholder:text-slate-500 focus:border-[rgba(79,142,101,0.52)] focus:shadow-[0_0_0_4px_rgba(79,142,101,0.12)] sm:text-base"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <div className="flex justify-end mt-4">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`inline-flex items-center justify-center rounded-[0.95rem] border border-transparent bg-[#4f8e65] px-[1.15rem] py-[0.72rem] text-sm font-semibold text-white shadow-[0_10px_20px_rgba(79,142,101,0.18)] transition duration-200 hover:-translate-y-px hover:bg-[#457d5a] active:scale-[0.985] sm:text-base
              ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Generating..." : "Generate Recipe"}
          </button>
        </div>
        {loading && (
          <div className="mt-6 flex justify-center space-x-2">
            <div className="h-4 w-4 animate-bounce rounded-full bg-[#4f8e65]"></div>
            <div className="h-4 w-4 animate-bounce rounded-full bg-emerald-300 [animation-delay:-0.2s]"></div>
            <div className="h-4 w-4 animate-bounce rounded-full bg-lime-200 [animation-delay:-0.4s]"></div>
            <span className="ml-3 font-medium text-[#617466]">AI is creating your recipe...</span>
          </div>
        )}
      </div>
        {errorMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-[rgba(17,29,19,0.22)] px-4 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
          <Message message={errorMessage} onClose={() => setErrorMessage(null)}/>
        </div>
      )}
    </div>
  );
};

export default RecipeAssistant;
