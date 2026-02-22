import { config } from "dotenv";
import postgres from "postgres";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, "../.env") });

const sql = postgres(process.env.DATABASE_URL);

async function deleteImage() {
  try {
    console.log("🗑️  Deleting IMG_6144.jpg from database...");

    const result = await sql`
      DELETE FROM "web-eco_gallery_image"
      WHERE image_url LIKE '%IMG_6144.jpg%'
      RETURNING id, image_url
    `;

    if (result.length > 0) {
      console.log("✅ Deleted image record:");
      console.log(`   ID: ${result[0].id}`);
      console.log(`   URL: ${result[0].image_url}`);
    } else {
      console.log("⚠️  No matching image found in database");
    }

    // Get updated count
    const [count] = await sql`
      SELECT COUNT(*) as total FROM "web-eco_gallery_image"
      WHERE gallery_id = 1
    `;

    console.log(`\n📊 Gallery now has ${count.total} images`);

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await sql.end();
    process.exit(1);
  }
}

deleteImage();
