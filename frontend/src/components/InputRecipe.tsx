import LogoTitle from "@/components/LogoTitle";
import RecipeAssistantButton from "@/components/RecipeAssistantButton";
import { useState } from "react";
import TimeIcon from "@/assets/timed_icon.svg";
import DeleteButton from "@/assets/trash_icon.svg";
import { useNavigate } from "react-router-dom";
import RecipeAssistant from "@/components/RecipeAssistant";
import { useRecipeForm } from "@/hooks/use-recipe-form";
import type { GeneratedRecipeData, Recipe, RecipeFormData } from "@/types/recipe";

interface InputRecipeProps {
  initialData?: Recipe | null;
  onSave?: (recipeData: RecipeFormData) => void;
  allowAssistant?: boolean;
  onAIGenerated?: (generatedRecipe: GeneratedRecipeData) => void;
  isSaving?: boolean;
}

const InputRecipe = ({
  initialData = null,
  onSave,
  allowAssistant = true,
  onAIGenerated,
  isSaving = false,
}: InputRecipeProps) => {
  const navigate = useNavigate();
  const [showAssistant, setShowAssistant] = useState(false);
  const {
    titleRef,
    imagePreview,
    hasImage,
    tags,
    tagInputValue,
    instructions,
    notes,
    ingredients,
    recipeName,
    description,
    time,
    category,
    setTagInputValue,
    setInstructions,
    setNotes,
    setRecipeName,
    setDescription,
    setTime,
    setCategory,
    updateIngredient,
    deleteIngredient,
    addTagFromKeyboard,
    deleteTag,
    uploadImage,
    clearImage,
    applyGeneratedRecipe,
    getRecipeFormData,
  } = useRecipeForm({ initialData });

  const handleSave = () => {
    if (isSaving) return;
    onSave?.(getRecipeFormData());
  };

  const handleCancel = () => {
    navigate("/recipes");
  };

  return (
    <div className="min-h-screen p-2.5">
      <div className="mx-auto w-full max-w-7xl space-y-5 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500">
        <div className="flex flex-row items-center justify-between gap-2 rounded-[20px] border border-[#d7e1d8] bg-white px-2 py-1.5 shadow-[0_8px_24px_rgba(32,55,41,0.05)] motion-safe:animate-in motion-safe:slide-in-from-top-2 motion-safe:duration-500">
          <div className="shrink-0">
            <LogoTitle hideTextOnSmall backHomepage compact />
          </div>
          {allowAssistant && (
            <div className="w-auto shrink-0">
              <RecipeAssistantButton onOpen={() => setShowAssistant(true)} />
            </div>
          )}
        </div>

        {showAssistant && (
          <RecipeAssistant
            onClose={() => setShowAssistant(false)}
            onSubmit={(generatedData) => {
              applyGeneratedRecipe(generatedData);
              onAIGenerated?.(generatedData);
            }}
          />
        )}

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[22px] border border-[#d7e1d8] bg-white p-3 shadow-[0_18px_48px_rgba(32,55,41,0.08)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 sm:p-4">
            {!hasImage ? (
              <label
                htmlFor="file-upload"
                className="flex h-[18rem] cursor-pointer items-center justify-center rounded-[28px] border border-dashed border-[#bfcdbf] bg-white/24 p-6 text-center text-sm font-semibold text-[#284734] sm:h-[24rem] xl:h-[32rem]"
              >
                Upload an image or generate a recipe with AI.
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={uploadImage}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative overflow-hidden rounded-[28px] bg-white/24">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-[18rem] w-full object-cover object-center transition duration-500 hover:scale-[1.02] sm:h-[24rem] xl:h-[32rem]"
                />
                <button
                  onClick={clearImage}
                  className="absolute left-4 top-4 inline-flex rounded-full border border-[#d7e1d8] bg-white px-4 py-2 text-xs font-semibold text-[#284734] transition hover:bg-[#f7faf7] sm:text-sm"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5 rounded-[22px] border border-[#d7e1d8] bg-white p-5 shadow-[0_18px_48px_rgba(32,55,41,0.08)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500 sm:p-6 lg:p-8">
            <div className="space-y-4">
              <textarea
                ref={titleRef}
                placeholder="Recipe name"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                rows={1}
                className="w-full min-w-0 resize-none overflow-hidden border-0 bg-transparent font-['Fraunces'] text-[2.6rem] font-semibold leading-[0.9] tracking-[-0.05em] break-words text-[#284734] outline-none [overflow-wrap:anywhere] placeholder:text-[#284734]/45 sm:text-5xl lg:text-6xl"
              />
              <textarea
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-36 w-full resize-none rounded-[0.95rem] border border-[#d7e1d8] bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-[rgba(79,142,101,0.52)] focus:shadow-[0_0_0_4px_rgba(79,142,101,0.12)]"
              />
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 rounded-full border border-[#d7e1d8] bg-[#eff4ef] px-[0.72rem] py-[0.28rem] text-xs font-medium text-[#284734]">
                  <img src={TimeIcon} alt="Time Icon" className="h-5 w-5 rounded-full" />
                  <input
                    placeholder="Time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="min-w-0 flex-1 border-0 bg-transparent outline-none placeholder:text-[#617466]"
                  />
                </label>

                <div className="inline-flex w-full items-center rounded-full bg-[#254634] px-[0.72rem] py-[0.28rem] text-xs font-semibold text-white">
                  <input
                    type="text"
                    placeholder="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="min-w-0 flex-1 border-0 bg-transparent font-semibold text-white outline-none placeholder:text-white/80"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="inline-flex w-full max-w-44 items-center rounded-full border border-[#d7e1d8] bg-[#eff4ef] px-[0.72rem] py-[0.28rem] text-xs font-medium text-[#284734]">
                  <input
                    type="text"
                    placeholder="Add tag"
                    className="min-w-0 flex-1 border-0 bg-transparent outline-none placeholder:text-[#617466]"
                    value={tagInputValue}
                    onChange={(e) => setTagInputValue(e.target.value)}
                    onKeyDown={addTagFromKeyboard}
                  />
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <div
                        key={index}
                        className="relative inline-flex items-center rounded-full border border-[#d7e1d8] bg-[#eff4ef] px-[0.72rem] py-[0.28rem] pr-7 text-xs font-medium text-[#284734]"
                      >
                        <p className="truncate">{tag}</p>
                        <button
                          className="absolute right-2 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full bg-[#b84f5b] text-[10px] text-white"
                          onClick={() => deleteTag(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="overflow-hidden rounded-[22px] border border-[#d7e1d8] bg-white shadow-[0_8px_24px_rgba(32,55,41,0.05)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500">
            <div className="border-b border-white/25 px-5 py-4 sm:px-6">
              <h2 className="text-xl font-bold tracking-[-0.03em] text-[#284734] sm:text-2xl">Ingredients</h2>
            </div>
            <div className="sm:hidden">
              <div className="divide-y divide-[rgba(39,77,56,0.12)]">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="space-y-3 px-4 py-4">
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#617466]">
                        Name
                      </p>
                      <input
                        type="text"
                        value={ingredient.name}
                        onChange={(e) => updateIngredient(index, "name", e.target.value)}
                        className="w-full rounded-xl border border-[rgba(39,77,56,0.14)] bg-white/70 px-3 py-2 outline-none transition focus:border-[rgba(79,142,101,0.45)] focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#617466]">
                        Quantity
                      </p>
                      <input
                        type="text"
                        value={ingredient.quantity}
                        onChange={(e) => updateIngredient(index, "quantity", e.target.value)}
                        className="w-full rounded-xl border border-[rgba(39,77,56,0.14)] bg-white/70 px-3 py-2 outline-none transition focus:border-[rgba(79,142,101,0.45)] focus:bg-white"
                      />
                    </div>
                    {Object.values(ingredient).some((value) => value !== "") && (
                      <button
                        onClick={() => deleteIngredient(index)}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/55 transition hover:bg-white/80"
                      >
                        <img className="h-4 w-4" src={DeleteButton} alt="delete ingredient" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden overflow-auto sm:block">
              <table className="w-full min-w-[32rem] border-collapse">
                <thead>
                  <tr className="bg-[rgba(39,77,56,0.88)] text-left text-sm text-white">
                    <th className="px-5 py-3 font-semibold sm:px-6">Name</th>
                    <th className="px-5 py-3 font-semibold sm:px-6">Quantity</th>
                    <th className="px-5 py-3 text-center font-semibold sm:px-6">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ingredient, index) => (
                    <tr
                      key={index}
                      className="border-t border-[rgba(39,77,56,0.12)] align-top text-sm text-slate-700 odd:bg-white/38 even:bg-white/18 sm:text-base"
                    >
                      <td className="px-5 py-3 sm:px-6">
                        <input
                          type="text"
                          value={ingredient.name}
                          onChange={(e) => updateIngredient(index, "name", e.target.value)}
                          className="w-full rounded-xl border border-[rgba(39,77,56,0.14)] bg-white/70 px-3 py-2 outline-none transition focus:border-[rgba(79,142,101,0.45)] focus:bg-white"
                        />
                      </td>
                      <td className="px-5 py-3 sm:px-6">
                        <input
                          type="text"
                          value={ingredient.quantity}
                          onChange={(e) => updateIngredient(index, "quantity", e.target.value)}
                          className="w-full rounded-xl border border-[rgba(39,77,56,0.14)] bg-white/70 px-3 py-2 outline-none transition focus:border-[rgba(79,142,101,0.45)] focus:bg-white"
                        />
                      </td>
                      <td className="px-5 py-3 text-center sm:px-6">
                        {Object.values(ingredient).some((value) => value !== "") && (
                          <button
                            onClick={() => deleteIngredient(index)}
                            className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/55 transition hover:bg-white/80"
                          >
                            <img className="h-4 w-4" src={DeleteButton} alt="delete ingredient" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[22px] border border-[#d7e1d8] bg-white p-5 shadow-[0_8px_24px_rgba(32,55,41,0.05)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 sm:p-6">
            <h2 className="mb-4 text-xl font-bold tracking-[-0.03em] text-[#284734] sm:text-2xl">Instructions</h2>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Enter cooking steps here..."
              className="min-h-[22rem] w-full resize-none rounded-[0.95rem] border border-[#d7e1d8] bg-transparent px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-[rgba(79,142,101,0.52)] focus:shadow-[0_0_0_4px_rgba(79,142,101,0.12)]"
            />
          </div>
        </section>

        <section className="rounded-[22px] border border-[#d7e1d8] bg-white p-5 shadow-[0_8px_24px_rgba(32,55,41,0.05)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 sm:p-6">
          <h2 className="mb-4 text-xl font-bold tracking-[-0.03em] text-[#284734] sm:text-2xl">Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter cooking notes here..."
            className="min-h-48 w-full resize-none rounded-[0.95rem] border border-[#d7e1d8] bg-transparent px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-[rgba(79,142,101,0.52)] focus:shadow-[0_0_0_4px_rgba(79,142,101,0.12)]"
          />
        </section>

        <div className="flex flex-col-reverse justify-center gap-3 pb-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-5 motion-safe:duration-500 sm:flex-row">
          <button
            className="inline-flex min-w-40 items-center justify-center rounded-[0.95rem] border border-[#d7e1d8] bg-white px-[1.15rem] py-[0.72rem] text-sm font-semibold text-[#284734] transition hover:bg-[#f7faf7]"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            className="inline-flex min-w-40 items-center justify-center rounded-[0.95rem] border border-transparent bg-[#4f8e65] px-[1.15rem] py-[0.72rem] text-sm font-semibold text-white shadow-[0_10px_20px_rgba(79,142,101,0.18)] transition hover:bg-[#457d5a] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-[#4f8e65] disabled:active:scale-100"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputRecipe;
