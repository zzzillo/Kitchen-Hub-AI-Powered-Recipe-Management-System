interface AddRecipeButtonProps {
  addRecipe: () => void;
}

const AddRecipeButton = ({ addRecipe }: AddRecipeButtonProps) => {
  return (
    <div className="w-auto shrink-0">
      <button
        onClick={addRecipe}
        className="inline-flex h-7 w-[3.35rem] items-center justify-center whitespace-nowrap rounded-[11px] border border-transparent bg-[#4f8e65] px-0 text-[0.84rem] font-semibold text-white shadow-[0_10px_20px_rgba(79,142,101,0.18)] transition duration-200 hover:-translate-y-px hover:bg-[#457d5a] active:scale-[0.985] lg:h-8 lg:w-auto lg:min-w-[4.5rem] lg:rounded-[13px] lg:px-4 lg:text-sm"
      >
        <span>Add</span>
      </button>
    </div>
  );
};

export default AddRecipeButton;
