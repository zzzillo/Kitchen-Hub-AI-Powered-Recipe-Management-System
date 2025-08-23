import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import TimeIcon from "../assets/timed_icon.svg";
import Message from "@/components/Message";

function RecipeCard({ id, src, title, desc, time, category, tags = [], onDeleted }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false); // show confirmation modal
  const [message, setMessage] = useState(null); // for success/error feedback

const handleDelete = async () => {
  try {
    // Optimistically close the confirmation
    setConfirmDelete(false);

    const token = localStorage.getItem("token");
    if (!token) throw new Error("Unauthorized");

    const response = await fetch(`http://localhost:3001/recipes/delete/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Failed to delete recipe");
    }

    const data = await response.json();

    if (data.success) {
      setMessage("Recipe deleted successfully!");
      if (onDeleted) onDeleted(id); // update parent state
    } else {
      setMessage(data.error || "Failed to delete recipe");
    }
  } catch (err) {
    console.error(err);
    setMessage(err.message || "Error deleting recipe");
  }
};

  return (
    <div className="w-full h-90 rounded-xl bg-white relative shadow-md">
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
              onClick={() => setConfirmDelete(true)}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Clickable link to view recipe */}
      <Link to={`/recipe/${id}`} className="block">
        <div className="h-60">
          <img src={src} alt={title} className="h-60 w-full rounded-t-xl" />
        </div>

        <div className="h-10 w-full flex justify-between items-center px-4">
          <h1 className="flex-1 text-xl font-bold truncate">{title}</h1>
          <div className="flex items-center h-10 gap-1">
            <img src={TimeIcon} alt="Time Icon" className="h-6 w-6 rounded-full" />
            <p className="text-green text-sm">{time}</p>
          </div>
        </div>

        <div className="h-10 w-full pl-5 pr-3">
          <h1 className="line-clamp-2 text-xs">{desc}</h1>
        </div>

        <div className="flex flex-row px-3 overflow-x-auto gap-1 scrollbar-hide pb-2">
          <div className="flex items-center rounded-lg bg-green-900 w-fit h-6 px-3">
            <p className="truncate text-xs text-white">{category}</p>
          </div>
          {tags.map((tag, index) => (
            <div key={index} className="flex items-center rounded-lg bg-green w-fit h-6 px-3">
              <p className="truncate text-xs text-white">{tag}</p>
            </div>
          ))}
        </div>
      </Link>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-20 bg-black/30">
          <div className="w-80 bg-white rounded-xl p-4 text-center">
            <p className="mb-4">Are you sure you want to delete this recipe?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback message modal */}
      {message && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-30 bg-black/30">
          <Message message={message} onClose={() => setMessage(null)} />
        </div>
      )}
    </div>
  );
}

export default RecipeCard;
