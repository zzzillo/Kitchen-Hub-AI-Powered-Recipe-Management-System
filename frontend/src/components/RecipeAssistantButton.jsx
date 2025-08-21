function RecipeAssistantButton({ onOpen }) {
  
  return (
    <div>
      <button
        onClick={onOpen}
        className="h-12 w-30 sm:w-50 lg:w-70 text-md lg:text-lg bg-green text-white font-light rounded-sm 
                   hover:bg-green-800 hover:scale-105 
                   active:bg-green-900 active:scale-95 
                   focus:outline-none focus:ring-2 focus:outline-0 
                   shadow-none transition-all duration-200"
      >
        <span className="sm:hidden">Assistant</span>
        <span className="hidden sm:inline">Recipe Assistant</span>
      </button>
    </div>
  );
}

export default RecipeAssistantButton;
