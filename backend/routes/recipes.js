const multer = require("multer");
const express = require("express");
const path = require("path");
const router = express.Router();
const { getDB, getStorageBucket } = require("../db/connection");
const { requireAuth } = require("../middleware/auth");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, and WEBP images are allowed"));
    }
    cb(null, true);
  },
});
const storageBucket = getStorageBucket();

function isRemoteImage(image) {
  return typeof image === "string" && /^https?:\/\//i.test(image);
}

function sanitizeFileName(name = "recipe") {
  return String(name)
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 80) || "recipe";
}

function parseJsonArray(field) {
  if (!field) return [];
  if (Array.isArray(field)) return field;

  try {
    const parsed = JSON.parse(field);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseTags(field) {
  if (Array.isArray(field)) return field;
  if (typeof field === "string") {
    const parsed = parseJsonArray(field);
    if (parsed.length > 0) return parsed;
    return field.split(",").map((tag) => tag.trim()).filter(Boolean);
  }
  return [];
}

function cleanText(value, maxLength = 5000) {
  return String(value || "").trim().slice(0, maxLength);
}

function normalizeIngredients(field) {
  return parseJsonArray(field)
    .slice(0, 100)
    .map((ingredient) => ({
      name: cleanText(ingredient?.name, 120),
      quantity: cleanText(ingredient?.quantity, 120),
    }))
    .filter((ingredient) => ingredient.name || ingredient.quantity);
}

function validateRecipePayload(payload) {
  if (!payload.recipeName) {
    return "Recipe name is required";
  }

  if (payload.recipeName.length > 120) return "Recipe name is too long";
  if (payload.description.length > 2000) return "Description is too long";
  if (payload.time.length > 60) return "Time is too long";
  if (payload.category.length > 60) return "Category is too long";
  if (payload.instructions.length > 20000) return "Instructions are too long";
  if (payload.notes.length > 5000) return "Notes are too long";
  if (payload.tags.length > 15) return "Too many tags";
  if (payload.tags.some((tag) => tag.length > 30)) return "Tags must be 30 characters or less";
  if (payload.ingredients.length > 100) return "Too many ingredients";
  if (payload.imageUrl && !isRemoteImage(payload.imageUrl)) return "Image URL must be a valid http or https link";

  return null;
}

function mapRecipe(row) {
  if (!row) return null;

  return {
    _id: row.id,
    userId: row.user_id,
    recipeName: row.recipe_name,
    description: row.description,
    image: row.image,
    time: row.time,
    category: row.category || "",
    tags: Array.isArray(row.tags) ? row.tags : [],
    instructions: row.instructions || "",
    notes: row.notes || "",
    ingredients: Array.isArray(row.ingredients) ? row.ingredients : [],
    isPinned: Boolean(row.is_pinned),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isMissingColumnError(error, columnName) {
  return error?.code === "PGRST204" && error?.message?.includes(`'${columnName}'`);
}

function recipeMatchesQuery(row, query) {
  if (!query) return true;

  const haystacks = [
    row.recipe_name,
    row.description,
    row.category,
    row.time,
    row.instructions,
    row.notes,
    ...(Array.isArray(row.tags) ? row.tags : []),
    ...(Array.isArray(row.ingredients)
      ? row.ingredients.flatMap((ingredient) => [ingredient?.name, ingredient?.quantity])
      : []),
  ]
    .map((value) => String(value || "").toLowerCase())
    .filter(Boolean);

  const searchTerms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);

  return searchTerms.every((term) => haystacks.some((value) => value.includes(term)));
}

function sortRecipes(rows) {
  return [...rows].sort((left, right) => {
    if (Boolean(left.is_pinned) !== Boolean(right.is_pinned)) {
      return left.is_pinned ? -1 : 1;
    }

    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
  });
}

async function uploadImageToStorage(reqFile, recipeName) {
  if (!reqFile) return null;

  const db = getDB();
  const ext = path.extname(reqFile.originalname || "").toLowerCase() || ".jpg";
  const fileName = `${Date.now()}-${sanitizeFileName(recipeName)}${ext}`;
  const filePath = `recipes/${fileName}`;

  const { error: uploadError } = await db.storage
    .from(storageBucket)
    .upload(filePath, reqFile.buffer, {
      contentType: reqFile.mimetype,
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = db.storage.from(storageBucket).getPublicUrl(filePath);
  return data.publicUrl;
}

async function deleteStoredImageByUrl(imageUrl) {
  if (!imageUrl || !isRemoteImage(imageUrl)) return;

  const db = getDB();
  const marker = `/storage/v1/object/public/${storageBucket}/`;
  const markerIndex = imageUrl.indexOf(marker);
  if (markerIndex === -1) return;

  const objectPath = imageUrl.slice(markerIndex + marker.length);
  if (!objectPath) return;

  await db.storage.from(storageBucket).remove([objectPath]);
}

async function deleteStoredImageQuietly(imageUrl) {
  try {
    await deleteStoredImageByUrl(imageUrl);
  } catch (error) {
    console.error("Image cleanup error:", error);
  }
}

async function getOwnedRecipeOrRespond(res, recipeId, username) {
  const db = getDB();
  const { data, error } = await db
    .from("recipes")
    .select("*")
    .eq("id", recipeId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    res.status(404).json({ success: false, error: "Recipe not found" });
    return null;
  }

  if (data.user_id !== username) {
    res.status(403).json({ success: false, error: "Forbidden" });
    return null;
  }

  return data;
}

router.use(requireAuth);

// Create a recipe
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const db = getDB();
    const payload = {
      recipeName: cleanText(req.body.recipeName, 120),
      description: cleanText(req.body.description, 2000),
      time: cleanText(req.body.time, 60),
      category: cleanText(req.body.category, 60),
      tags: parseTags(req.body.tags).slice(0, 15).map((tag) => cleanText(tag, 30)).filter(Boolean),
      instructions: cleanText(req.body.instructions, 20000),
      notes: cleanText(req.body.notes, 5000),
      ingredients: normalizeIngredients(req.body.ingredients),
      imageUrl: cleanText(req.body.imageUrl, 2000),
    };
    const validationError = validateRecipePayload(payload);

    if (validationError) {
      return res.status(400).json({ success: false, error: validationError });
    }

    const uploadedImageUrl = req.file
      ? await uploadImageToStorage(req.file, payload.recipeName)
      : payload.imageUrl || null;

    const recipePayload = {
      user_id: req.user.username,
      recipe_name: payload.recipeName,
      description: payload.description,
      image: uploadedImageUrl,
      time: payload.time,
      category: payload.category,
      tags: payload.tags,
      instructions: payload.instructions,
      notes: payload.notes,
      ingredients: payload.ingredients,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await db
      .from("recipes")
      .insert(recipePayload)
      .select()
      .single();

    if (error) {
      if (isMissingColumnError(error, "is_pinned")) {
        return res.status(400).json({
          success: false,
          error: "Recipe pinning is not enabled in the database yet. Run backend/supabase-recipe-pin-migration.sql, then try again.",
        });
      }
      throw error;
    }

    res.json({ success: true, insertedId: data.id, image: data.image });
  } catch (err) {
    console.error(err);
    if (err instanceof multer.MulterError || err.message?.includes("Only JPG")) {
      return res.status(400).json({ success: false, error: err.message });
    }
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Get all recipes for the authenticated user, optionally filtered by query
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const query = cleanText(req.query.query, 120);

    const request = db
      .from("recipes")
      .select("*")
      .eq("user_id", req.user.username)
      .order("created_at", { ascending: false });

    const { data, error } = await request;

    if (error) {
      throw error;
    }

    const filteredRecipes = (data || []).filter((row) => recipeMatchesQuery(row, query));
    res.json(sortRecipes(filteredRecipes).map(mapRecipe));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Get single recipe by ID
router.get("/:id", async (req, res) => {
  try {
    const recipe = await getOwnedRecipeOrRespond(res, req.params.id, req.user.username);
    if (!recipe) {
      return;
    }

    res.json(mapRecipe(recipe));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Update a recipe
router.put("/:id", upload.single("image"), async (req, res) => {
  let uploadedReplacementImageUrl = null;
  try {
    const recipeId = req.params.id;
    const db = getDB();
    const existingRecipe = await getOwnedRecipeOrRespond(res, recipeId, req.user.username);
    if (!existingRecipe) {
      return;
    }

    const payload = {
      recipeName: req.body.recipeName !== undefined ? cleanText(req.body.recipeName, 120) : cleanText(existingRecipe.recipe_name, 120),
      description: req.body.description !== undefined ? cleanText(req.body.description, 2000) : cleanText(existingRecipe.description, 2000),
      time: req.body.time !== undefined ? cleanText(req.body.time, 60) : cleanText(existingRecipe.time, 60),
      category: req.body.category !== undefined ? cleanText(req.body.category, 60) : cleanText(existingRecipe.category, 60),
      tags: req.body.tags !== undefined
        ? parseTags(req.body.tags).slice(0, 15).map((tag) => cleanText(tag, 30)).filter(Boolean)
        : Array.isArray(existingRecipe.tags) ? existingRecipe.tags : [],
      instructions: req.body.instructions !== undefined ? cleanText(req.body.instructions, 20000) : cleanText(existingRecipe.instructions, 20000),
      notes: req.body.notes !== undefined ? cleanText(req.body.notes, 5000) : cleanText(existingRecipe.notes, 5000),
      ingredients: req.body.ingredients !== undefined ? normalizeIngredients(req.body.ingredients) : Array.isArray(existingRecipe.ingredients) ? existingRecipe.ingredients : [],
      imageUrl: req.body.imageUrl !== undefined ? cleanText(req.body.imageUrl, 2000) : cleanText(existingRecipe.image, 2000),
    };
    const validationError = validateRecipePayload(payload);

    if (validationError) {
      return res.status(400).json({ success: false, error: validationError });
    }

    const updates = {
      updated_at: new Date().toISOString(),
    };

    if (req.body.recipeName !== undefined) updates.recipe_name = payload.recipeName;
    if (req.body.description !== undefined) updates.description = payload.description;
    if (req.body.time !== undefined) updates.time = payload.time;
    if (req.body.category !== undefined) updates.category = payload.category;
    if (req.body.instructions !== undefined) updates.instructions = payload.instructions;
    if (req.body.notes !== undefined) updates.notes = payload.notes;
    if (req.body.tags !== undefined) {
      updates.tags = payload.tags;
    }
    if (req.body.ingredients !== undefined) updates.ingredients = payload.ingredients;

    if (payload.imageUrl && payload.imageUrl !== existingRecipe.image) {
      updates.image = payload.imageUrl;
    }

    if (req.file) {
      uploadedReplacementImageUrl = await uploadImageToStorage(req.file, payload.recipeName || existingRecipe.recipe_name);
      updates.image = uploadedReplacementImageUrl;
    }

    const { data, error } = await db
      .from("recipes")
      .update(updates)
      .eq("id", recipeId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (updates.image && updates.image !== existingRecipe.image) {
      await deleteStoredImageQuietly(existingRecipe.image);
    }

    res.json({ success: true, modifiedCount: data ? 1 : 0 });
  } catch (err) {
    console.error("Update error:", err);
    if (uploadedReplacementImageUrl) {
      await deleteStoredImageQuietly(uploadedReplacementImageUrl);
    }
    if (err instanceof multer.MulterError || err.message?.includes("Only JPG")) {
      return res.status(400).json({ success: false, error: err.message });
    }
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.patch("/:id/pin", async (req, res) => {
  try {
    const recipeId = req.params.id;
    const db = getDB();
    const recipe = await getOwnedRecipeOrRespond(res, recipeId, req.user.username);
    if (!recipe) {
      return;
    }

    const isPinned = Boolean(req.body?.isPinned);

    const { data, error } = await db
      .from("recipes")
      .update({
        is_pinned: isPinned,
        updated_at: new Date().toISOString(),
      })
      .eq("id", recipeId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    res.json({ success: true, recipe: mapRecipe(data) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Delete a recipe
router.delete("/:id", async (req, res) => {
  try {
    const recipeId = req.params.id;
    const db = getDB();
    const recipe = await getOwnedRecipeOrRespond(res, recipeId, req.user.username);
    if (!recipe) {
      return;
    }

    await deleteStoredImageByUrl(recipe.image);

    const { error: deleteError } = await db
      .from("recipes")
      .delete()
      .eq("id", recipeId);

    if (deleteError) {
      throw deleteError;
    }

    res.json({ success: true, deletedCount: 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
