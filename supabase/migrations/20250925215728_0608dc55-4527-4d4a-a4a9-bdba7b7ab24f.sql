-- Clean up AI citation artifacts from all affected articles
UPDATE qa_articles 
SET content = regexp_replace(content, ':contentReference\[oaicite:\d+\]\{index=\d+\}', '', 'g')
WHERE content ~ ':contentReference\[oaicite:\d+\]\{index=\d+\}';

-- Fix malformed markdown formatting in content
UPDATE qa_articles
SET content = regexp_replace(content, '^([^*]+)\*\*:', '**\1**:', 'gm')
WHERE content ~ '^[^*]+\*\*:';

-- Update the updated_at timestamp for affected articles
UPDATE qa_articles 
SET updated_at = now()
WHERE content ~ ':contentReference\[oaicite:\d+\]\{index=\d+\}' 
   OR content ~ '^[^*]+\*\*:';