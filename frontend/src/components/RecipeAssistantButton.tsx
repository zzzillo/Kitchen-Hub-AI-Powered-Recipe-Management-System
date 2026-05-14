interface RecipeAssistantButtonProps {
  onOpen: () => void;
}

const RecipeAssistantButton = ({ onOpen }: RecipeAssistantButtonProps) => {
  
  return (
    <div className="w-full">
      <button
        onClick={onOpen}
        className="inline-flex h-8 w-full min-w-0 items-center justify-center whitespace-nowrap rounded-[12px] border border-transparent bg-[#4f8e65] px-3 text-[0.82rem] font-semibold text-white shadow-[0_10px_20px_rgba(79,142,101,0.18)] transition duration-200 hover:-translate-y-px hover:bg-[#457d5a] active:scale-[0.985] lg:h-9 lg:rounded-[14px] lg:px-5 lg:text-sm"
      >
        <span>Recipe assistant</span>
      </button>
    </div>
  );
};

export default RecipeAssistantButton;
