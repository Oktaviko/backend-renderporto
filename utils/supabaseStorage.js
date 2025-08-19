// utils/supabaseStorage.js
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Upload file ke Supabase Storage
async function uploadFile(file, bucket = "uploads", folder = "") {
  const fileExt = file.originalname.split(".").pop();
  const fileName = `${folder}${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw error;

  // Get public URL
  const { data: publicData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return {
    fileName: fileName,
    publicUrl: publicData.publicUrl,
  };
}

// Delete file dari Supabase Storage
async function deleteFile(fileName, bucket = "uploads") {
  const { error } = await supabase.storage.from(bucket).remove([fileName]);

  if (error) throw error;
}

module.exports = { uploadFile, deleteFile };
