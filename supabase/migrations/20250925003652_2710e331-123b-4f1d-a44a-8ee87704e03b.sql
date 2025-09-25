-- Phase 1: Fix topic categorization and create proper taxonomy
-- Update school/education articles to correct topic
UPDATE qa_articles 
SET topic = 'Education'
WHERE title ILIKE '%school%' OR title ILIKE '%education%' OR slug ILIKE '%school%';

-- Standardize topic names (fix case inconsistencies)
UPDATE qa_articles SET topic = 'Legal & Process' WHERE topic IN ('legal', 'Legal & Process Timeline');
UPDATE qa_articles SET topic = 'Finance' WHERE topic IN ('finance', 'Investment & Financing');
UPDATE qa_articles SET topic = 'Investment' WHERE topic = 'Investment & Financing';
UPDATE qa_articles SET topic = 'Services' WHERE topic IN ('service', 'Service');
UPDATE qa_articles SET topic = 'Lifestyle' WHERE topic = 'lifestyle';

-- Add nextStep support to frontmatter structure
-- The markdown_frontmatter field already exists as jsonb, so we'll use it to store nextStep data