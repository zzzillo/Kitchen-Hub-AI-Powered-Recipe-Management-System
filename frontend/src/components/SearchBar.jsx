import SearchIcon from '../assets/search_icon.svg'

function SearchBar ({onSubmit}) {

    const handleSearchRecipe = (e) => {
        e.preventDefault();
        const search = e.target.search.value;
        onSubmit({search});
    };



  return (
    <form className="w-full" onSubmit={handleSearchRecipe}>
      <div className="flex w-full items-stretch shrink-1">
        <input
          type="text"
          name="search"
          placeholder="Search"
          className="flex-1 h-12 pl-3 bg-white text-black
                     border-t-2 border-b-2 border-l-2 border-green
                     rounded-l-md
                     focus:outline-none focus:border-green"
        />
        <button
          type="submit"
          aria-label="Search"
          className="h-12 pr-2 pl-1 bg-white text-white
                     border-t-2 border-b-2 border-r-2 border-green
                     rounded-r-md
                     transition-all duration-200"
        >
          <img src={SearchIcon} alt="" className="h-8 w-8" />
        </button>
      </div>
    </form>
  )
}

export default SearchBar
