function AddRecipeButton({addRecipe}) {
  return (
    <div>
      <button
        onClick={addRecipe}
        className="h-12 w-15 sm:w-20 lg:w-40 text-md lg:text-lg bg-green text-white font-light rounded-sm 
                   hover:bg-green-800 hover:scale-105 
                   active:bg-green-900 active:scale-95 
                   focus:outline-none focus:outline-0 
                   shadow-none transition-all duration-200"
      >
        <span className="lg:hidden">Add</span>
        <span className="hidden lg:inline">Add recipe</span>
      </button>
    </div>
  );
}

export default AddRecipeButton;
