import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import postgres from "postgres";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, "../.env") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BUCKET_NAME = "community-photos";

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Initialize database client
const sql = postgres(process.env.DATABASE_URL);

async function uploadWebPPhotos() {
  try {
    console.log("🚀 Starting WebP photo upload process...\n");

    // 1. Get all WebP files
    const photosDir = join(__dirname, "../public/community-photos");
    const files = readdirSync(photosDir).filter((f) => f.endsWith(".webp"));
    console.log(`📸 Found ${files.length} WebP photos to upload\n`);

    // 2. Get gallery ID
    const [gallery] = await sql`
      SELECT id, title, slug FROM "web-eco_gallery" WHERE slug = 'gallery-1' LIMIT 1
    `;

    if (!gallery) {
      throw new Error(
        "Gallery not found! Please run upload-gallery-photos.js first."
      );
    }

    console.log(`✅ Using gallery: ${gallery.title} (ID: ${gallery.id})\n`);

    // 3. Upload WebP photos and update database records
    console.log("⬆️  Uploading WebP photos to Supabase Storage...\n");
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    let updateCount = 0;

    for (let i = 0; i < files.length; i++) {
      const filename = files[i];
      const filepath = join(photosDir, filename);

      try {
        // Read file
        const fileBuffer = readFileSync(filepath);
        const storagePath = `gallery-1/${filename}`;

        // Check if file already exists
        const { data: existingFile } = await supabase.storage
          .from(BUCKET_NAME)
          .list("gallery-1", { search: filename });

        if (existingFile && existingFile.length > 0) {
          console.log(
            `⏩ [${i + 1}/${files.length}] ${filename} already in storage`
          );
          skipCount++;
        } else {
          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(storagePath, fileBuffer, {
              contentType: "image/webp",
              upsert: false,
            });

          if (uploadError) throw uploadError;

          console.log(`✅ [${i + 1}/${files.length}] Uploaded ${filename}`);
          successCount++;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(storagePath);

        // Update database record (match by original JPG filename)
        const originalFilename = filename.replace(".webp", ".jpg");
        const result = await sql`
          UPDATE "web-eco_gallery_image"
          SET
            image_url = ${urlData.publicUrl},
            storage_path = ${storagePath}
          WHERE gallery_id = ${gallery.id}
            AND storage_path = ${"gallery-1/" + originalFilename}
          RETURNING id
        `;

        if (result.length > 0) {
          console.log(
            `   📝 Updated database record for ${originalFilename} → ${filename}`
          );
          updateCount++;
        } else {
          console.log(
            `   ⚠️  No database record found for ${originalFilename}`
          );
        }
      } catch (error) {
        errorCount++;
        console.error(
          `❌ [${i + 1}/${files.length}] Failed to process ${filename}:`,
          error.message
        );
      }

      // Small delay to avoid rate limits
      if (i % 10 === 0 && i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    console.log(`\n📊 Upload Summary:`);
    console.log(`   ✅ Uploaded: ${successCount}`);
    console.log(`   ⏩ Skipped (already exists): ${skipCount}`);
    console.log(`   📝 Database records updated: ${updateCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📸 Total: ${files.length}\n`);

    // 4. Update gallery cover image if needed
    const [coverImage] = await sql`
      SELECT image_url FROM "web-eco_gallery_image"
      WHERE gallery_id = ${gallery.id}
      ORDER BY display_order ASC
      LIMIT 1
    `;

    if (coverImage) {
      await sql`
        UPDATE "web-eco_gallery"
        SET cover_image_url = ${coverImage.image_url}
        WHERE id = ${gallery.id}
      `;
      console.log("✅ Updated gallery cover image\n");
    }

    console.log("🎉 WebP upload completed successfully!");
    console.log(`📍 Gallery ID: ${gallery.id}`);
    console.log(`📍 Gallery Slug: ${gallery.slug}`);
    console.log(`📍 All images now use optimized WebP format\n`);

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Upload failed:", error);
    await sql.end();
    process.exit(1);
  }
}

uploadWebPPhotos();
