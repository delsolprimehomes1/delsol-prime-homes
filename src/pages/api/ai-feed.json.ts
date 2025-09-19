// API endpoint for AI feed export - /api/ai-feed.json

import { generateAIFeed } from '@/utils/ai-feed-generator';

export default async function handler() {
  try {
    const aiFeed = await generateAIFeed();
    
    return new Response(JSON.stringify(aiFeed, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600, s-maxage=7200', // 1 hour browser, 2 hour CDN
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'X-AI-Feed-Version': '1.0',
        'X-Content-Source': 'DelSolPrimeHomes-QA-Database'
      },
      status: 200
    });
  } catch (error) {
    console.error('AI Feed generation failed:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to generate AI feed',
      message: error instanceof Error ? error.message : 'Unknown error',
      generated_at: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
      status: 500
    });
  }
}