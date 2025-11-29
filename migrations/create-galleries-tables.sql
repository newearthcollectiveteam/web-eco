-- Create galleries table
CREATE TABLE IF NOT EXISTS "web-eco_gallery" (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(255) NOT NULL UNIQUE,
  is_published BOOLEAN DEFAULT true NOT NULL,
  cover_image_url TEXT,
  display_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create gallery_images table
CREATE TABLE IF NOT EXISTS "web-eco_gallery_image" (
  id SERIAL PRIMARY KEY,
  gallery_id INTEGER NOT NULL REFERENCES "web-eco_gallery"(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  alt_text VARCHAR(255),
  display_order INTEGER DEFAULT 0 NOT NULL,
  width INTEGER,
  height INTEGER,
  storage_path VARCHAR(500) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create index for faster gallery lookups
CREATE INDEX IF NOT EXISTS idx_gallery_images_gallery_id ON "web-eco_gallery_image"(gallery_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_display_order ON "web-eco_gallery_image"(display_order);
CREATE INDEX IF NOT EXISTS idx_gallery_slug ON "web-eco_gallery"(slug);
