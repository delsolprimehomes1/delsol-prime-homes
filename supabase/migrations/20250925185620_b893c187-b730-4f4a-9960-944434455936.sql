-- Fix topic misalignment for the fiber internet TOFU article
UPDATE qa_articles 
SET topic = 'Location'
WHERE title = 'How quickly can you set up fiber internet after moving into a new-build on the Costa del Sol?' 
AND topic = 'Infrastructure';