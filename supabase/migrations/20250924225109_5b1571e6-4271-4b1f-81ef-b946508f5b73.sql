-- Create sample clusters for proper 3-2-1 flow
INSERT INTO qa_clusters (id, title, description, topic, language, sort_order) VALUES
(gen_random_uuid(), 'Investment & Financing Guide', 'Complete guide to property investment and financing on Costa del Sol', 'Investment & Financing', 'en', 1),
(gen_random_uuid(), 'Lifestyle & Location Guide', 'Everything about lifestyle and choosing the right location', 'Lifestyle', 'en', 2),
(gen_random_uuid(), 'Legal & Process Guide', 'Step-by-step legal process and timeline guidance', 'Legal & Process Timeline', 'en', 3);

-- Enable booking for all BOFU articles
UPDATE qa_articles 
SET appointment_booking_enabled = true 
WHERE funnel_stage = 'BOFU' AND language = 'en';

-- Create sample 3-2-1 linking structure for Investment & Financing topic
-- First, get some specific IDs for linking (we'll need to run this in steps)
DO $$
DECLARE
    tofu_id_1 uuid;
    mofu_id_1 uuid;
    bofu_id_1 uuid;
    tofu_id_2 uuid;
    mofu_id_2 uuid;
    tofu_id_3 uuid;
    cluster_id_investment uuid;
    cluster_id_lifestyle uuid;
    cluster_id_legal uuid;
BEGIN
    -- Get cluster IDs
    SELECT id INTO cluster_id_investment FROM qa_clusters WHERE topic = 'Investment & Financing' AND language = 'en' LIMIT 1;
    SELECT id INTO cluster_id_lifestyle FROM qa_clusters WHERE topic = 'Lifestyle' AND language = 'en' LIMIT 1;
    SELECT id INTO cluster_id_legal FROM qa_clusters WHERE topic = 'Legal & Process Timeline' AND language = 'en' LIMIT 1;
    
    -- Get some article IDs for Investment & Financing flow
    SELECT id INTO tofu_id_1 FROM qa_articles WHERE funnel_stage = 'TOFU' AND topic = 'Investment & Financing' AND language = 'en' LIMIT 1;
    SELECT id INTO tofu_id_2 FROM qa_articles WHERE funnel_stage = 'TOFU' AND topic = 'Investment & Financing' AND language = 'en' OFFSET 1 LIMIT 1;
    SELECT id INTO tofu_id_3 FROM qa_articles WHERE funnel_stage = 'TOFU' AND topic = 'Investment & Financing' AND language = 'en' OFFSET 2 LIMIT 1;
    
    SELECT id INTO mofu_id_1 FROM qa_articles WHERE funnel_stage = 'MOFU' AND topic = 'Investment & Financing' AND language = 'en' LIMIT 1;
    SELECT id INTO mofu_id_2 FROM qa_articles WHERE funnel_stage = 'MOFU' AND topic = 'Investment & Financing' AND language = 'en' OFFSET 1 LIMIT 1;
    
    SELECT id INTO bofu_id_1 FROM qa_articles WHERE funnel_stage = 'BOFU' AND topic = 'Investment & Financing' AND language = 'en' LIMIT 1;
    
    -- Update Investment & Financing cluster articles
    IF tofu_id_1 IS NOT NULL AND mofu_id_1 IS NOT NULL THEN
        UPDATE qa_articles SET 
            cluster_id = cluster_id_investment,
            cluster_position = 1,
            points_to_mofu_id = mofu_id_1,
            h1_title = 'Getting Started with Property Investment',
            h2_title = 'Investment Basics',
            h3_title = 'First Steps'
        WHERE id = tofu_id_1;
    END IF;
    
    IF tofu_id_2 IS NOT NULL AND mofu_id_1 IS NOT NULL THEN
        UPDATE qa_articles SET 
            cluster_id = cluster_id_investment,
            cluster_position = 2,
            points_to_mofu_id = mofu_id_1,
            h1_title = 'Understanding Investment Options',
            h2_title = 'Investment Types',
            h3_title = 'Options Available'
        WHERE id = tofu_id_2;
    END IF;
    
    IF tofu_id_3 IS NOT NULL AND mofu_id_2 IS NOT NULL THEN
        UPDATE qa_articles SET 
            cluster_id = cluster_id_investment,
            cluster_position = 3,
            points_to_mofu_id = mofu_id_2,
            h1_title = 'Market Opportunities',
            h2_title = 'Market Analysis',
            h3_title = 'Current Opportunities'
        WHERE id = tofu_id_3;
    END IF;
    
    IF mofu_id_1 IS NOT NULL AND bofu_id_1 IS NOT NULL THEN
        UPDATE qa_articles SET 
            cluster_id = cluster_id_investment,
            cluster_position = 4,
            points_to_bofu_id = bofu_id_1,
            h1_title = 'Investment Strategy Planning',
            h2_title = 'Strategic Planning',
            h3_title = 'Your Investment Plan'
        WHERE id = mofu_id_1;
    END IF;
    
    IF mofu_id_2 IS NOT NULL AND bofu_id_1 IS NOT NULL THEN
        UPDATE qa_articles SET 
            cluster_id = cluster_id_investment,
            cluster_position = 5,
            points_to_bofu_id = bofu_id_1,
            h1_title = 'Financing Your Investment',
            h2_title = 'Financing Options',
            h3_title = 'Getting Financed'
        WHERE id = mofu_id_2;
    END IF;
    
    IF bofu_id_1 IS NOT NULL THEN
        UPDATE qa_articles SET 
            cluster_id = cluster_id_investment,
            cluster_position = 6,
            h1_title = 'Securing Your Investment',
            h2_title = 'Final Steps',
            h3_title = 'Complete Your Purchase'
        WHERE id = bofu_id_1;
    END IF;
END $$;