import SearchIcon from '../assets/search_icon.svg'
import type { FormEvent } from "react";

interface SearchBarProps {
  value: string;
  onChange?: (value: string) => void;
  onSubmit?: (searchData: { search: string }) => void;
}

const SearchBar = ({ value, onChange, onSubmit }: SearchBarProps) => {
    const handleSearchRecipe = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit?.({ search: value });
    };

  return (
    <form className="w-full min-w-0 flex-1" onSubmit={handleSearchRecipe}>
      <div className="flex min-w-0 w-full items-center gap-1 rounded-[14px] border border-[#d7e1d8] bg-[#edf2ec] p-0.5 shadow-none lg:gap-2 lg:rounded-[18px] lg:p-1.5">
        <input
          type="text"
          name="search"
          placeholder="Search"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="min-w-0 h-7 flex-1 border-0 bg-transparent px-1.5 text-[0.72rem] text-slate-800 outline-none placeholder:text-slate-500 lg:h-9 lg:px-2.5 lg:text-sm"
        />
        <button
          type="submit"
          aria-label="Search"
          className="inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-[10px] border border-transparent bg-[#4f8e65] px-0 text-white shadow-[0_10px_20px_rgba(79,142,101,0.18)] transition duration-200 hover:-translate-y-px hover:bg-[#457d5a] active:scale-[0.985] lg:h-9 lg:min-w-9 lg:rounded-[14px]"
        >
          <img src={SearchIcon} alt="Search" className="h-3 w-3 lg:h-4 lg:w-4" />
        </button>
      </div>
    </form>
  )
};

export default SearchBar
