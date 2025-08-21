function RecipeAssistant({ onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-2/3 max-w-2xl p-6 relative">
        
        {/* Close button */}
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center mb-2 text-green">AI Recipe Assistant</h2>
        <p className="text-gray-600 text-center mb-4">
          An AI-powered assistant that generates recipes based on your prompts. 
          Just tell it what you want to cook and it will help you create a recipe!
        </p>

        <textarea
          placeholder="Describe what kind of recipe you want..."
          className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green scrollbar-hide resize-none"
        ></textarea>

        <div className="flex justify-end mt-4">
          <button className="bg-green text-white px-4 py-2 rounded-md              
              hover:bg-green-800 hover:scale-105 
              active:bg-green-900 active:scale-95 
                focus:outline-none focus:outline-0 
                shadow-none transition-all duration-200">
            Generate Recipe
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecipeAssistant;
