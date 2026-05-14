import TimeIcon from "@/assets/timed_icon.svg";
import type { NormalizedRecipe, Recipe } from "@/types/recipe";

interface ViewRecipeProps {
  data: Recipe | NormalizedRecipe | null;
}

const ViewRecipe = ({ data }: ViewRecipeProps) => {
  if (!data) return null;

  const {
    image,
    recipeName,
    description,
    time,
    tags: recipeTags = [],
    category,
    instructions,
    notes,
    ingredients = [],
  } = data;

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-[22px] border border-[#d7e1d8] bg-white p-3 shadow-[0_18px_48px_rgba(32,55,41,0.08)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 sm:p-4">
          <div className="overflow-hidden rounded-[28px] bg-white/28">
            {image ? (
              <img
                src={image}
                alt="Recipe"
                className="h-[18rem] w-full object-cover object-center transition duration-500 hover:scale-[1.02] sm:h-[24rem] xl:h-[34rem]"
              />
            ) : (
              <div className="flex h-[18rem] items-center justify-center text-sm font-semibold text-[#284734] sm:h-[24rem] xl:h-[34rem]">
                No image
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5 rounded-[22px] border border-[#d7e1d8] bg-white p-5 shadow-[0_18px_48px_rgba(32,55,41,0.08)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500 sm:p-6 lg:p-8">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {category && (
                <span className="inline-flex items-center rounded-full bg-[#254634] px-[0.72rem] py-[0.28rem] text-xs font-semibold text-white">
                  {category}
                </span>
              )}
              {(Array.isArray(recipeTags) ? recipeTags : []).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full border border-[#d7e1d8] bg-[#eff4ef] px-[0.72rem] py-[0.28rem] text-xs font-medium text-[#284734]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="font-['Fraunces'] text-5xl font-semibold leading-none tracking-[-0.05em] text-[#284734] sm:text-6xl">
              {recipeName || "Untitled Recipe"}
            </h1>
            <div className="flex w-fit items-center gap-2 rounded-full border border-[#d7e1d8] bg-[#eff4ef] px-[0.72rem] py-[0.28rem] text-xs font-medium text-[#284734]">
              <img src={TimeIcon} alt="Time Icon" className="h-5 w-5 rounded-full" />
              <span>{time || "N/A"}</span>
            </div>
          </div>

          <p className="max-w-none whitespace-pre-line text-sm leading-7 text-[#617466]">
            {description || "No description available"}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="overflow-hidden rounded-[22px] border border-[#d7e1d8] bg-white shadow-[0_8px_24px_rgba(32,55,41,0.05)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500">
          <div className="border-b border-white/25 px-5 py-4 sm:px-6">
            <h2 className="text-xl font-bold tracking-[-0.03em] text-[#284734] sm:text-2xl">Ingredients</h2>
          </div>
          <div className="sm:hidden">
            {ingredients.length > 0 ? (
              <div className="divide-y divide-[rgba(39,77,56,0.12)]">
                {ingredients.map((row, index) => (
                  <div key={index} className="space-y-2 px-4 py-4 text-sm text-slate-700">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#617466]">
                        Name
                      </p>
                      <p className="mt-1">{row.name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#617466]">
                        Quantity
                      </p>
                      <p className="mt-1">{row.quantity || "-"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-sm text-[#617466]">
                No ingredients listed
              </div>
            )}
          </div>
          <div className="hidden overflow-auto sm:block">
            <table className="w-full min-w-[28rem] border-collapse">
              <thead>
                <tr className="bg-[rgba(39,77,56,0.88)] text-left text-sm text-white">
                  <th className="px-5 py-3 font-semibold sm:px-6">Name</th>
                  <th className="px-5 py-3 font-semibold sm:px-6">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.length > 0 ? (
                  ingredients.map((row, index) => (
                    <tr
                      key={index}
                      className="border-t border-[rgba(39,77,56,0.12)] text-sm text-slate-700 odd:bg-white/38 even:bg-white/18 sm:text-base"
                    >
                      <td className="px-5 py-3 sm:px-6">{row.name}</td>
                      <td className="px-5 py-3 sm:px-6">{row.quantity}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-5 py-6 text-center text-sm text-[#617466] sm:px-6">
                      No ingredients listed
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[22px] border border-[#d7e1d8] bg-white p-5 shadow-[0_8px_24px_rgba(32,55,41,0.05)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 sm:p-6">
          <h2 className="mb-4 text-xl font-bold tracking-[-0.03em] text-[#284734] sm:text-2xl">Instructions</h2>
          {instructions ? (
            <p className="whitespace-pre-line text-sm leading-7 text-slate-700 sm:text-base">
              {instructions}
            </p>
          ) : (
            <p className="text-sm text-[#617466] sm:text-base">No instructions provided</p>
          )}
        </div>
      </section>

      <section className="rounded-[22px] border border-[#d7e1d8] bg-white p-5 shadow-[0_8px_24px_rgba(32,55,41,0.05)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 sm:p-6">
        <h2 className="mb-4 text-xl font-bold tracking-[-0.03em] text-[#284734] sm:text-2xl">Notes</h2>
        {notes ? (
          <p className="whitespace-pre-line text-sm leading-7 text-slate-700 sm:text-base">{notes}</p>
        ) : (
          <p className="text-sm text-[#617466] sm:text-base">No notes provided</p>
        )}
      </section>
    </div>
  );
};

export default ViewRecipe;
