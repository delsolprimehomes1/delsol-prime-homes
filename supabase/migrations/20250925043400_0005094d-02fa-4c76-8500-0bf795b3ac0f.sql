-- Fix Investment topic funnel linking
-- Link Investment TOFU articles to Investment MOFU
UPDATE qa_articles 
SET points_to_mofu_id = 'be654695-cf03-47c8-9ba5-91f771b90f4a'
WHERE id IN (
  '0f34d349-0333-4cef-a7c2-f44009e1afbb', -- property investment yields
  '839da4d9-bc68-42bc-b164-7959fa26bfaf'  -- best investment property types
);

-- Link Investment MOFU articles to Investment BOFU
UPDATE qa_articles 
SET points_to_bofu_id = '6e00f38d-6bdb-4073-b0ed-faa77060fb43'
WHERE id IN (
  'be654695-cf03-47c8-9ba5-91f771b90f4a', -- investment property comparison (new)
  'ed2d5c73-4ded-4515-b717-16f33aa4ed0d'  -- shopping centres (existing)
);

-- Fix contracts topic funnel linking
-- Link contracts TOFU articles to contracts MOFU
UPDATE qa_articles 
SET points_to_mofu_id = 'b53cabe9-8fd4-409a-b3e1-7520bdd44097'
WHERE id IN (
  '8a02b3c0-ea16-4a5a-b6af-be82e05a7ae5', -- private purchase contracts
  '0135ddb6-dd9a-4ec7-bfcd-86d0e4d669fd', -- notary completion
  '546aab70-8fdd-4f27-8776-5d2ecf017906'  -- reservation contracts
);

-- Link contracts MOFU to contracts BOFU
UPDATE qa_articles 
SET points_to_bofu_id = '4dbc94fb-9bf9-4247-9433-50435f2843f0'
WHERE id = 'b53cabe9-8fd4-409a-b3e1-7520bdd44097'; -- contracts process guide

-- Fix Education topic funnel linking
-- Link Education TOFU to new Education MOFU
UPDATE qa_articles 
SET points_to_mofu_id = '8473d043-0784-4265-9ad3-75e368e9f235'
WHERE id = 'cb6e3353-54ca-4469-ab96-fabcb500f65a'; -- international schools available

-- Link new Education MOFU to Education BOFU
UPDATE qa_articles 
SET points_to_bofu_id = '90744d01-d047-43a1-be69-7e30bfef8750'
WHERE id = '8473d043-0784-4265-9ad3-75e368e9f235'; -- evaluate international schools

-- Fix Infrastructure topic funnel linking  
-- Link Infrastructure TOFU articles to Infrastructure MOFU
UPDATE qa_articles 
SET points_to_mofu_id = 'b91d6e57-a718-4796-b816-e36ee9a1d1ea'
WHERE id IN (
  'cfa45846-af22-4fcf-8af8-042554788854', -- fiber internet setup
  '2d32dc90-4f35-4625-9c2b-8e8bb25d28d8'  -- 5G coverage
);

-- Link Infrastructure MOFU to Infrastructure BOFU
UPDATE qa_articles 
SET points_to_bofu_id = '599b546c-b939-43d8-89fc-cbe05884b49b'
WHERE id = 'b91d6e57-a718-4796-b816-e36ee9a1d1ea'; -- infrastructure development impact