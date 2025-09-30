import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface DiagramPreviewProps {
  value: string;
  onChange: (value: string) => void;
}

export const DiagramPreview = ({ value, onChange }: DiagramPreviewProps) => {
  return (
    <div className="space-y-3">
      <Label>Mermaid Diagram (Optional)</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="graph TD&#10;    A[Start] --> B[Process]&#10;    B --> C[End]"
        rows={6}
        className="font-mono text-sm"
      />
      {value && (
        <Card className="p-4 bg-muted/50">
          <div className="text-sm text-muted-foreground mb-2">Preview:</div>
          <pre className="text-xs overflow-x-auto">{value}</pre>
        </Card>
      )}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Use Mermaid syntax to create flowcharts, diagrams, or visual aids for this article.
        </AlertDescription>
      </Alert>
    </div>
  );
};
