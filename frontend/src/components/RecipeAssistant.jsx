import { useState } from "react";
import Message from "@/components/Message";

function RecipeAssistant({ onClose, onSubmit }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("http://localhost:3001/recipes/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query:prompt }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      const aiRecipeData = {
        recipeName: result.recipeName,
        description: result.description,
        time: result.time,
        category: result.category,
        tags: result.tags,
        instructions: result.instructions,
        notes: result.notes,
        ingredients: result.ingredients,
      };

      if (onSubmit) onSubmit(aiRecipeData);
      onClose();
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong while generating the recipe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-2/3 max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center mb-2 text-green">
          AI Recipe Assistant
        </h2>
        <p className="text-gray-600 text-center mb-4">
          Describe what kind of recipe you want and it will help you generate one!
        </p>

        <textarea
          placeholder="E.g., I want a vegan pasta with mushrooms..."
          className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green resize-none"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <div className="flex justify-end mt-4">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`bg-green text-white px-4 py-2 rounded-md transition-all duration-200
              hover:bg-green-800 hover:scale-105 
              active:bg-green-900 active:scale-95 
              ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Generating..." : "Generate Recipe"}
          </button>
        </div>
      </div>
        {errorMessage && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black/30">
          <Message message={errorMessage} onClose={() => setErrorMessage(null)}/>
        </div>
      )}
    </div>
  );
}

export default RecipeAssistant;
