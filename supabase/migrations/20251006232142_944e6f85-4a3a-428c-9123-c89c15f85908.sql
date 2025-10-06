-- Clean markdown syntax from Dutch QA article titles
-- This removes ## headers and **bold** markers to display clean text

UPDATE qa_articles
SET title = regexp_replace(
  regexp_replace(title, '^#{1,6}\s+', '', 'g'),
  '\*\*(.*?)\*\*', '\1', 'g'
)
WHERE language = 'nl' 
AND (title LIKE '##%' OR title LIKE '%**%');