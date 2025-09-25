-- Fix topic misalignment for AI property alert articles
UPDATE qa_articles 
SET topic = 'Location'
WHERE title IN (
  'How can AI tools keep buyers updated on new properties matching their criteria?',
  'How can AI tools keep buyers updated on new properties matching their criteria? - Guía en Español'
) 
AND topic = 'AI';