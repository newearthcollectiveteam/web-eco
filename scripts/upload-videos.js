import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '../.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BUCKET_NAME = 'Assetts';
const STORAGE_PREFIX = 'videos/testimonials';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const MIME_TYPES = {
  '.mp4': 'video/mp4',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

async function uploadVideos() {
  try {
    const sourceDir = join(__dirname, '../tmp/testimonials');
    const files = readdirSync(sourceDir).filter(
      (f) => f.endsWith('.mp4') || f.endsWith('.jpg')
    );

    console.log(`Found ${files.length} files to upload\n`);

    let successCount = 0;
    let skipCount = 0;

    for (const filename of files) {
      const filepath = join(sourceDir, filename);
      const storagePath = `${STORAGE_PREFIX}/${filename}`;
      const ext = extname(filename);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      // Check if already uploaded
      const { data: existing } = await supabase.storage
        .from(BUCKET_NAME)
        .list(STORAGE_PREFIX, { search: filename });

      if (existing && existing.some((f) => f.name === filename)) {
        console.log(`Skip (exists): ${filename}`);
        skipCount++;
        continue;
      }

      const fileBuffer = readFileSync(filepath);
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, fileBuffer, { contentType, upsert: false });

      if (error) {
        console.error(`FAIL: ${filename} — ${error.message}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath);

      console.log(`OK: ${filename} → ${urlData.publicUrl}`);
      successCount++;
    }

    console.log(`\nDone: ${successCount} uploaded, ${skipCount} skipped`);
    process.exit(0);
  } catch (error) {
    console.error('Upload failed:', error);
    process.exit(1);
  }
}

uploadVideos();
