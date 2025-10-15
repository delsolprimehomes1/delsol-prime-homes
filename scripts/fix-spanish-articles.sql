-- Fix Spanish Articles with French Titles
-- This script corrects the language labels for articles that have Spanish language code
-- but contain French content (titles starting with French words)

-- Step 1: Preview affected articles
SELECT 
    id, 
    slug, 
    title, 
    language,
    CASE 
        WHEN title LIKE '%Quoi%' OR title LIKE '%Comment%' OR title LIKE '%Pourquoi%' 
             OR title LIKE '%Quel%' OR title LIKE '%Quelle%' OR title LIKE '%Où%' 
             OR title LIKE 'Comment %' OR title LIKE 'Pourquoi %' OR title LIKE 'Quoi %'
        THEN 'French' 
        ELSE 'Unknown'
    END as detected_language
FROM qa_articles 
WHERE language = 'es' 
AND (
    title LIKE '%Quoi%' 
    OR title LIKE '%Comment%' 
    OR title LIKE '%Pourquoi%'
    OR title LIKE '%Quel%'
    OR title LIKE '%Quelle%'
    OR title LIKE '%Où%'
    OR title LIKE 'Comment %'
    OR title LIKE 'Pourquoi %'
    OR title LIKE 'Quoi %'
)
ORDER BY title;

-- Step 2: Update language labels from 'es' to 'fr' for French content
-- Run this after reviewing the preview above
UPDATE qa_articles 
SET language = 'fr'
WHERE language = 'es' 
AND (
    title LIKE '%Quoi%' 
    OR title LIKE '%Comment%' 
    OR title LIKE '%Pourquoi%'
    OR title LIKE '%Quel%'
    OR title LIKE '%Quelle%'
    OR title LIKE '%Où%'
    OR title LIKE 'Comment %'
    OR title LIKE 'Pourquoi %'
    OR title LIKE 'Quoi %'
);

-- Step 3: Verify the update
SELECT 
    COUNT(*) as french_articles,
    language
FROM qa_articles
WHERE language = 'fr'
GROUP BY language;

-- Step 4: Check for remaining Spanish articles (should be true Spanish content)
SELECT 
    id,
    slug,
    title,
    language
FROM qa_articles
WHERE language = 'es'
ORDER BY title
LIMIT 20;

-- Summary statistics
SELECT 
    language,
    COUNT(*) as article_count,
    array_agg(DISTINCT LEFT(title, 30)) as sample_titles
FROM qa_articles
WHERE language IN ('es', 'fr')
GROUP BY language
ORDER BY language;
