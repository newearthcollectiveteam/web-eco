import { readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import postgres from "postgres";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, "../.env") });

// Initialize database client
const sql = postgres(process.env.DATABASE_URL);

async function createGalleryRecords() {
  try {
    console.log("🚀 Creating gallery database records...\n");

    // 1. Get all photo files
    const photosDir = join(__dirname, "../public/community-photos");
    const files = readdirSync(photosDir)
      .filter((f) => f.endsWith(".jpg"))
      .sort(); // Sort alphabetically for consistent ordering

    console.log(`📸 Found ${files.length} photos\n`);

    // 2. Check if gallery already exists
    const existingGallery = await sql`
      SELECT id, title, slug FROM "web-eco_gallery" WHERE slug = 'gallery-1'
    `;

    let gallery;
    if (existingGallery.length > 0) {
      gallery = existingGallery[0];
      console.log(
        `✅ Using existing gallery: ${gallery.title} (ID: ${gallery.id})\n`
      );

      // Delete existing images for this gallery to avoid duplicates
      await sql`DELETE FROM "web-eco_gallery_image" WHERE gallery_id = ${gallery.id}`;
      console.log("🧹 Cleared existing image records\n");
    } else {
      // 3. Create gallery record
      console.log("📝 Creating new gallery record...");
      const [newGallery] = await sql`
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
      gallery = newGallery;
      console.log(`✅ Gallery created: ${gallery.title} (ID: ${gallery.id})\n`);
    }

    // 4. Insert image records into database
    console.log("💾 Creating database records for images...");

    for (let i = 0; i < files.length; i++) {
      const filename = files[i];
      const publicUrl = `/community-photos/${filename}`;
      const storagePath = `public/community-photos/${filename}`;

      await sql`
        INSERT INTO "web-eco_gallery_image"
          (gallery_id, image_url, storage_path, alt_text, display_order)
        VALUES (
          ${gallery.id},
          ${publicUrl},
          ${storagePath},
          ${"New Earth Collective community gathering"},
          ${i}
        )
      `;

      if ((i + 1) % 10 === 0) {
        console.log(`   ✅ Created ${i + 1}/${files.length} records...`);
      }
    }

    console.log(`✅ Created ${files.length} image records\n`);

    // 5. Set cover image for gallery (use first image)
    const coverImageUrl = `/community-photos/${files[0]}`;
    await sql`
      UPDATE "web-eco_gallery"
      SET cover_image_url = ${coverImageUrl}
      WHERE id = ${gallery.id}
    `;
    console.log("✅ Set gallery cover image\n");

    // 6. Verify the records
    const imageCount = await sql`
      SELECT COUNT(*) as count FROM "web-eco_gallery_image"
      WHERE gallery_id = ${gallery.id}
    `;

    console.log("🎉 Gallery setup completed successfully!");
    console.log(`📍 Gallery ID: ${gallery.id}`);
    console.log(`📍 Gallery Slug: ${gallery.slug}`);
    console.log(`📍 Total Images: ${imageCount[0].count}`);
    console.log(`📍 Cover Image: ${coverImageUrl}`);

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Setup failed:", error);
    await sql.end();
    process.exit(1);
  }
}

createGalleryRecords();
