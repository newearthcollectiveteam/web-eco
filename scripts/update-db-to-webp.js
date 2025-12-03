import postgres from 'postgres';
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '../.env') });

// Initialize database client
const sql = postgres(process.env.DATABASE_URL);

async function updateToWebP() {
  try {
    console.log('🔄 Updating database to use WebP images...\n');

    // Get all gallery images
    const images = await sql`
      SELECT id, image_url, storage_path
      FROM "web-eco_gallery_image"
      WHERE gallery_id = 1
    `;

    console.log(`📸 Found ${images.length} images to update\n`);

    let updateCount = 0;
    let errorCount = 0;

    for (const image of images) {
      try {
        // Convert .jpg to .webp in both URL and path
        const newUrl = image.image_url.replace(/\.jpg$/i, '.webp');
        const newPath = image.storage_path.replace(/\.jpg$/i, '.webp');

        await sql`
          UPDATE "web-eco_gallery_image"
          SET
            image_url = ${newUrl},
            storage_path = ${newPath}
          WHERE id = ${image.id}
        `;

        console.log(`✅ Updated: ${image.image_url} → ${newUrl}`);
        updateCount++;
      } catch (error) {
        console.error(`❌ Failed to update ${image.image_url}:`, error.message);
        errorCount++;
      }
    }

    // Update gallery cover image
    const [coverImage] = await sql`
      SELECT image_url
      FROM "web-eco_gallery_image"
      WHERE gallery_id = 1
      ORDER BY display_order ASC
      LIMIT 1
    `;

    if (coverImage) {
      await sql`
        UPDATE "web-eco_gallery"
        SET cover_image_url = ${coverImage.image_url}
        WHERE id = 1
      `;
      console.log(`\n✅ Updated gallery cover image to: ${coverImage.image_url}`);
    }

    console.log(`\n📊 Update Summary:`);
    console.log(`   ✅ Updated: ${updateCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📸 Total: ${images.length}\n`);

    console.log('🎉 Database updated successfully!');
    console.log('📝 All gallery images now point to optimized WebP files\n');

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Update failed:', error);
    await sql.end();
    process.exit(1);
  }
}

updateToWebP();
