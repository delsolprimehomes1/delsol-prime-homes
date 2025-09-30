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
    console.log('Starting image generation...');
    
    const { 
      blogTitle, 
      blogContent, 
      customPrompt,
      title,
      content,
      visualType = 'image',
      funnelStage,
      tags = []
    } = await req.json();
    
    // Support both old (blog) and new (article) parameter names
    const finalTitle = title || blogTitle;
    const finalContent = content || blogContent;
    
    const falApiKey = Deno.env.get('FAL_AI_API_KEY')?.trim();
    if (!falApiKey) {
      throw new Error('FAL_AI_API_KEY not configured');
    }

    // Validate API key doesn't contain invalid characters
    if (falApiKey.includes('\n') || falApiKey.includes('\r') || falApiKey !== falApiKey.trim()) {
      console.error('FAL_AI_API_KEY contains invalid characters');
      throw new Error('FAL_AI_API_KEY contains invalid characters (whitespace or newlines). Please update the secret.');
    }

    // Generate prompt based on visual type and content
    const imagePrompt = customPrompt || generatePrompt({
      title: finalTitle,
      content: finalContent,
      visualType,
      funnelStage,
      tags
    });
    
    console.log('Generated prompt:', imagePrompt);
    console.log('Visual type:', visualType);

    // Use nano-banana/edit for image generation with base template editing
    const endpoint = 'https://fal.run/fal-ai/nano-banana/edit';
    const aspectRatio = visualType === 'diagram' ? '1:1' : '16:9';
    
    // Use a neutral white canvas as base image (1x1 white pixel data URL)
    const baseImageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    console.log('Calling FAL.ai:', {
      endpoint,
      visualType,
      aspectRatio,
      apiKeyConfigured: !!falApiKey,
      apiKeyLength: falApiKey.length
    });

    const imageResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: imagePrompt,
        image_urls: [baseImageUrl],
        aspect_ratio: aspectRatio,
        guidance_scale: 3.5,
        num_inference_steps: 28,
        seed: Math.floor(Math.random() * 1000000)
      }),
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error('FAL.ai API error:', {
        status: imageResponse.status,
        statusText: imageResponse.statusText,
        errorBody: errorText,
        apiKeyLength: falApiKey.length,
        apiKeyPrefix: falApiKey.substring(0, 8) + '...',
        endpoint
      });
      throw new Error(`FAL.ai API error: ${imageResponse.status} - ${errorText.substring(0, 200)}`);
    }

    const imageData = await imageResponse.json();
    console.log('FAL.ai response received');

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

    // Generate filename based on visual type
    const timestamp = Date.now();
    const bucketName = visualType === 'diagram' || visualType === 'image' ? 'article-visuals' : 'blog-images';
    const filename = `${visualType || 'blog'}-${timestamp}.jpg`;
    const filePath = `${filename}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
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
      .from(bucketName)
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
    console.error('Error generating image:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Unknown error occurred';
    let errorDetails = '';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (errorMessage.includes('ByteString')) {
        errorDetails = 'API key configuration error. Please update your FAL_AI_API_KEY secret.';
      } else if (errorMessage.includes('FAL.ai API error')) {
        errorDetails = 'Image generation service error. Please try again.';
      } else if (errorMessage.includes('upload')) {
        errorDetails = 'Failed to save the generated image. Please try again.';
      }
    }
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage,
      details: errorDetails || errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

interface PromptParams {
  title: string;
  content: string;
  visualType: string;
  funnelStage?: string;
  tags?: string[];
}

function generatePrompt({ title, content, visualType, funnelStage, tags = [] }: PromptParams): string {
  const lowerTitle = title.toLowerCase();
  const lowerContent = content.toLowerCase();
  
  // Brand colors and styling
  const brandStyle = "DelSol Prime Homes branding, luxury real estate aesthetic, Costa del Sol Mediterranean style, professional, modern, clean";
  
  if (visualType === 'diagram') {
    // Generate diagram-specific prompts
    let diagramType = "professional infographic";
    
    if (lowerTitle.includes('process') || lowerTitle.includes('steps')) {
      diagramType = "step-by-step process diagram with numbered stages";
    } else if (lowerTitle.includes('comparison') || lowerTitle.includes('vs')) {
      diagramType = "side-by-side comparison infographic";
    } else if (lowerTitle.includes('timeline') || lowerContent.includes('when')) {
      diagramType = "timeline visualization";
    } else if (lowerTitle.includes('guide') || lowerTitle.includes('checklist')) {
      diagramType = "checklist infographic with icons";
    } else if (lowerTitle.includes('cost') || lowerTitle.includes('price')) {
      diagramType = "pricing breakdown chart";
    }
    
    return `${diagramType} about ${title}, ${brandStyle}, clean layout, easy to read, charts and icons, white background, blue and gold accents, high quality infographic design`;
  }
  
  // Generate image-specific prompts for different funnel stages
  let basePrompt = "Professional real estate photography";
  
  if (funnelStage === 'TOFU') {
    // Top of funnel: broad, aspirational imagery
    if (lowerTitle.includes('costa del sol') || tags.includes('costa-del-sol')) {
      basePrompt = "Stunning aerial view of Costa del Sol coastline, luxury villas, Mediterranean Sea, Spanish architecture";
    } else if (lowerTitle.includes('property') || lowerTitle.includes('home')) {
      basePrompt = "Beautiful luxury property exterior, modern architecture, landscaped gardens, professional real estate photography";
    } else if (lowerTitle.includes('guide') || lowerTitle.includes('tips')) {
      basePrompt = "Elegant workspace with property documents and laptop, professional real estate planning concept";
    }
  } else if (funnelStage === 'MOFU') {
    // Middle of funnel: more specific, showing details
    if (lowerTitle.includes('inspection') || lowerTitle.includes('viewing')) {
      basePrompt = "Professional real estate agent showing property details to clients, modern villa interior";
    } else if (lowerTitle.includes('investment') || lowerTitle.includes('market')) {
      basePrompt = "Modern office with property market charts and analysis, professional investment concept";
    } else if (lowerTitle.includes('area') || lowerTitle.includes('location')) {
      basePrompt = "Beautiful neighborhood street with luxury homes, Costa del Sol architecture, palm trees";
    }
  } else if (funnelStage === 'BOFU') {
    // Bottom of funnel: action-oriented, trust-building
    if (lowerTitle.includes('contact') || lowerTitle.includes('schedule')) {
      basePrompt = "Professional real estate agent in modern office, welcoming consultation setup";
    } else if (lowerTitle.includes('service') || lowerTitle.includes('team')) {
      basePrompt = "Confident real estate professionals team, modern office, Costa del Sol luxury setting";
    } else {
      basePrompt = "Professional handshake closing property deal, modern office with property keys";
    }
  }
  
  // Add real estate specific themes
  if (lowerTitle.includes('fsbo') || lowerContent.includes('for sale by owner')) {
    basePrompt = "For Sale sign outside beautiful modern home, professional real estate listing photography";
  } else if (lowerTitle.includes('realtor') || lowerTitle.includes('agent')) {
    basePrompt = "Professional real estate agent with tablet showing properties, modern office setting";
  } else if (lowerTitle.includes('villa') || lowerTitle.includes('luxury')) {
    basePrompt = "Stunning luxury villa exterior, infinity pool, Mediterranean views, sunset lighting";
  }
  
  return `${basePrompt}, ${brandStyle}, high quality, professional photography, bright natural lighting, 16:9 composition, suitable for blog header`;
}
