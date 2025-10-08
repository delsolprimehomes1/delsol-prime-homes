-- Move pg_net extension to extensions schema (if exists in public)
-- First, check if extensions schema exists, create if not
CREATE SCHEMA IF NOT EXISTS extensions;

-- Drop from public if it exists there
DROP EXTENSION IF EXISTS pg_net CASCADE;

-- Create in extensions schema
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;