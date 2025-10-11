-- Change ai_optimization_score to support decimal values
ALTER TABLE qa_articles 
ALTER COLUMN ai_optimization_score TYPE NUMERIC(4,1);

-- Add helpful comment
COMMENT ON COLUMN qa_articles.ai_optimization_score IS 'AI optimization score from 0.0 to 11.0 (displayed as 0-100 scale in UI)';