import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { runSpanishContentFix } from '@/utils/fix-spanish-translations';
import { toast } from 'sonner';

export const SpanishContentFixer = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState<any>(null);

  const handleFixSpanishContent = async () => {
    setIsFixing(true);
    try {
      await runSpanishContentFix();
      toast.success('Spanish content fixed successfully!');
      // Refresh the page or update state to show results
      window.location.reload();
    } catch (error) {
      console.error('Error fixing Spanish content:', error);
      toast.error('Failed to fix Spanish content');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🇪🇸</span>
          Spanish Content Translation Fix
        </CardTitle>
        <CardDescription>
          Fix existing Spanish articles that still contain English content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This will translate all existing Spanish articles from English to Spanish content.
            The process updates titles, content, excerpts, and slugs with proper Spanish translations.
          </AlertDescription>
        </Alert>
        
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleFixSpanishContent} 
            disabled={isFixing}
            className="flex items-center gap-2"
          >
            {isFixing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Fixing Spanish Content...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Fix Spanish Content
              </>
            )}
          </Button>
          
          <Badge variant="secondary">
            ~15 Articles to Fix
          </Badge>
        </div>

        {fixResult && (
          <div className="space-y-2">
            <h4 className="font-medium">Fix Results:</h4>
            <div className="text-sm space-y-1">
              <p>✅ Fixed: {fixResult.totalFixed} articles</p>
              {fixResult.errors.length > 0 && (
                <p>❌ Errors: {fixResult.errors.length}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};