-- Fix image paths to use correct public directory structure
UPDATE blog_posts 
SET featured_image = REPLACE(featured_image, '/src/assets/blog/', '/assets/blog/')
WHERE featured_image LIKE '/src/assets/blog/%';