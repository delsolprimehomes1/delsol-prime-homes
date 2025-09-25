-- Safe duplicate cleanup migration with proper reference handling

-- Enable pg_trgm extension for similarity matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Step 1: Update references from duplicates to their kept versions for exact duplicates
WITH duplicates AS (
  SELECT 
    id,
    title,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(TRIM(regexp_replace(title, '[^\w\s]', '', 'g')))
      ORDER BY created_at ASC, length(content) DESC
    ) as rn
  FROM qa_articles
),
duplicate_mapping AS (
  SELECT 
    d1.id as delete_id,
    d2.id as keep_id
  FROM duplicates d1
  JOIN duplicates d2 ON d1.title = d2.title AND d2.rn = 1
  WHERE d1.rn > 1
)
-- Update MOFU references
UPDATE qa_articles 
SET points_to_mofu_id = dm.keep_id, updated_at = now()
FROM duplicate_mapping dm
WHERE points_to_mofu_id = dm.delete_id;

-- Update BOFU references  
WITH duplicates AS (
  SELECT 
    id,
    title,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(TRIM(regexp_replace(title, '[^\w\s]', '', 'g')))
      ORDER BY created_at ASC, length(content) DESC
    ) as rn
  FROM qa_articles
),
duplicate_mapping AS (
  SELECT 
    d1.id as delete_id,
    d2.id as keep_id
  FROM duplicates d1
  JOIN duplicates d2 ON d1.title = d2.title AND d2.rn = 1
  WHERE d1.rn > 1
)
UPDATE qa_articles 
SET points_to_bofu_id = dm.keep_id, updated_at = now()
FROM duplicate_mapping dm
WHERE points_to_bofu_id = dm.delete_id;

-- Update parent references
WITH duplicates AS (
  SELECT 
    id,
    title,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(TRIM(regexp_replace(title, '[^\w\s]', '', 'g')))
      ORDER BY created_at ASC, length(content) DESC
    ) as rn
  FROM qa_articles
),
duplicate_mapping AS (
  SELECT 
    d1.id as delete_id,
    d2.id as keep_id
  FROM duplicates d1
  JOIN duplicates d2 ON d1.title = d2.title AND d2.rn = 1
  WHERE d1.rn > 1
)
UPDATE qa_articles 
SET parent_id = dm.keep_id, updated_at = now()
FROM duplicate_mapping dm
WHERE parent_id = dm.delete_id;

-- Step 2: Now safely delete exact duplicates
WITH duplicates AS (
  SELECT 
    id,
    title,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(TRIM(regexp_replace(title, '[^\w\s]', '', 'g')))
      ORDER BY created_at ASC, length(content) DESC
    ) as rn
  FROM qa_articles
)
DELETE FROM qa_articles 
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

-- Add a unique constraint to prevent exact title duplicates in the future
CREATE UNIQUE INDEX IF NOT EXISTS idx_qa_articles_normalized_title_unique
ON qa_articles (
  LOWER(TRIM(regexp_replace(title, '[^\w\s]', '', 'g'))),
  language
);

-- Add a function to check for potential duplicates before insert
CREATE OR REPLACE FUNCTION check_duplicate_title()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if a very similar title already exists
  IF EXISTS (
    SELECT 1 FROM qa_articles 
    WHERE id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND language = NEW.language
    AND similarity(
      LOWER(TRIM(regexp_replace(title, '[^\w\s]', '', 'g'))),
      LOWER(TRIM(regexp_replace(NEW.title, '[^\w\s]', '', 'g')))
    ) > 0.9
  ) THEN
    RAISE WARNING 'Potential duplicate title detected: %', NEW.title;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to warn about potential duplicates
DROP TRIGGER IF EXISTS check_duplicate_title_trigger ON qa_articles;
CREATE TRIGGER check_duplicate_title_trigger
  BEFORE INSERT OR UPDATE ON qa_articles
  FOR EACH ROW EXECUTE FUNCTION check_duplicate_title();