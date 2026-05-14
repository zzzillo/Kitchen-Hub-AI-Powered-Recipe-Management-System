const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const storageBucket = process.env.SUPABASE_STORAGE_BUCKET || "recipe-images";

let supabase;

async function connectDB() {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: buckets, error: bucketListError } = await supabase.storage.listBuckets();
    if (bucketListError) {
      throw bucketListError;
    }

    const bucketExists = buckets.some((bucket) => bucket.name === storageBucket);
    if (!bucketExists) {
      const { error: createBucketError } = await supabase.storage.createBucket(storageBucket, {
        public: true,
      });

      if (createBucketError) {
        throw createBucketError;
      }
    }

    console.log("Connected to Supabase!");
  } catch (err) {
    console.error("Supabase connection error:", err.message || err);
    process.exit(1);
  }
}

function getDB() {
  if (!supabase) {
    throw new Error("Database not initialized. Call connectDB first.");
  }

  return supabase;
}

function getStorageBucket() {
  return storageBucket;
}

module.exports = { connectDB, getDB, getStorageBucket };
