import TimeIcon from "@/assets/timed_icon.svg";

function ViewRecipe({ data }) {
  if (!data) return null;

  const {
    image,
    recipeName,
    description,
    time,
    tags = [],
    category,
    instructions,
    notes,
    ingredients = [],
  } = data;

  return (
    <div className="w-full h-fit overflow-auto bg-semiwhite">
      {/* Image + Info */}
      <div className="w-full h-120 px-12 py-3 box-border flex flex-row">
        <div className="w-1/2 h-full flex items-center justify-center rounded-l-lg overflow-hidden">
          {image ? (
            <img
              src={image}
              alt="Recipe"
              className="border-y-2 border-l-2 border-green rounded-l-lg w-full h-full object-cover"
            />
          ) : (
            <div className="border-2 border-green rounded-l-lg w-full h-full bg-white flex items-center justify-center text-green font-semibold">
              No Image
            </div>
          )}
        </div>
        <div className="w-1/2 h-full border-y-2 border-r-2 bg-white border-green rounded-r-lg overflow-hidden">
          <div className="h-92 w-full">
              <div className="px-10 pt-8 h-full flex flex-col">
              <h1 className="w-full h-30 text-green text-5xl font-bold line-clamp-2 leading-tight">
                {recipeName || "Untitled Recipe"}
              </h1>
              <div className="h-5">

              </div>
              <p className="w-full h-57 text-black text-lg whitespace-pre-line overflow-auto scrollbar-hide">{description}</p>
            </div>
          </div>
            <div className="flex items-center gap-1 justify-end pr-6">
              <img src={TimeIcon} alt="Time Icon" className="h-6 w-6 rounded-full" />
              <p className="text-black text-sm">{time || "N/A"}</p>
            </div>
          <div className="flex flex-row px-3 pt-2 overflow-x-auto gap-2 scrollbar-hide">
            {category && (
              <div className="flex items-center rounded-sm bg-green-900 h-8 px-3">
                <p className="text-sm text-white font-bold">{category}</p>
              </div>
            )}
            {tags.map((tag, index) => (
              <div key={index} className="flex items-center rounded-sm bg-green h-8 px-3">
                <p className="text-sm text-white truncate">{tag}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ingredients + Instructions */}
      <div className="w-full h-120 px-12 py-3 box-border flex flex-row">
        {/* Ingredients */}
        <div className="h-full w-1/2 border-2 rounded-l-lg border-green bg-white flex flex-col">
          <table className="w-full border-collapse overflow-auto">
            <thead className="sticky top-0">
              <tr className="bg-green">
                <th className="px-2 py-1 text-white">Name</th>
                <th className="px-2 py-1 text-white">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.length > 0 ? (
                ingredients.map((row, index) => (
                  <tr key={index} className="hover:bg-green-50">
                    <td className="w-1/2 border-b border-green px-2 py-1">{row.name}</td>
                    <td className="w-1/2 border-b border-green px-2 py-1">{row.quantity}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-gray-400 py-4">
                    No ingredients listed
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Instructions */}
        <div className="h-full w-1/2 border-y-2 border-r-2 rounded-r-lg border-green bg-white flex flex-col overflow-hidden">
          <h2 className="text-green text-lg font-bold px-3 py-1 shrink-0">Instructions</h2>
          <div className="w-full h-110 overflow-auto p-2">
            {instructions ? (
              <p className="whitespace-pre-line">{instructions}</p>
            ) : (
              <p className="text-gray-400">No instructions provided</p>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="w-full h-80 px-12 py-3 box-border">
        <div className="h-full w-full flex flex-col rounded-lg overflow-hidden bg-white border-2 border-green">
          <h2 className="text-green text-lg font-bold px-3 py-1 shrink-0">Notes</h2>
          <div className="w-full h-full overflow-auto px-5 py-2">
            {notes ? (
              <p className="whitespace-pre-line">{notes}</p>
            ) : (
              <p className="text-gray-400">No notes provided</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewRecipe;
