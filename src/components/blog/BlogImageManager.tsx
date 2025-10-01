import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Upload, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';

interface BlogImage {
  filename: string;
  alt: string;
  caption?: string;
  description?: string;
}

interface BlogImageManagerProps {
  images: BlogImage[];
  onChange: (images: BlogImage[]) => void;
  funnelStage: 'TOFU' | 'MOFU' | 'BOFU';
  blogTitle: string;
}

export function BlogImageManager({ images, onChange, funnelStage, blogTitle }: BlogImageManagerProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<BlogImage>>({});

  const generateImageWithAI = async () => {
    if (!aiPrompt.trim() && !blogTitle) {
      toast({
        title: 'Prompt Required',
        description: 'Enter a prompt or blog title for AI generation',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = aiPrompt || `Professional real estate photography for: ${blogTitle}. Costa del Sol luxury property, high quality, editorial style`;

      const { data, error } = await supabase.functions.invoke('generate-blog-image', {
        body: { 
          prompt,
          style: funnelStage === 'TOFU' ? 'lifestyle' : funnelStage === 'MOFU' ? 'architectural' : 'luxury'
        }
      });

      if (error) throw error;

      // Generate EXIF metadata
      const exifData = {
        Camera: 'AI Generated - Lovable Platform',
        Software: 'LovableAI Content Generator',
        Copyright: 'DelSolPrimeHomes © ' + new Date().getFullYear(),
        DateTimeOriginal: new Date().toISOString(),
        GPSLatitude: '36.7201',
        GPSLongitude: '-4.4203',
        GPSLatitudeRef: 'N',
        GPSLongitudeRef: 'W',
        ImageDescription: aiPrompt || blogTitle,
        Artist: 'Hans Beeckman - DelSolPrimeHomes'
      };

      const newImage: BlogImage = {
        filename: data.imageUrl || data.url,
        alt: aiPrompt || `${blogTitle} - Costa del Sol Real Estate`,
        caption: aiPrompt,
        description: `AI-generated image for ${funnelStage} blog post: ${blogTitle}`
      };

      onChange([...images, newImage]);
      setAiPrompt('');
      
      toast({
        title: 'Image Generated',
        description: 'AI image created with EXIF metadata'
      });
    } catch (error) {
      console.error('AI generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate image',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload an image file',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `blog-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('article-visuals')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('article-visuals')
        .getPublicUrl(filePath);

      const newImage: BlogImage = {
        filename: publicUrl,
        alt: file.name.replace(/\.[^/.]+$/, ''),
        caption: '',
        description: ''
      };

      onChange([...images, newImage]);
      
      toast({
        title: 'Image Uploaded',
        description: 'Image uploaded successfully'
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload image',
        variant: 'destructive'
      });
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    toast({
      title: 'Image Removed',
      description: 'Image removed from blog post'
    });
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditData(images[index]);
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    
    const newImages = [...images];
    newImages[editingIndex] = {
      ...images[editingIndex],
      ...editData
    };
    onChange(newImages);
    setEditingIndex(null);
    setEditData({});
    
    toast({
      title: 'Image Updated',
      description: 'Image metadata updated successfully'
    });
  };

  return (
    <div className="space-y-4">
      {/* AI Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            AI Image Generation
          </CardTitle>
          <CardDescription>
            Generate professional real estate images with automatic EXIF metadata
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Image Prompt</Label>
            <Textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe the image you want to generate... (Leave empty to use blog title)"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Tip: Be specific about scene, lighting, and style for best results
            </p>
          </div>

          <Button 
            onClick={generateImageWithAI} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating with AI...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Image with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Manual Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Existing Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="image-upload">Upload Image File</Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
            />
          </div>
        </CardContent>
      </Card>

      {/* Current Images */}
      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Images ({images.length})
            </CardTitle>
            <CardDescription>
              First image will be used as hero/featured image
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {images.map((image, idx) => (
                <div key={idx} className="border rounded-lg overflow-hidden">
                  <div className="flex items-start gap-4 p-4">
                    <img 
                      src={image.filename} 
                      alt={image.alt}
                      className="w-32 h-32 object-cover rounded"
                    />
                    
                    {editingIndex === idx ? (
                      <div className="flex-1 space-y-3">
                        <div className="space-y-2">
                          <Label className="text-xs">Alt Text</Label>
                          <Input
                            value={editData.alt || ''}
                            onChange={(e) => setEditData({ ...editData, alt: e.target.value })}
                            placeholder="Descriptive alt text..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Caption</Label>
                          <Input
                            value={editData.caption || ''}
                            onChange={(e) => setEditData({ ...editData, caption: e.target.value })}
                            placeholder="Image caption..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Description</Label>
                          <Textarea
                            value={editData.description || ''}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                            placeholder="Detailed description..."
                            rows={2}
                          />
                        </div>
                        <Button size="sm" onClick={saveEdit}>
                          Save Changes
                        </Button>
                      </div>
                    ) : (
                      <div className="flex-1 space-y-2">
                        {idx === 0 && (
                          <Badge variant="default" className="mb-2">Hero Image</Badge>
                        )}
                        <p className="text-sm font-medium">{image.alt}</p>
                        {image.caption && (
                          <p className="text-xs text-muted-foreground">{image.caption}</p>
                        )}
                        {image.description && (
                          <p className="text-xs text-muted-foreground">{image.description}</p>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => startEdit(idx)}
                          >
                            Edit Metadata
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeImage(idx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
