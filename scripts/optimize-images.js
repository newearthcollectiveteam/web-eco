import sharp from 'sharp';
import { readdirSync, statSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PHOTOS_DIR = join(__dirname, '../public/community-photos');
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 800;
const WEBP_QUALITY = 85;

async function optimizeImages() {
  try {
    console.log('🖼️  Starting image optimization...\n');

    // Get all JPG files with their sizes
    const files = readdirSync(PHOTOS_DIR)
      .filter(f => f.toLowerCase().endsWith('.jpg'))
      .map(filename => ({
        filename,
        path: join(PHOTOS_DIR, filename),
        size: statSync(join(PHOTOS_DIR, filename)).size,
      }))
      .sort((a, b) => b.size - a.size); // Sort by size descending

    console.log(`📸 Found ${files.length} JPG images\n`);

    // Show top 10 largest
    console.log('📊 Top 10 largest images:');
    files.slice(0, 10).forEach((file, i) => {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      console.log(`   ${i + 1}. ${file.filename} - ${sizeMB}MB`);
    });
    console.log('');

    // Optimize all images
    let successCount = 0;
    let errorCount = 0;
    const sizeBefore = files.reduce((acc, f) => acc + f.size, 0);
    let sizeAfter = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const outputPath = file.path.replace(/\.jpg$/i, '.webp');

      try {
        const sizeMB = (file.size / 1024 / 1024).toFixed(2);
        console.log(`🔄 [${i + 1}/${files.length}] Optimizing ${file.filename} (${sizeMB}MB)...`);

        const info = await sharp(file.path)
          .resize(MAX_WIDTH, MAX_HEIGHT, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: WEBP_QUALITY })
          .toFile(outputPath);

        const newSizeMB = (info.size / 1024 / 1024).toFixed(2);
        const savings = (((file.size - info.size) / file.size) * 100).toFixed(1);

        console.log(`   ✅ Saved as ${basename(outputPath)} (${newSizeMB}MB, ${savings}% smaller)\n`);

        sizeAfter += info.size;
        successCount++;
      } catch (error) {
        console.error(`   ❌ Failed: ${error.message}\n`);
        errorCount++;
      }
    }

    const totalSavings = (((sizeBefore - sizeAfter) / sizeBefore) * 100).toFixed(1);
    const beforeMB = (sizeBefore / 1024 / 1024).toFixed(2);
    const afterMB = (sizeAfter / 1024 / 1024).toFixed(2);

    console.log('\n📊 Optimization Summary:');
    console.log(`   ✅ Optimized: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📦 Size before: ${beforeMB}MB`);
    console.log(`   📦 Size after: ${afterMB}MB`);
    console.log(`   💾 Total savings: ${totalSavings}%\n`);

    console.log('🎉 Image optimization complete!');
    console.log('📝 Next steps:');
    console.log('   1. Review optimized .webp files in public/community-photos/');
    console.log('   2. Run: node scripts/upload-gallery-photos-webp.js');
    console.log('   3. Update database to use new WebP URLs\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Optimization failed:', error);
    process.exit(1);
  }
}

optimizeImages();
