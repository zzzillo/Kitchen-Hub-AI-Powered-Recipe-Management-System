import LandingFeatureFriedChicken from "@/assets/landing-feature-fried-chicken.jpg";
import LandingFeatureRoastChickenIllustration from "@/assets/landing-feature-roast-chicken-illustration.jpg";
import LandingFeatureStrawberryDrink from "@/assets/landing-feature-strawberry-drink.jpg";
import LandingHeroCarousel1 from "@/assets/landing-hero-carousel-1.png";
import LandingHeroCarousel2 from "@/assets/landing-hero-carousel-2.png";
import LandingHeroCarousel3 from "@/assets/landing-hero-carousel-3.png";
import LandingSampleCrispyShrimp from "@/assets/landing-sample-crispy-shrimp.jpg";
import LandingSampleEggToast from "@/assets/landing-sample-egg-toast.jpg";
import LandingSampleMisoSoup from "@/assets/landing-sample-miso-soup.jpg";
import LandingSampleRoastChicken from "@/assets/landing-sample-roast-chicken.jpg";

export interface LandingFeature {
  label: string;
  title: [string, string];
  copy: string;
  imageAlt: string;
  imageSrc: string;
  reverseOnDesktop: boolean;
}

export interface RecipeIdeaSample {
  image: string;
  title: string;
  prompt: string;
  meta: string;
}

export const heroFrames = [
  LandingHeroCarousel1,
  LandingHeroCarousel2,
  LandingHeroCarousel3,
];

export const landingFeatures: LandingFeature[] = [
  {
    label: "Save",
    title: ["Keep every recipe", "in one place."],
    copy: "Store the title, image, timing, category, and notes without spreading them across tabs. Everything you need for your next meal is exactly where you expect it.",
    imageAlt: "Saved recipe preview",
    imageSrc: LandingFeatureFriedChicken,
    reverseOnDesktop: true,
  },
  {
    label: "Edit",
    title: ["Kitchen Hub keeps", "recipes editable."],
    copy: "Update ingredients later. The version you save is not the version you are stuck with. Adapt and refine your recipes as your tastes change.",
    imageSrc: LandingFeatureRoastChickenIllustration,
    imageAlt: "Editable recipe sample",
    reverseOnDesktop: false,
  },
  {
    label: "Generate",
    title: ["Start from an", "AI draft."],
    copy: "Describe what you want to cook, generate a draft, then shape it into something you would actually make. AI is your sous-chef, not your replace.",
    imageSrc: LandingFeatureStrawberryDrink,
    imageAlt: "AI recipe draft sample",
    reverseOnDesktop: true,
  },
];

export const recipeIdeaSamples: RecipeIdeaSample[] = [
  {
    image: LandingSampleCrispyShrimp,
    title: "Crispy shrimp plate",
    prompt: "Crispy shrimp with lemon and a creamy dip.",
    meta: "Light dinner idea",
  },
  {
    image: LandingSampleEggToast,
    title: "Crisp egg toast",
    prompt: "Golden toast with a fried egg, herbs, and a savory garlic finish.",
    meta: "Breakfast sample",
  },
  {
    image: LandingSampleMisoSoup,
    title: "Simple miso soup",
    prompt: "A warm bowl with tofu, seaweed, and scallions for a light starter.",
    meta: "Comforting side",
  },
  {
    image: LandingSampleRoastChicken,
    title: "Herb roast chicken",
    prompt: "A roast chicken idea with potatoes, onion, and rosemary.",
    meta: "Weekend cooking",
  },
];
