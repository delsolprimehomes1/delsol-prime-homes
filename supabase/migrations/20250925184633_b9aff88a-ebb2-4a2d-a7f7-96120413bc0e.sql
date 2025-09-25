-- Fix topic misalignment by updating the TOFU article's topic to match its linked MOFU article
UPDATE qa_articles 
SET topic = 'Location'
WHERE slug = 'multilingual-ai-assistant-for-buyers' 
AND topic = 'technology';