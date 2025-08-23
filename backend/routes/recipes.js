const multer = require("multer");
const express = require("express");
const router = express.Router();
const { getDB } = require("../db/connection");
const { ObjectId } = require("mongodb");
const fs = require("fs");
const path = require("path");

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder to save
  },
  filename: (req, file, cb) => {
    // timestamp in ms
    const timestamp = Date.now();

    // recipeName from body (fallback if missing)
    const recipeName = req.body.recipeName
      ? req.body.recipeName.replace(/\s+/g, "_")
      : "recipe";

    // get file extension
    const ext = file.originalname.split(".").pop();

    // final filename: timestamp-recipeName.ext
    cb(null, `${timestamp}-${recipeName}.${ext}`);
  },
});

const upload = multer({ storage });

// Create a recipe
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { recipeName, description, time, tags, instructions, notes, ingredients, userId } = req.body;

    const db = getDB();
    const collection = db.collection("recipes");

    const recipe = {
      userId,
      recipeName,
      description,
      image: req.file ? req.file.filename : null, // store filename
      time,
      tags: tags ? JSON.parse(tags) : [], // if frontend sends JSON.stringify
      instructions: instructions || "",
      notes: notes || "",
      ingredients: ingredients ? JSON.parse(ingredients) : [], // parse array
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(recipe);
    res.json({ success: true, insertedId: result.insertedId, image: recipe.image });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});


// Get all recipes by user
router.get("/user/:userId", async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("recipes");
    const userId = req.params.userId;

    const recipes = await collection.find({ userId: userId }).toArray();
    res.json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Get single recipe by ID
router.get("/:id", async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("recipes");
    const recipeId = req.params.id;
    const recipe = await collection.findOne({ _id: new ObjectId(recipeId) });
    if (!recipe) return res.status(404).json({ success: false, error: "Recipe not found" });
    if (recipe.image) {
      recipe.image = `http://localhost:3001/uploads/${recipe.image}`;
    }
    res.json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.put("/edit/:id", upload.single("image"), async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("recipes");
    const recipeId = req.params.id;

    // find existing recipe
    const recipe = await collection.findOne({ _id: new ObjectId(recipeId) });
    if (!recipe) return res.status(404).json({ success: false, error: "Recipe not found" });

    const updates = { ...req.body, updatedAt: new Date() };

    // handle image update
    if (req.file) {
      // delete old image if exists
      if (recipe.image) {
        const oldPath = path.join("uploads", recipe.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      updates.image = req.file.filename;
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(recipeId) },
      { $set: updates }
    );

    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});


// Delete a recipe
router.delete("/delete/:id", async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("recipes");
    const recipeId = req.params.id;

    // find recipe first
    const recipe = await collection.findOne({ _id: new ObjectId(recipeId) });
    if (!recipe) return res.status(404).json({ success: false, error: "Recipe not found" });

    // delete image file if exists
    if (recipe.image) {
      const imagePath = path.join("uploads", recipe.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    const result = await collection.deleteOne({ _id: new ObjectId(recipeId) });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET /recipes/search?userId=xxx&query=yyy
router.get("/search", async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("recipes");
    const { userId, query } = req.query;

    if (!userId) return res.status(400).json({ success: false, error: "userId is required" });

    const searchRegex = query
      ? { $regex: query, $options: "i" } // case-insensitive match
      : /.*/;

    const recipes = await collection
      .find({ userId, recipeName: searchRegex })
      .toArray();

    res.json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
