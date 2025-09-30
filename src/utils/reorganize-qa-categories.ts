import { supabase } from '@/integrations/supabase/client';

/**
 * Reorganize QA article categories to fix duplicates and misclassifications
 * 
 * Changes:
 * 1. Merge "contracts" → "Legal & Process"
 * 2. Merge "Property Types & Features" → "Property Types"
 * 3. Merge "Location Intelligence" → "Location"
 * 4. Move food/wine/culture from "General" → "Lifestyle"
 * 5. Move transport/infrastructure articles to correct category
 */

export async function reorganizeQACategories() {
  const updates = [
    // 1. Merge "contracts" → "Legal & Process" (5 articles)
    {
      ids: [
        '4dbc94fb-9bf9-4247-9433-50435f2843f0',
        'b53cabe9-8fd4-409a-b3e1-7520bdd44097',
        '0135ddb6-dd9a-4ec7-bfcd-86d0e4d669fd',
        '546aab70-8fdd-4f27-8776-5d2ecf017906',
        '8a02b3c0-ea16-4a5a-b6af-be82e05a7ae5'
      ],
      newTopic: 'Legal & Process',
      reason: 'Merge lowercase "contracts" into "Legal & Process"'
    },
    
    // 2. Merge "Property Types & Features" → "Property Types" (6 articles)
    {
      ids: [
        'ca6e43d7-2610-4848-9c3b-3d6101687e48',
        '761e3b5e-6d35-4f48-b05d-6ed026d45c46',
        'c16f4f65-d01e-497e-adb5-44fbb697e89e',
        'a36fe0aa-3a16-4e0a-9dad-3d8832041372',
        '836bcb99-af59-4e50-82b5-13d17741319e',
        '2b56c7f1-92d6-4730-8112-f98432a18a9c'
      ],
      newTopic: 'Property Types',
      reason: 'Merge duplicate "Property Types & Features" into "Property Types"'
    },
    
    // 3. Merge "Location Intelligence" → "Location" (6 articles)
    {
      ids: [
        '8223f386-20c9-4ead-a87c-7dec3a21d456',
        'bb27ac32-8c6e-4360-9fc1-f1cadc38d4fb',
        'cb47cc38-18e7-4330-a14b-598af28c5fb4',
        '551b4dfe-24ce-4b96-b72a-cf7402184127',
        'd073ecaa-3771-4e27-9b63-d5c33218570c',
        'b1fa34ba-d395-487f-a050-d8a19266f607'
      ],
      newTopic: 'Location',
      reason: 'Merge duplicate "Location Intelligence" into "Location"'
    },
    
    // 4. Move food/wine/culture from "General" → "Lifestyle" (12 articles)
    {
      ids: [
        '94a7e2ff-e9c4-461e-bdf6-6345f090ba18', // cuisine differ
        '1f915e6f-5eba-4d0a-9995-b23afc64f145', // gastro map
        '0f432ab3-a1b8-4c66-88fa-811c84e0ef8b', // shopping destinations
        '4af89dc9-5faf-41c5-94d4-b38ee84e6dc1', // wine denominations
        '7d325702-25d7-4b54-8113-d17a14c9afe5', // Picasso Museum
        'a1bb509b-c1ab-4607-8553-06315f9f8a6c', // MICHELIN restaurants
        'f22c37a6-068e-41bf-b6ed-d113ea5725f2', // museums
        '5431ef8f-3c71-4486-8c4b-c435eb63b011', // cultural-food events
        '54fe439b-d603-4ae5-b61c-4a5cf6b2dc7a', // Estepona food
        '84c8c5d8-d688-4762-bfbb-462e58926135', // Fuengirola food
        '10780280-f990-4a6c-9874-369a9e5ea158', // Montes de Málaga
        '32569bdc-87c3-4698-9fab-f10f35ac2819', // Feria de Málaga
        '3cdac272-2473-47c3-bf57-71ec813f92de'  // olive oil agrotourism
      ],
      newTopic: 'Lifestyle',
      reason: 'Move food/wine/culture articles from "General" to "Lifestyle"'
    },
    
    // 5. Move food/wine from "Property Types" → "Lifestyle" (6 articles)
    {
      ids: [
        'aa34b292-dbe3-435c-bbc9-a8d81b713b57', // food wine lifestyle checklist
        'c3bfe0a6-9a35-48ee-aecf-42396d5fb9e5', // wine food routes
        '86a9bd58-ec5a-47cf-aaec-cff024fd3103', // Casares food
        '8b60b72c-90e0-4a0c-b615-b5e4c415bd9f', // Ronda Axarquía food
        'ee31f4fa-f875-4193-91ab-8b0dc6086697', // Axarquía food wine
        '91852da9-3b9a-40a2-9f90-3172fe18f917'  // gastro-buying checklist
      ],
      newTopic: 'Lifestyle',
      reason: 'Move food/wine articles from "Property Types" to "Lifestyle"'
    },
    
    // 6. Move airport/transport to "Infrastructure" (2 articles)
    {
      ids: [
        '6f33370a-6cb4-4a5a-850a-00f6d734d9f4', // Málaga Airport routes (from General)
        '34b57bd8-e3e8-4bee-b09d-47df1836846c'  // transport from airport (from Finance)
      ],
      newTopic: 'Infrastructure',
      reason: 'Move transport/airport articles to "Infrastructure"'
    },
    
    // 7. Move network/internet from "Property Types" → "Infrastructure" (1 article)
    {
      ids: [
        'b5c34bbe-1088-4228-b71c-d5bab6ba53a1'  // home network setup
      ],
      newTopic: 'Infrastructure',
      reason: 'Move network/internet article from "Property Types" to "Infrastructure"'
    }
  ];

  const results = {
    success: [] as string[],
    failed: [] as { id: string; error: string }[]
  };

  for (const batch of updates) {
    console.log(`\nProcessing: ${batch.reason}`);
    
    for (const id of batch.ids) {
      try {
        const { error } = await supabase
          .from('qa_articles')
          .update({ topic: batch.newTopic })
          .eq('id', id);

        if (error) {
          results.failed.push({ id, error: error.message });
          console.error(`❌ Failed to update ${id}: ${error.message}`);
        } else {
          results.success.push(id);
          console.log(`✅ Updated ${id} to "${batch.newTopic}"`);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        results.failed.push({ id, error: errorMsg });
        console.error(`❌ Exception updating ${id}: ${errorMsg}`);
      }
    }
  }

  console.log('\n=== Migration Summary ===');
  console.log(`✅ Successfully updated: ${results.success.length} articles`);
  console.log(`❌ Failed updates: ${results.failed.length} articles`);
  
  if (results.failed.length > 0) {
    console.log('\nFailed articles:');
    results.failed.forEach(({ id, error }) => {
      console.log(`  - ${id}: ${error}`);
    });
  }

  return results;
}

/**
 * Verify the reorganization results
 */
export async function verifyReorganization() {
  const { data, error } = await supabase
    .from('qa_articles')
    .select('topic')
    .eq('language', 'en');

  if (error) {
    console.error('Error fetching verification data:', error);
    return;
  }

  const topicCounts = data.reduce((acc, article) => {
    acc[article.topic] = (acc[article.topic] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n=== Final Topic Distribution ===');
  Object.entries(topicCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([topic, count]) => {
      console.log(`${topic}: ${count} articles`);
    });

  // Check for issues
  const issues = [];
  if (topicCounts['contracts']) {
    issues.push(`⚠️  Still has "contracts" category (${topicCounts['contracts']} articles)`);
  }
  if (topicCounts['Property Types & Features']) {
    issues.push(`⚠️  Still has "Property Types & Features" category (${topicCounts['Property Types & Features']} articles)`);
  }
  if (topicCounts['Location Intelligence']) {
    issues.push(`⚠️  Still has "Location Intelligence" category (${topicCounts['Location Intelligence']} articles)`);
  }

  if (issues.length > 0) {
    console.log('\n=== Issues Found ===');
    issues.forEach(issue => console.log(issue));
  } else {
    console.log('\n✅ All duplicate categories have been merged!');
  }

  return topicCounts;
}
