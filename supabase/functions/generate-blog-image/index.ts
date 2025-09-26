import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    console.log('Starting blog image generation...');
    
    const { blogTitle, blogContent, customPrompt } = await req.json();
    
    const falApiKey = Deno.env.get('FAL_AI_API_KEY');
    if (!falApiKey) {
      throw new Error('FAL_AI_API_KEY not configured');
    }

    // Generate prompt based on blog content or use custom prompt
    const imagePrompt = customPrompt || generatePromptFromContent(blogTitle, blogContent);
    
    console.log('Generated image prompt:', imagePrompt);

    // Call FAL.ai NanoBanana API
    const imageResponse = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: imagePrompt,
        image_size: "landscape_16_9",
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true
      }),
    });

    if (!imageResponse.ok) {
      throw new Error(`FAL.ai API error: ${imageResponse.status} ${imageResponse.statusText}`);
    }

    const imageData = await imageResponse.json();
    console.log('FAL.ai response:', imageData);

    if (!imageData.images || imageData.images.length === 0) {
      throw new Error('No images returned from FAL.ai');
    }

    const imageUrl = imageData.images[0].url;
    
    // Download the image
    const imageBlob = await fetch(imageUrl).then(r => r.blob());
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate filename
    const timestamp = Date.now();
    const filename = `blog-${timestamp}.jpg`;
    const filePath = `blog-images/${filename}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, imageBlob, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath);

    console.log('Image uploaded successfully:', publicUrl);

    return new Response(JSON.stringify({ 
      success: true,
      imageUrl: publicUrl,
      prompt: imagePrompt
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating blog image:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generatePromptFromContent(title: string, content: string): string {
  // Extract key themes and generate appropriate image prompt
  const lowerTitle = title.toLowerCase();
  const lowerContent = content.toLowerCase();
  
  let basePrompt = "Professional, modern blog hero image";
  
  // Real estate related prompts
  if (lowerTitle.includes('fsbo') || lowerContent.includes('for sale by owner')) {
    basePrompt = "Modern real estate infographic showing FSBO vs realtor comparison, professional charts and statistics";
  } else if (lowerTitle.includes('realtor') || lowerTitle.includes('agent')) {
    basePrompt = "Professional real estate agent consultation, modern office setting, handshake with clients";
  } else if (lowerTitle.includes('costa del sol') || lowerContent.includes('spain')) {
    basePrompt = "Beautiful Costa del Sol landscape with luxury villas, Mediterranean architecture, Spanish coastline";
  } else if (lowerTitle.includes('property') || lowerTitle.includes('home')) {
    basePrompt = "Elegant modern property showcase, luxury home exterior, professional real estate photography";
  } else if (lowerTitle.includes('investment') || lowerTitle.includes('market')) {
    basePrompt = "Real estate investment concept, modern charts and graphs, property market analysis visualization";
  } else if (lowerTitle.includes('guide') || lowerTitle.includes('checklist')) {
    basePrompt = "Professional guide layout with checkmarks and steps, modern infographic style";
  }
  
  return `${basePrompt}, high quality, professional photography style, clean composition, bright lighting, suitable for blog header`;
}