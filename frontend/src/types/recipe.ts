export interface Ingredient {
  name: string;
  quantity: string;
  preperation?: string;
}

export interface Recipe {
  _id: string;
  image?: string;
  imageUrl?: string;
  recipeName?: string;
  description?: string;
  time?: string;
  tags?: string[] | string;
  category?: string;
  instructions?: string;
  notes?: string;
  ingredients?: Ingredient[];
  isPinned?: boolean;
  createdAt?: string;
}

export interface NormalizedRecipe extends Omit<Recipe, "tags" | "ingredients" | "isPinned"> {
  tags: string[];
  ingredients: Ingredient[];
  isPinned: boolean;
}

export interface RecipeImageState {
  preview?: string;
  remoteUrl?: string;
  file?: File | null;
}

export type RecipeImageInput = File | RecipeImageState | null;

export interface RecipeFormData {
  image: RecipeImageInput;
  imageUrl: string;
  recipeName: string;
  description: string;
  time: string;
  tags: string[];
  category: string;
  instructions: string;
  notes: string;
  ingredients: Ingredient[];
}

export interface GeneratedRecipeData {
  imageUrl?: string;
  recipeName: string;
  description: string;
  time: string;
  tags?: string[];
  category: string;
  instructions: string;
  notes: string;
  ingredients?: Ingredient[];
}
