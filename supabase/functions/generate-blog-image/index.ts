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
      tags = [],
      articleType = 'blog',
      articleSlug = 'unknown',
      language = 'en',
      geoCoordinates
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

    // Use nano-banana/edit for image generation
    const endpoint = 'https://fal.run/fal-ai/nano-banana/edit';
    const aspectRatio = visualType === 'diagram' ? '1:1' : '16:9';
    
    // Use a neutral white canvas as base image
    const baseImageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    console.log('Calling FAL.ai...');

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
      console.error('FAL.ai API error:', imageResponse.status, errorText);
      throw new Error(`FAL.ai API error: ${imageResponse.status}`);
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

    // Generate filename with structured path: {type}/{language}/{slug}/{filename}
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}-${randomStr}.jpg`;
    const storagePath = `${articleType}/${language}/${articleSlug}/${filename}`;

    console.log('Uploading to Supabase Storage:', storagePath);

    // Upload to Supabase Storage
    const bucketName = 'article-visuals';
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, imageBlob, {
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
      .getPublicUrl(storagePath);

    console.log('Image uploaded successfully:', publicUrl);

    // Create metadata record with EXIF geolocation
    const metadataPayload = {
      storage_path: `${bucketName}/${storagePath}`,
      article_type: articleType,
      alt_text: {
        en: generateAltText(finalTitle, visualType)
      },
      title: finalTitle,
      description: imagePrompt,
      exif_latitude: geoCoordinates?.latitude || 36.5100, // Costa del Sol default
      exif_longitude: geoCoordinates?.longitude || -4.8826,
      exif_location_name: geoCoordinates?.locationName || 'Costa del Sol, Málaga, Spain',
      mime_type: 'image/jpeg',
      // AI discovery fields
      canonical_image_url: publicUrl,
      embedded_exif_status: 'pending',
      ai_citability_score: 0,
      visual_accessibility_ready: false,
      seo_optimized: false
    };

    const { error: metadataError } = await supabase
      .from('image_metadata')
      .insert(metadataPayload);

    if (metadataError) {
      console.error('Failed to create metadata:', metadataError);
      // Don't fail the request, just log the error
    }

    return new Response(JSON.stringify({ 
      success: true,
      imageUrl: publicUrl,
      storagePath: `${bucketName}/${storagePath}`,
      prompt: imagePrompt,
      metadata: metadataPayload
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating image:', error);
    
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
  
  const brandStyle = "luxury real estate aesthetic, Costa del Sol Mediterranean style, professional, modern, clean, use 2025 for any dates";
  const currentYear = "2025";
  const negativePrompt = "no logos, no website URLs, no domains, no company names, no branded content, no contact information, no text overlays, no watermarks, no signs with text";
  
  if (visualType === 'diagram') {
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
    
    const yearInstructions = "IMPORTANT: Use year 2025 for all dates. If showing a report or data, display 'Property Market Analysis 2025' or 'Real Estate Data 2025'. Never use 2024 or any other year.";
    
    return `${diagramType} about ${title}, ${brandStyle}, ${yearInstructions}, clean minimal layout, easy to read, charts and icons, white background, blue and gold accents, high quality infographic design, show "${currentYear}" clearly if dates are visible, clean design without any branding elements, ${negativePrompt}`;
  }
  
  // Generate image-specific prompts for different funnel stages
  let basePrompt = "Professional real estate photography";
  
  if (funnelStage === 'TOFU') {
    if (lowerTitle.includes('costa del sol') || tags.includes('costa-del-sol')) {
      basePrompt = `Stunning aerial view of Costa del Sol coastline, luxury villas, Mediterranean Sea, Spanish architecture, modern ${currentYear} aesthetic, clean architecture without signage`;
    } else if (lowerTitle.includes('property') || lowerTitle.includes('home')) {
      basePrompt = "Beautiful luxury property exterior, modern architecture, landscaped gardens, professional real estate photography, clean exterior without any signs";
    } else if (lowerTitle.includes('guide') || lowerTitle.includes('tips')) {
      basePrompt = "Elegant workspace with property documents and laptop, professional real estate planning concept, clean desk without branded materials";
    }
  } else if (funnelStage === 'MOFU') {
    if (lowerTitle.includes('inspection') || lowerTitle.includes('viewing')) {
      basePrompt = "Professional real estate agent showing property details to clients, modern villa interior, clean professional setting";
    } else if (lowerTitle.includes('investment') || lowerTitle.includes('market')) {
      basePrompt = `Modern office with property market charts showing ${currentYear} data and analysis, professional investment concept, clean charts without branded elements`;
    } else if (lowerTitle.includes('area') || lowerTitle.includes('location')) {
      basePrompt = "Beautiful neighborhood street with luxury homes, Costa del Sol architecture, palm trees, clean street without signage";
    }
  } else if (funnelStage === 'BOFU') {
    if (lowerTitle.includes('contact') || lowerTitle.includes('schedule')) {
      basePrompt = "Professional real estate agent in modern office, welcoming consultation setup, clean office without branded materials";
    } else if (lowerTitle.includes('service') || lowerTitle.includes('team')) {
      basePrompt = "Confident real estate professionals team, modern office, Costa del Sol luxury setting, clean professional environment";
    } else {
      basePrompt = "Professional handshake closing property deal, modern office with property keys, clean setting";
    }
  }
  
  if (lowerTitle.includes('fsbo') || lowerContent.includes('for sale by owner')) {
    basePrompt = "Beautiful modern home exterior with minimal generic for sale post (no text visible), professional real estate listing photography, clean exterior";
  } else if (lowerTitle.includes('realtor') || lowerTitle.includes('agent')) {
    basePrompt = "Professional real estate agent with tablet showing properties, modern office setting, clean professional appearance";
  } else if (lowerTitle.includes('villa') || lowerTitle.includes('luxury')) {
    basePrompt = "Stunning luxury villa exterior, infinity pool, Mediterranean views, sunset lighting, pristine architecture";
  }
  
  return `${basePrompt}, ${brandStyle}, high quality, professional photography, bright natural lighting, 16:9 composition, suitable for blog header, ${currentYear} context, clean visuals without text overlays or branding, ${negativePrompt}`;
}

function generateAltText(title?: string, visualType?: string): string {
  if (visualType === 'diagram') {
    return `Diagram illustrating ${title || 'process'}`;
  }
  return `${title || 'Costa del Sol real estate'} - Professional property image`;
}
