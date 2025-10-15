import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { reorganizeQACategories, verifyReorganization } from '@/utils/reorganize-qa-categories';
import { CheckCircle, AlertCircle, Loader2, FolderSync } from 'lucide-react';

export default function QACategoryMigration() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{
    success: string[];
    failed: Array<{ id: string; error: string }>;
  } | null>(null);
  const [verification, setVerification] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runMigration = async () => {
    setIsRunning(true);
    setError(null);
    setResults(null);
    setVerification(null);

    try {
      const migrationResults = await reorganizeQACategories();
      setResults(migrationResults);

      // Automatically verify after migration
      const verificationResults = await verifyReorganization();
      setVerification(verificationResults || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Admin: QA Category Migration - Internal Tool</title>
      </Helmet>
      <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">QA Category Reorganization</h1>
          <p className="text-muted-foreground">
            This utility reorganizes QA article categories to fix duplicates and misclassifications.
          </p>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Migration Plan</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <FolderSync className="w-4 h-4 mt-0.5 text-primary" />
              <div>
                <strong>Merge "contracts" → "Legal & Process"</strong>
                <p className="text-muted-foreground">5 articles with lowercase category name</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FolderSync className="w-4 h-4 mt-0.5 text-primary" />
              <div>
                <strong>Merge "Property Types & Features" → "Property Types"</strong>
                <p className="text-muted-foreground">6 duplicate category articles</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FolderSync className="w-4 h-4 mt-0.5 text-primary" />
              <div>
                <strong>Merge "Location Intelligence" → "Location"</strong>
                <p className="text-muted-foreground">6 duplicate category articles</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FolderSync className="w-4 h-4 mt-0.5 text-primary" />
              <div>
                <strong>Move food/wine/culture from "General" → "Lifestyle"</strong>
                <p className="text-muted-foreground">13 miscategorized articles</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FolderSync className="w-4 h-4 mt-0.5 text-primary" />
              <div>
                <strong>Move food/wine from "Property Types" → "Lifestyle"</strong>
                <p className="text-muted-foreground">6 miscategorized articles</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FolderSync className="w-4 h-4 mt-0.5 text-primary" />
              <div>
                <strong>Move transport/airport to "Infrastructure"</strong>
                <p className="text-muted-foreground">2 articles from General and Finance</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FolderSync className="w-4 h-4 mt-0.5 text-primary" />
              <div>
                <strong>Move network/internet to "Infrastructure"</strong>
                <p className="text-muted-foreground">1 article from Property Types</p>
              </div>
            </div>
          </div>
        </Card>

        <Button 
          onClick={runMigration} 
          disabled={isRunning}
          size="lg"
          className="w-full mb-6"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Migration...
            </>
          ) : (
            <>
              <FolderSync className="w-4 h-4 mr-2" />
              Run Category Reorganization
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Migration Results</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">
                  Successfully updated {results.success.length} articles
                </span>
              </div>

              {results.failed.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">
                      Failed to update {results.failed.length} articles
                    </span>
                  </div>
                  <div className="bg-destructive/10 p-4 rounded-lg space-y-2 text-sm">
                    {results.failed.map(({ id, error }) => (
                      <div key={id}>
                        <strong>ID:</strong> {id}
                        <br />
                        <strong>Error:</strong> {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {verification && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Final Topic Distribution</h2>
            
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(verification)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([topic, count]) => (
                  <div key={topic} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">{topic}</span>
                    <span className="text-primary font-semibold">{count}</span>
                  </div>
                ))}
            </div>

            {!verification['contracts'] && 
             !verification['Property Types & Features'] && 
             !verification['Location Intelligence'] && (
              <Alert className="mt-6 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  ✅ All duplicate categories have been successfully merged!
                </AlertDescription>
              </Alert>
            )}
          </Card>
        )}
      </div>
      </div>
    </>
  );
}
