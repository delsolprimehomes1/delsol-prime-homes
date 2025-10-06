import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, storagePath, metadata } = await req.json();

    if (!imageUrl || !storagePath || !metadata) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: imageUrl, storagePath, metadata' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Embedding metadata for image:', storagePath);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate AI citability score based on metadata completeness
    let citabilityScore = 0;
    if (metadata.altText) citabilityScore += 25;
    if (metadata.description) citabilityScore += 25;
    if (metadata.keywords && metadata.keywords.length >= 3) citabilityScore += 20;
    if (metadata.geoCoordinates?.latitude && metadata.geoCoordinates?.longitude) citabilityScore += 15;
    if (metadata.titleAttr) citabilityScore += 15;

    // Determine visual accessibility readiness
    const visualAccessibilityReady = !!(
      metadata.altText &&
      metadata.description &&
      metadata.altText.length >= 50 &&
      metadata.description.length >= 100
    );

    // Generate context relevance summary
    const contextRelevance = metadata.description
      ? `Visual content for ${metadata.titleAttr || 'article'}: ${metadata.description.substring(0, 200)}`
      : null;

    // Generate canonical URL from storage path
    const bucketName = storagePath.split('/')[0];
    const filePath = storagePath.split('/').slice(1).join('/');
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    const canonicalImageUrl = urlData.publicUrl;

    // Update image_metadata table with enhanced metadata
    const { error: updateError } = await supabase
      .from('image_metadata')
      .update({
        alt_text: { en: metadata.altText },
        title: metadata.titleAttr,
        description: metadata.description,
        ai_citability_score: citabilityScore,
        visual_accessibility_ready: visualAccessibilityReady,
        context_relevance: contextRelevance,
        embedded_exif_status: 'embedded',
        canonical_image_url: canonicalImageUrl,
        seo_optimized: citabilityScore >= 80,
        exif_latitude: metadata.geoCoordinates?.latitude,
        exif_longitude: metadata.geoCoordinates?.longitude,
        exif_location_name: metadata.geoCoordinates?.locationName,
      })
      .eq('storage_path', storagePath);

    if (updateError) {
      console.error('Failed to update metadata:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update metadata', details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Metadata embedded successfully:', {
      storagePath,
      citabilityScore,
      visualAccessibilityReady,
      seoOptimized: citabilityScore >= 80
    });

    return new Response(
      JSON.stringify({
        success: true,
        metadata: {
          ai_citability_score: citabilityScore,
          visual_accessibility_ready: visualAccessibilityReady,
          seo_optimized: citabilityScore >= 80,
          canonical_image_url: canonicalImageUrl,
          embedded_exif_status: 'embedded'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error embedding metadata:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to embed metadata', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
