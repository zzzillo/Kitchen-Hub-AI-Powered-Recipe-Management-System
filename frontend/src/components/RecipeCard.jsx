import { Link } from "react-router-dom";
import { useState } from "react";
import TimeIcon from "../assets/timed_icon.svg";

function RecipeCard({ id, src, title, desc, time, category, tags = [], onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="w-full h-90 rounded-xl bg-white relative">
      {/* Triple dot menu */}
      <div className="absolute top-1 right-1 z-20">
        <button
          className="p-1 rounded-full hover:bg-gray-200 text-green"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ⋮
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-1 w-24 bg-white border rounded-lg shadow-lg z-10">
            <button
              onClick={onDelete}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Make the rest clickable */}
      <Link to={`/recipe/${id}`} className="block">
        {/* Image */}
        <div className="h-60">
          <img src={src} alt={title} className="h-60 w-full rounded-t-xl" />
        </div>

        {/* Title + time */}
        <div className="h-10 w-full flex justify-between items-center px-4">
          <h1 className="flex-1 text-xl font-bold truncate">{title}</h1>
          <div className="flex items-center h-10 gap-1">
            <img
              src={TimeIcon}
              alt="Search Icon"
              className="h-6 w-6 rounded-full"
            />
            <p className="text-green text-sm">{time}</p>
          </div>
        </div>

        {/* Description */}
        <div className="h-10 w-full pl-5 pr-3">
          <h1 className="line-clamp-2 text-xs">{desc}</h1>
        </div>

        {/* Category + Tags */}
        <div className="flex flex-row px-3 overflow-x-auto gap-1 scrollbar-hide pb-2">
          <div className="flex items-center rounded-lg bg-green-900 w-fit h-6 px-3">
            <p className="truncate text-xs text-white">{category}</p>
          </div>
          {tags.map((tag, index) => (
            <div
              key={index}
              className="flex items-center rounded-lg bg-green w-fit h-6 px-3"
            >
              <p className="truncate text-xs text-white">{tag}</p>
            </div>
          ))}
        </div>
      </Link>
    </div>
  );
}

export default RecipeCard;
