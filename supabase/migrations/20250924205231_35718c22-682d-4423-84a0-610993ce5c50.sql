-- Fix content categorization errors: Move food/culture/lifestyle articles from Investment to Lifestyle topic

-- Update all articles about food, gastronomy, culture, and lifestyle from Investment to Lifestyle
UPDATE qa_articles 
SET topic = 'Lifestyle', updated_at = now()
WHERE topic = 'Investment' 
AND (
  -- Food and gastronomy related articles
  title ILIKE '%food%' OR
  title ILIKE '%gastro%' OR  
  title ILIKE '%cuisine%' OR
  title ILIKE '%dining%' OR
  title ILIKE '%restaurant%' OR
  title ILIKE '%tapas%' OR
  title ILIKE '%wine%' OR
  title ILIKE '%festival%' OR
  title ILIKE '%MICHELIN%' OR
  title ILIKE '%culinary%' OR
  
  -- Cultural and lifestyle articles  
  title ILIKE '%cultural%' OR
  title ILIKE '%culture%' OR
  title ILIKE '%lifestyle%' OR
  title ILIKE '%expat living%' OR
  title ILIKE '%traditions%' OR
  title ILIKE '%Picasso%' OR
  title ILIKE '%art%' OR
  title ILIKE '%events%' OR
  title ILIKE '%leisure%' OR
  
  -- Content contains lifestyle keywords
  content ILIKE '%food culture%' OR
  content ILIKE '%lifestyle%' OR
  content ILIKE '%cultural experience%' OR
  content ILIKE '%gastronomy%' OR
  content ILIKE '%dining scene%' OR
  
  -- Specific articles we identified
  id IN (
    'd0690a6c-5e29-4b8d-9f05-e1cbac3d8e41', -- Málaga food capital (EN)
    'f40218bc-a02b-4db8-b3be-cc876f98adf9', -- Málaga food capital (DE) 
    '203fa512-68f8-4f2d-93e5-def2ccc8214b', -- Málaga food capital (ES)
    '598a3d9e-ea32-4a4b-b1f0-f1fb7550ccb3', -- Málaga cultural capital (EN)
    '8c9c6e05-cca1-47e9-969d-d3de6cda02f2', -- Málaga cultural capital (DE)
    'c0818887-d502-4e69-bd15-475efdc59f6e'  -- Málaga cultural capital (ES)
  )
);