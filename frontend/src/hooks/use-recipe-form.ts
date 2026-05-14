import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import type {
  GeneratedRecipeData,
  Ingredient,
  Recipe,
  RecipeFormData,
  RecipeImageInput,
} from "@/types/recipe";

interface UseRecipeFormOptions {
  initialData?: Recipe | null;
}

const emptyIngredient = (): Ingredient => ({ name: "", quantity: "" });

const hasIngredientValue = (ingredient: Ingredient): boolean =>
  Object.values(ingredient).some((value) => value !== "");

export const useRecipeForm = ({ initialData = null }: UseRecipeFormOptions) => {
  const [image, setImage] = useState<RecipeImageInput>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInputValue, setTagInputValue] = useState("");
  const [instructions, setInstructions] = useState("");
  const [notes, setNotes] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([emptyIngredient()]);
  const [recipeName, setRecipeName] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const resizeTitle = () => {
    if (!titleRef.current) return;
    titleRef.current.style.height = "0px";
    titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
  };

  useEffect(() => {
    if (initialData) {
      setImagePreview(initialData.image || "");
      setImage(initialData.image ? { preview: initialData.image, file: null } : null);
      setTags(Array.isArray(initialData.tags) ? initialData.tags : []);
      setInstructions(initialData.instructions || "");
      setNotes(initialData.notes || "");
      setIngredients(
        initialData.ingredients?.length
          ? [...initialData.ingredients, emptyIngredient()]
          : [emptyIngredient()],
      );
      setRecipeName(initialData.recipeName || "");
      setDescription(initialData.description || "");
      setTime(initialData.time || "");
      setCategory(initialData.category || "");
    }
  }, [initialData]);

  useEffect(() => {
    resizeTitle();
  }, [recipeName]);

  const updateIngredient = (
    index: number,
    field: keyof Pick<Ingredient, "name" | "quantity">,
    value: string,
  ) => {
    const nextIngredients = [...ingredients];
    nextIngredients[index] = { ...nextIngredients[index], [field]: value };

    if (index === nextIngredients.length - 1 && hasIngredientValue(nextIngredients[index])) {
      setIngredients([...nextIngredients, emptyIngredient()]);
      return;
    }

    setIngredients(nextIngredients);
  };

  const deleteIngredient = (index: number) => {
    const nextIngredients = [...ingredients];
    nextIngredients.splice(index, 1);
    setIngredients(nextIngredients);
  };

  const addTagFromKeyboard = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && tagInputValue.trim() !== "") {
      event.preventDefault();
      setTags([...tags, tagInputValue.trim()]);
      setTagInputValue("");
    }
  };

  const deleteTag = (index: number) => {
    const nextTags = [...tags];
    nextTags.splice(index, 1);
    setTags(nextTags);
  };

  const uploadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setImage(file);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview("");
  };

  const applyGeneratedRecipe = (generatedRecipe: GeneratedRecipeData) => {
    setRecipeName(generatedRecipe.recipeName);
    setDescription(generatedRecipe.description);
    setTime(generatedRecipe.time);
    setCategory(generatedRecipe.category);
    setTags(generatedRecipe.tags || []);
    setInstructions(generatedRecipe.instructions);
    setNotes(generatedRecipe.notes);
    setIngredients(
      generatedRecipe.ingredients?.length
        ? [...generatedRecipe.ingredients, emptyIngredient()]
        : [emptyIngredient()],
    );
    if (generatedRecipe.imageUrl) {
      setImage({ remoteUrl: generatedRecipe.imageUrl });
      setImagePreview(generatedRecipe.imageUrl);
    }
  };

  const getRecipeFormData = (): RecipeFormData => ({
    image,
    imageUrl: image && !(image instanceof File) ? image.remoteUrl || "" : "",
    recipeName,
    description,
    time,
    tags,
    category,
    instructions,
    notes,
    ingredients: ingredients.filter(hasIngredientValue),
  });

  return {
    titleRef,
    image,
    imagePreview,
    hasImage: Boolean(imagePreview),
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
  };
};
