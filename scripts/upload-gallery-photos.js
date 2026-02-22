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

async function uploadPhotos() {
  try {
    console.log("🚀 Starting photo upload process...\n");

    // 1. Create storage bucket if it doesn't exist
    console.log("📦 Checking/creating storage bucket...");
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME);

    if (!bucketExists) {
      const { error: bucketError } = await supabase.storage.createBucket(
        BUCKET_NAME,
        {
          public: true,
          fileSizeLimit: 10485760, // 10MB limit per file
        }
      );

      if (bucketError) throw bucketError;
      console.log("✅ Bucket created successfully\n");
    } else {
      console.log("✅ Bucket already exists\n");
    }

    // 2. Get all photo files
    const photosDir = join(__dirname, "../public/community-photos");
    const files = readdirSync(photosDir).filter((f) => f.endsWith(".jpg"));
    console.log(`📸 Found ${files.length} photos to upload\n`);

    // 3. Create gallery record
    console.log("📝 Creating gallery record...");
    const [gallery] = await sql`
      INSERT INTO "web-eco_gallery" (title, description, slug, is_published, display_order)
      VALUES (
        'Gallery 1',
        'New Earth Collective community photos - moments of connection, celebration, and transformation',
        'gallery-1',
        true,
        1
      )
      RETURNING id, title, slug
    `;
    console.log(`✅ Gallery created: ${gallery.title} (ID: ${gallery.id})\n`);

    // 4. Upload photos and create database records
    console.log("⬆️  Uploading photos to Supabase Storage...\n");
    const uploadedImages = [];
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

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
            `⏩ [${i + 1}/${files.length}] Skipping ${filename} (already exists)`
          );

          // Get public URL
          const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(storagePath);

          uploadedImages.push({
            filename,
            url: urlData.publicUrl,
            storagePath,
          });
          skipCount++;
          continue;
        }

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, fileBuffer, {
            contentType: "image/jpeg",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(storagePath);

        uploadedImages.push({
          filename,
          url: urlData.publicUrl,
          storagePath,
        });

        successCount++;
        console.log(`✅ [${i + 1}/${files.length}] Uploaded ${filename}`);

        // Small delay to avoid rate limits
        if (i % 10 === 0 && i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error) {
        errorCount++;
        console.error(
          `❌ [${i + 1}/${files.length}] Failed to upload ${filename}:`,
          error.message
        );
      }
    }

    console.log(`\n📊 Upload Summary:`);
    console.log(`   ✅ Uploaded: ${successCount}`);
    console.log(`   ⏩ Skipped: ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📸 Total: ${files.length}\n`);

    // 5. Insert image records into database
    console.log("💾 Creating database records for images...");

    for (let i = 0; i < uploadedImages.length; i++) {
      const img = uploadedImages[i];

      await sql`
        INSERT INTO "web-eco_gallery_image"
          (gallery_id, image_url, storage_path, alt_text, display_order)
        VALUES (
          ${gallery.id},
          ${img.url},
          ${img.storagePath},
          ${"New Earth Collective community photo"},
          ${i}
        )
      `;
    }

    console.log(`✅ Created ${uploadedImages.length} image records\n`);

    // 6. Set cover image for gallery
    if (uploadedImages.length > 0) {
      await sql`
        UPDATE "web-eco_gallery"
        SET cover_image_url = ${uploadedImages[0].url}
        WHERE id = ${gallery.id}
      `;
      console.log("✅ Set gallery cover image\n");
    }

    console.log("🎉 Gallery upload completed successfully!");
    console.log(`📍 Gallery ID: ${gallery.id}`);
    console.log(`📍 Gallery Slug: ${gallery.slug}`);
    console.log(`📍 Total Images: ${uploadedImages.length}`);

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Upload failed:", error);
    await sql.end();
    process.exit(1);
  }
}

uploadPhotos();
