import { useState } from "react";

function RecipeAssistant({ onClose, onSubmit }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);

    // Placeholder for future API call
    const aiRecipeData = {
      recipeName: "AI Generated Recipe",
      description: "Generated description based on: " + prompt,
      time: "30 mins",
      category: "Generated",
      tags: ["AI", "Generated"],
      instructions: "Step 1: ... Step 2: ...",
      notes: "",
      ingredients: [
        { name: "Ingredient 1", quantity: "1 cup", notes: "" },
        { name: "Ingredient 2", quantity: "2 tsp", notes: "" }
      ],
      image: null
    };

    // Call parent handler with generated data
    if (onSubmit) onSubmit(aiRecipeData);

    setLoading(false);
    onClose(); // close modal
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

        <h2 className="text-2xl font-bold text-center mb-2 text-green">AI Recipe Assistant</h2>
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
    </div>
  );
}

export default RecipeAssistant;
