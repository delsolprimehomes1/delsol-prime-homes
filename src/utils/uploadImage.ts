import { supabase } from '@/integrations/supabase/client';
import type { SupportedLanguage } from '@/i18n';

interface UploadImageOptions {
  file: File;
  articleId?: string;
  articleType: 'qa' | 'blog';
  articleSlug: string;
  language: SupportedLanguage;
  altText: Record<string, string>;
  caption?: Record<string, string>;
  title?: string;
  description?: string;
  geoCoordinates?: {
    latitude: number;
    longitude: number;
    locationName?: string;
  };
}

interface UploadResult {
  success: boolean;
  storagePath?: string;
  publicUrl?: string;
  metadataId?: string;
  error?: string;
}

/**
 * Upload image with structured path and metadata
 * Path format: {type}/{language}/{slug}/{filename}
 * Example: qa/en/buying-process-spain/hero.jpg
 */
export async function uploadImage(options: UploadImageOptions): Promise<UploadResult> {
  const {
    file,
    articleId,
    articleType,
    articleSlug,
    language,
    altText,
    caption,
    title,
    description,
    geoCoordinates
  } = options;

  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}-${randomStr}.${fileExt}`;

    // Structured storage path
    const storagePath = `${articleType}/${language}/${articleSlug}/${filename}`;

    // Get image dimensions
    const dimensions = await getImageDimensions(file);

    // Upload to Supabase Storage
    const bucketName = 'article-visuals';
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(storagePath);

    // Create metadata record
    const { data: metadataData, error: metadataError } = await supabase
      .from('image_metadata')
      .insert({
        storage_path: `${bucketName}/${storagePath}`,
        article_id: articleId,
        article_type: articleType,
        alt_text: altText,
        caption: caption || {},
        title,
        description,
        exif_latitude: geoCoordinates?.latitude,
        exif_longitude: geoCoordinates?.longitude,
        exif_location_name: geoCoordinates?.locationName,
        width: dimensions.width,
        height: dimensions.height,
        file_size: file.size,
        mime_type: file.type,
        // AI discovery fields
        canonical_image_url: urlData.publicUrl,
        embedded_exif_status: 'pending',
        ai_citability_score: 0,
        visual_accessibility_ready: false,
        seo_optimized: false
      })
      .select()
      .single();

    if (metadataError) {
      console.error('Failed to create metadata:', metadataError);
      // Don't fail the upload, just log the error
    }

    return {
      success: true,
      storagePath: `${bucketName}/${storagePath}`,
      publicUrl: urlData.publicUrl,
      metadataId: metadataData?.id
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get image dimensions from file
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Generate multilingual alt text suggestions based on content
 */
export function generateMultilingualAltText(
  baseText: string,
  languages: SupportedLanguage[]
): Record<string, string> {
  // Start with English
  const altText: Record<string, string> = {
    en: baseText
  };

  // For now, use the same text for all languages
  // In production, you would integrate with translation API
  languages.forEach(lang => {
    if (lang !== 'en') {
      altText[lang] = baseText; // TODO: Integrate translation API
    }
  });

  return altText;
}

/**
 * Delete image and its metadata
 */
export async function deleteImage(storagePath: string): Promise<boolean> {
  try {
    // Extract bucket and path
    const pathParts = storagePath.split('/');
    const bucketName = pathParts[0];
    const filePath = pathParts.slice(1).join('/');

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (storageError) {
      throw storageError;
    }

    // Delete metadata
    const { error: metadataError } = await supabase
      .from('image_metadata')
      .delete()
      .eq('storage_path', storagePath);

    if (metadataError) {
      console.error('Failed to delete metadata:', metadataError);
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}

/**
 * Update image metadata (alt text, caption, etc.)
 */
export async function updateImageMetadata(
  storagePath: string,
  updates: Partial<{
    alt_text: Record<string, string>;
    caption: Record<string, string>;
    title: string;
    description: string;
  }>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('image_metadata')
      .update(updates)
      .eq('storage_path', storagePath);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Update error:', error);
    return false;
  }
}
